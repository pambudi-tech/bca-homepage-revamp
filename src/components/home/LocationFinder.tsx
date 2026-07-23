"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import {
  DEFAULT_ORIGIN,
  areaLine,
  directionsUrl,
  formatDistance,
  formatHours,
  locationLines,
  type NearbyLocation,
  type NearbyResponse,
  type Place,
} from "./location-data";
import type { MapLabels } from "./LocationMap";

/* MapLibre plus its stylesheet is by far the heaviest thing on this page. Two
   gates keep it off the critical path: `ssr: false` (a WebGL canvas has nothing
   to server-render) and `mapArmed` below, which waits for the section to come
   within a screen of the viewport before the chunk is even requested. */
const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false });

const FILTERS = ["all", "cabang", "atm"] as const;
type Filter = (typeof FILTERS)[number];

type Origin = { lat: number; lng: number };

type GeoState = "idle" | "locating" | "denied" | "unavailable";

type Props = {
  /** Nearest to `DEFAULT_ORIGIN`, rendered on the server so the section is
   *  populated on first paint rather than after a round trip. */
  initial: NearbyResponse;
};

/** ~11m. Finer than "which ATM is closest" needs, and it keeps a precise fix
 *  from leaving the browser. */
const round = (value: number) => Math.round(value * 1e4) / 1e4;

const sameOrigin = (a: Origin, b: Origin) => a.lat === b.lat && a.lng === b.lng;

export default function LocationFinder({ initial }: Props) {
  const t = useTranslations("lokasi");
  const locale = useLocale();

  const [origin, setOrigin] = useState<Origin>(DEFAULT_ORIGIN);
  const [originIsUser, setOriginIsUser] = useState(false);
  /** Set only when a place is picked from the search box; null means the map is
   *  still on the default origin. The visible label is derived below rather
   *  than stored, so it can never drift out of step with `originIsUser`. */
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [data, setData] = useState<NearbyResponse>(initial);
  const [pending, setPending] = useState(false);
  const [geo, setGeo] = useState<GeoState>("idle");
  /** Mirrors the browser's real geolocation permission (see the effect below).
   *  `null` until the first check resolves, or forever on a browser without
   *  the Permissions API (Safari, notably) — the denied-state hint below falls
   *  back to generic wording in that case, since there is nothing more
   *  specific to tell that visitor. */
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /* Our own priming popover, shown before the real native permission prompt.
   * `primerOpen` drives the entrance/exit animation; `primerMounted` keeps the
   * element in the DOM through the exit before unmounting, same split as the
   * HaloBCA panel (HaloBcaChat.tsx) uses. */
  const [primerOpen, setPrimerOpen] = useState(false);
  const [primerMounted, setPrimerMounted] = useState(false);

  const originLabel = originIsUser
    ? t("yourLocation")
    : (placeLabel ?? t("defaultPlace"));
  // Suggestions only ever belong to a query long enough to have produced them;
  // deriving this means a cleared field hides them without a second render.
  const suggestions = query.trim().length >= 2 ? places : [];

  /* The kelurahan/kota line shown once the visitor's own position is in use —
     see `areaLine()` for why the nearest result's own area stands in for a
     reverse-geocode. `data.results[0]` briefly still belongs to the previous
     origin while `pending` is true; the row shows a "locating…" placeholder
     for that window rather than a stale place. Absent past the 50km coverage
     radius (see MAX_RADIUS_METERS), where there is nothing to name. */
  const locatedArea =
    originIsUser && !pending && data.results[0] ? areaLine(data.results[0]) : null;

  const [mapArmed, setMapArmed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  /* ---- arm the map once the section is one screen away ---- */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setMapArmed(true);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /* ---- results follow the origin and the filter ----
     The first pass is skipped: `initial` already holds exactly this answer,
     and refetching it would spend a round trip to redraw the same three cards. */
  const isFirstQuery = useRef(true);
  useEffect(() => {
    if (isFirstQuery.current && sameOrigin(origin, DEFAULT_ORIGIN) && filter === "all") {
      isFirstQuery.current = false;
      return;
    }
    isFirstQuery.current = false;

    const controller = new AbortController();
    setPending(true);

    fetch("/api/locations/nearby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: origin.lat, lng: origin.lng, type: filter }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((next: NearbyResponse) => {
        setData(next);
        setSelectedId(null);
      })
      // A failed query keeps the previous three cards rather than blanking the
      // list — stale-but-plausible beats empty for a locator, and the visitor
      // can retry by moving the origin.
      .catch(() => {})
      .finally(() => {
        // An abort means the next query is already in flight and has set
        // `pending` itself; clearing it here would flicker the list back.
        if (!controller.signal.aborted) setPending(false);
      });

    return () => controller.abort();
  }, [origin, filter]);

  /* ---- place suggestions ---- */
  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    // Typing is faster than the round trip; only the last keystroke matters.
    const timer = window.setTimeout(() => {
      fetch(`/api/locations/places?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then(({ places: found }: { places: Place[] }) => {
          setPlaces(found);
          setActiveIndex(-1);
        })
        .catch(() => {});
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  /* ---- geolocation ---- */
  const applyPosition = useCallback((position: GeolocationPosition) => {
    setOrigin({
      lat: round(position.coords.latitude),
      lng: round(position.coords.longitude),
    });
    setOriginIsUser(true);
    setGeo("idle");
    setQuery("");
    setOpen(false);
  }, []);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeo("unavailable");
      return;
    }
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      applyPosition,
      (error) => {
        setGeo(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
        // Denied is a dead end for this control; put the visitor where they can
        // still get an answer.
        inputRef.current?.focus();
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, [applyPosition]);

  /* Exit animation for the priming popover — keeps it mounted through the
   * 240ms `geo-primer-*-out` transition (see globals.css) before it leaves the
   * DOM, instead of vanishing mid-animation. */
  const PRIMER_CLOSE_MS = 240;
  const closePrimer = useCallback(() => setPrimerOpen(false), []);
  useEffect(() => {
    if (primerOpen || !primerMounted) return;
    const id = window.setTimeout(() => setPrimerMounted(false), PRIMER_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [primerOpen, primerMounted]);

  useEffect(() => {
    if (!primerMounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePrimer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [primerMounted, closePrimer]);

  /*
   * Clicking "Gunakan lokasi saya" branches on what the browser already knows:
   *
   * - "denied" — the browser has this permanently blocked and will refuse
   *   silently; calling the API again can only fail the same way, so there is
   *   nothing to gain from asking. Straight to the hint that says where to
   *   fix it (see the `permissionBlocked` copy below).
   * - "granted" — already allowed from an earlier visit; calling the API
   *   resolves immediately with no browser UI at all, so our own popover
   *   asking permission first would be asking a question that has no browser
   *   prompt behind it.
   * - anything else ("prompt", or `null`/unsupported on browsers without the
   *   Permissions API, e.g. Safari) — this is the one path where clicking
   *   through *will* spend the browser's real, one-shot native prompt. Ask
   *   with our own popover first, so a visitor who isn't ready yet can back
   *   out without using it up: choosing "Nanti" here never calls the
   *   geolocation API, so the browser's permission never moves off "Ask".
   */
  const requestLocation = () => {
    if (permission === "denied") {
      setGeo("denied");
      return;
    }
    if (permission === "granted") {
      locate();
      return;
    }
    setPrimerMounted(true);
    setPrimerOpen(true);
  };

  const primerAllow = () => {
    closePrimer();
    locate();
  };

  /*
   * Tracks the browser's own geolocation permission live, via the Permissions
   * API's `change` event — not just once on mount.
   *
   * Neither of the two things a page might want here is possible through any
   * web API: a site cannot reset its own permission back to "Ask", and once a
   * visitor has denied it, no API can make the browser show that native prompt
   * again. Both are deliberate platform restrictions (Chrome, Firefox and
   * Safari all enforce them) — otherwise any page could reset itself and
   * re-prompt until the visitor gave in.
   *
   * What *is* on the platform is this listener. The only way back to "granted"
   * is the visitor opening the browser's own site settings (the lock/info icon
   * in the address bar) and flipping it themselves — and the moment they do,
   * `change` fires. Reacting to it here means the section notices immediately
   * and fetches a fix right away, with no reload and no second click needed.
   */
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let cancelled = false;
    let status: PermissionStatus | undefined;

    const onChange = () => {
      if (!status) return;
      setPermission(status.state);
      if (status.state === "granted") {
        navigator.geolocation.getCurrentPosition(applyPosition, () => {}, {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 300_000,
        });
      }
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setPermission(result.state);
        status.addEventListener("change", onChange);
        // Silent reuse on first mount, same as before — only when already
        // granted, so nobody gets a prompt they didn't ask for.
        if (result.state === "granted") {
          navigator.geolocation.getCurrentPosition(applyPosition, () => {}, {
            enableHighAccuracy: false,
            timeout: 10_000,
            maximumAge: 300_000,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      status?.removeEventListener("change", onChange);
    };
  }, [applyPosition]);

  /** Forgets the device fix and puts the button back — this is a UI reset, not
   *  an OS permission revocation (a page can't do that); the wording below is
   *  careful to say "stop using", not "revoke access". */
  const stopUsingMyLocation = () => {
    setOrigin(DEFAULT_ORIGIN);
    setOriginIsUser(false);
    setPlaceLabel(null);
    setGeo("idle");
  };

  const choosePlace = (place: Place) => {
    setOrigin({ lat: place.lat, lng: place.lng });
    setOriginIsUser(false);
    setPlaceLabel(place.label);
    setQuery(place.label);
    setOpen(false);
    setGeo("idle");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      const place = suggestions[activeIndex] ?? suggestions[0];
      if (place) {
        event.preventDefault();
        choosePlace(place);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const mapLabels: MapLabels = {
    region: t("map.region"),
    zoomIn: t("map.zoomIn"),
    zoomOut: t("map.zoomOut"),
    ctrlZoom: t("map.ctrlZoom"),
    cmdZoom: t("map.cmdZoom"),
    twoFingers: t("map.twoFingers"),
    yourLocation: originIsUser ? t("yourLocation") : originLabel,
    unavailable: t("map.unavailable"),
  };

  /* Desktop height is sized to fit all three cards without scrolling even when
     they carry opening hours (the tallest variant); `overflow-y-auto` on the
     list is the safety valve, not the plan. Mobile stacks: controls, map,
     cards — which is why the three blocks below are placed explicitly on the
     desktop grid rather than nested into two columns. */
  return (
    <div
      ref={sectionRef}
      data-reveal
      className="mt-6 grid overflow-clip rounded-2xl border border-neutral-300 bg-white shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)] xl:mt-10 xl:h-[640px] xl:grid-cols-[452px_minmax(0,1fr)] xl:grid-rows-[auto_minmax(0,1fr)]"
    >
      {/* ---------- controls ---------- */}
      <div className="flex flex-col gap-4 border-b border-neutral-300 p-5 xl:col-start-1 xl:row-start-1 xl:p-6">
        <div className="flex flex-col gap-3">
          {/* Once the visitor's own position is in use, clicking already did
              the thing — a button sitting there still saying "Use my
              location" reads as an unactioned prompt next to results that are
              already theirs. It becomes a confirmation row instead, shaped
              like a search suggestion (bold label + muted sub) since that is
              the same kind of information: "here is the place this answer is
              anchored to". The only control left in it is the one that
              actually does something from here — stop using it. */}
          {originIsUser ? (
            <div className="flex h-12 items-center gap-3 rounded-xl border border-blue-400 bg-blue-100 pl-4 pr-2">
              <span aria-hidden className="bca-located-icon size-5 shrink-0 bg-blue-500" />
              <span className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden">
                <span className="shrink-0 text-sm font-semibold text-blue-500">
                  {t("yourLocationPrefix")}
                </span>
                {pending ? (
                  <span className="truncate text-sm text-blue-500 opacity-70">
                    {t("locatingDetail")}
                  </span>
                ) : locatedArea ? (
                  <>
                    <span className="truncate text-sm font-semibold text-neutral-800">
                      {locatedArea.label}
                    </span>
                    {locatedArea.sub && (
                      <span className="truncate text-xs text-neutral-600">{locatedArea.sub}</span>
                    )}
                  </>
                ) : (
                  <span className="truncate text-sm text-blue-500 opacity-70">
                    {t("locatedAreaUnknown")}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={stopUsingMyLocation}
                aria-label={t("stopUsingLocation")}
                className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-blue-200"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/assets/cycle1/outline-close.svg"
                  alt=""
                  className="size-4"
                />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={requestLocation}
                disabled={geo === "locating"}
                // Only true while a click here would actually open our popover
                // (see `requestLocation`) — for "granted"/"denied" it goes
                // straight to a fetch or a hint instead, and claiming a popup
                // in those cases would be describing a control that isn't there.
                aria-haspopup={permission === "granted" || permission === "denied" ? undefined : "dialog"}
                aria-expanded={
                  permission === "granted" || permission === "denied" ? undefined : primerMounted
                }
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-500 px-5 text-base font-semibold text-neutral-100 transition-colors duration-200 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-70"
              >
                <span
                  aria-hidden
                  data-spinning={geo === "locating"}
                  className="bca-locate-icon size-5 shrink-0 bg-neutral-100"
                />
                {geo === "locating" ? t("locating") : t("useMyLocation")}
              </button>

              {/* Our own priming popover — asks before the real browser prompt
                  does, so "Nanti" can back out without spending it (see
                  `requestLocation` above). Mobile: bottom sheet with a scrim,
                  matching the HaloBCA entry panel's responsive split
                  (HaloBcaChat.tsx). Desktop: anchored card under the button,
                  no scrim — same reasoning as that panel: this is a section-
                  level choice, not one that needs to dim the whole page. */}
              {primerMounted && (
                <>
                  <div
                    aria-hidden
                    data-state={primerOpen ? "open" : "closing"}
                    onClick={closePrimer}
                    className="geo-primer-scrim fixed inset-0 z-[65] bg-neutral-900/40 xl:hidden"
                  />
                  <div
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby={`${listboxId}-primer-title`}
                    data-state={primerOpen ? "open" : "closing"}
                    className="geo-primer-panel fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[560px] rounded-t-2xl bg-neutral-100 p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.16)] xl:absolute xl:inset-x-auto xl:bottom-auto xl:left-0 xl:top-[calc(100%+8px)] xl:mx-0 xl:w-[340px] xl:max-w-none xl:rounded-2xl xl:p-5 xl:shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
                  >
                    <p
                      id={`${listboxId}-primer-title`}
                      className="text-base font-bold leading-6 text-neutral-800"
                    >
                      {t("primer.title")}
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-neutral-700">
                      {t("primer.body")}
                    </p>
                    <div className="mt-5 flex gap-2.5">
                      <button
                        type="button"
                        onClick={closePrimer}
                        className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-neutral-400 bg-neutral-100 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-600 hover:text-neutral-800"
                      >
                        {t("primer.notNow")}
                      </button>
                      <button
                        type="button"
                        onClick={primerAllow}
                        className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-blue-500 text-sm font-semibold text-neutral-100 transition-colors hover:bg-blue-600"
                      >
                        {t("primer.allow")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Combobox over the dataset's own kelurahan/kecamatan/kota names —
              every suggestion is somewhere we can actually answer for. */}
          <div className="relative">
            <label htmlFor={`${listboxId}-input`} className="sr-only">
              {t("searchLabel")}
            </label>
            <input
              ref={inputRef}
              id={`${listboxId}-input`}
              type="text"
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={open && suggestions.length > 0}
              // Only while the list exists — pointing at an absent id is a
              // dangling reference for a screen reader.
              aria-controls={open && suggestions.length > 0 ? listboxId : undefined}
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
              }
              value={query}
              placeholder={t("searchPlaceholder")}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 120)}
              onKeyDown={onKeyDown}
              // No `outline-none`: the border/background change reads as focus
              // for a pointer user, but a keyboard user needs the ring, and
              // every other control in this section keeps the browser default.
              className="h-12 w-full rounded-xl border border-neutral-300 bg-neutral-200 pl-11 pr-4 text-base text-neutral-800 transition-colors placeholder:text-neutral-600 focus:border-blue-400 focus:bg-white"
            />
            <span
              aria-hidden
              className="bca-search-icon pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 bg-neutral-600"
            />

            {open && suggestions.length > 0 && (
              <ul
                id={listboxId}
                role="listbox"
                className="absolute inset-x-0 top-[calc(100%+4px)] z-20 overflow-clip rounded-xl border border-neutral-300 bg-white py-1 shadow-[0px_8px_24px_0px_rgba(18,20,23,0.12)]"
              >
                {suggestions.map((place, index) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      // The input keeps focus, so this has to fire before blur
                      // closes the list.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choosePlace(place)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-baseline gap-2 px-4 py-2.5 text-left transition-colors ${
                        index === activeIndex ? "bg-blue-100" : "bg-white"
                      }`}
                    >
                      <span className="text-sm font-semibold text-neutral-800">
                        {place.label}
                      </span>
                      <span className="truncate text-xs text-neutral-600">{place.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* The Permissions API distinguishes a real, browser-remembered block
            (`permission === "denied"`) from a one-off failure that just happened
            to report the same error code — a stale GPS fix timing out reads
            identically to a deny at the `getCurrentPosition` callback. Only
            the former gets the "go change it in your browser" instruction;
            anything else gets the plain retry hint. */}
        {geo === "denied" && (
          <Hint>{permission === "denied" ? t("permissionBlocked") : t("permissionDenied")}</Hint>
        )}
        {geo === "unavailable" && <Hint>{t("positionUnavailable")}</Hint>}

        <div className="flex gap-2">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`flex h-10 items-center rounded-lg border px-4 text-sm transition-colors ${
                filter === key
                  ? "border-cyan-500 bg-cyan-100 font-bold text-blue-500"
                  : "border-neutral-300 bg-white font-semibold text-neutral-700 hover:bg-blue-100"
              }`}
            >
              {t(`filters.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- map ---------- */}
      <div className="relative h-[280px] border-b border-neutral-300 bg-blue-100 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:h-auto xl:border-b-0 xl:border-l">
        {mapArmed ? (
          <LocationMap
            origin={origin}
            originIsUser={originIsUser}
            pins={data.pins}
            results={data.results}
            selectedId={selectedId}
            onSelect={setSelectedId}
            labels={mapLabels}
          />
        ) : (
          <div className="size-full animate-pulse bg-blue-100" />
        )}
      </div>

      {/* ---------- results ---------- */}
      <div className="flex min-h-0 flex-col xl:col-start-1 xl:row-start-2">
        {/* The announcement for the whole panel. Marking this line rather than
            the list means a screen reader hears "Terdekat dari Kelapa Gading"
            when the origin moves, instead of all three cards being re-read. */}
        <p
          role="status"
          className="px-5 pt-5 text-xs font-semibold uppercase tracking-[1.8px] text-neutral-600 xl:px-6"
        >
          {t("nearestFrom", { place: originLabel })}
        </p>

        <ul
          data-pending={pending}
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-5 transition-opacity duration-200 data-[pending=true]:opacity-50 xl:px-6 xl:py-4"
        >
          {data.results.map((location, index) => (
            <ResultCard
              // Keyed by slot: the three nodes persist across queries, so the
              // list swaps contents instead of remounting.
              key={index}
              rank={index + 1}
              location={location}
              locale={locale}
              selected={location.id === selectedId}
              onSelect={() => setSelectedId(location.id)}
            />
          ))}
          {!data.results.length && (
            <li className="py-8 text-center text-sm text-neutral-600">{t("noResults")}</li>
          )}
        </ul>

        <div className="border-t border-neutral-300 px-5 py-4 xl:px-6">
          <a
            href="https://www.bca.co.id/id/lokasi-bca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-base font-semibold text-blue-500 transition-transform hover:translate-x-0.5"
          >
            {t("seeAll")}
            <img
              loading="lazy"
              decoding="async"
              src="/assets/navbar/icon-arrow-blue.svg"
              alt=""
              className="size-5"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="text-sm leading-5 text-neutral-700">
      {children}
    </p>
  );
}

function ResultCard({
  rank,
  location,
  locale,
  selected,
  onSelect,
}: {
  rank: number;
  location: NearbyLocation;
  locale: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("lokasi");
  const { title, sub } = locationLines(location);
  const hours = formatHours(location.hours, locale);
  const typeLabel = t(`type.${location.type}`);
  const isBranch = location.type === "cabang";

  return (
    <li
      data-selected={selected}
      className="flex items-stretch rounded-xl border border-neutral-300 transition-colors data-[selected=true]:border-blue-400 data-[selected=true]:bg-blue-100"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-start gap-3 p-3 text-left"
      >
        {/* Same number as the map pin — this is what ties a card to a dot. */}
        <span
          aria-hidden
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-neutral-100 ${
            isBranch ? "bg-blue-500" : "bg-cyan-500"
          }`}
        >
          {rank}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.5px] ${
                isBranch ? "bg-blue-200 text-blue-700" : "bg-cyan-300 text-blue-700"
              }`}
            >
              {typeLabel}
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              {formatDistance(location.distance, locale)}
            </span>
          </span>

          <span className="line-clamp-1 text-sm font-semibold text-neutral-800">{title}</span>
          {sub && <span className="line-clamp-1 text-xs text-neutral-600">{sub}</span>}
          {hours && <span className="text-xs text-neutral-700">{hours}</span>}
        </span>
      </button>

      <a
        href={directionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("routeLabel", { name: `${typeLabel} — ${title}` })}
        className="m-3 flex shrink-0 items-center gap-1 self-center rounded-full border border-blue-500 px-3 py-2 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-100"
      >
        {t("route")}
      </a>
    </li>
  );
}
