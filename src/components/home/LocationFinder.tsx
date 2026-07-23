"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

/** Below this, the controls+results panel sits beside the map in normal flow
 *  (today's stacked mobile card); at or above it, the map becomes the whole
 *  section's background and the panel floats over it, hero-style. Matches
 *  Tailwind's `xl:` (1280px), which every class below assumes. */
const DESKTOP_QUERY = "(min-width: 1280px)";

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
  /* `null` until the first client-side check resolves — deliberately, so the
   * server-rendered markup (which knows nothing about the visitor's viewport)
   * never has to guess and risk a hydration mismatch. Both layouts below stay
   * in the DOM at all times either way (see the render at the bottom); this
   * only decides which ONE of them actually gets to mount the map, so a
   * visitor is never running two live MapLibre instances — two WebGL
   * contexts, two tile fetches — for a section that only shows one map. */
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileIdBase = useId();
  const desktopIdBase = useId();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
      .catch(() => { })
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
        .catch(() => { });
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
        // still get an answer. Only one of these two inputs is ever actually
        // visible (see the render below) — focusing the hidden one is a no-op.
        mobileInputRef.current?.focus();
        desktopInputRef.current?.focus();
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
        navigator.geolocation.getCurrentPosition(applyPosition, () => { }, {
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
          navigator.geolocation.getCurrentPosition(applyPosition, () => { }, {
            enableHighAccuracy: false,
            timeout: 10_000,
            maximumAge: 300_000,
          });
        }
      })
      .catch(() => { });

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
    attribution: t("map.attribution"),
    yourPosition: t("map.yourPosition"),
  };

  const map = mapArmed ? (
    <LocationMap
      origin={origin}
      originIsUser={originIsUser}
      pins={data.pins}
      results={data.results}
      selectedId={selectedId}
      onSelect={setSelectedId}
      labels={mapLabels}
      // This element only ever ends up in the one slot matching the current
      // `isDesktop` value (see the mobile/desktop render below), so this is
      // never wrong for whichever breakpoint actually mounts it.
      zoomControl={isDesktop === true}
    />
  ) : (
    <div className="size-full animate-pulse bg-blue-100" />
  );

  const controlsShared = {
    originIsUser,
    pending,
    locatedArea,
    stopUsingMyLocation,
    geo,
    permission,
    primerMounted,
    primerOpen,
    requestLocation,
    closePrimer,
    primerAllow,
    query,
    setQuery,
    open,
    setOpen,
    suggestions,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    choosePlace,
    filter,
    setFilter,
  };

  const resultsShared = { originLabel, data, pending, locale, selectedId, setSelectedId };

  return (
    <div ref={sectionRef} className="relative h-full">
      {/* ================= MOBILE (< xl) — same hero-style composition as
          desktop: the map is the section's own full-bleed background, and the
          controls+heading panel (top) and the results slider (bottom) float
          over it as two separate cards, 16px in from every edge. Two cards
          rather than desktop's one, because there's no room beside the map to
          put a single tall panel on a phone-width screen the way there is
          once the map has a whole 1280px-wide section to share. ================= */}
      <div className="absolute inset-0 xl:hidden">
        {/* `z-0`, not the bare default: MapLibre's cooperative-gesture hint
            (the "use two fingers…" overlay) paints itself at z-index 99999
            *inside* this div. Without an explicit z-index here, this wrapper
            never becomes a stacking context of its own, so that 99999 escapes
            all the way up past the panels below (z-10) instead of staying
            capped under them. */}
        <div className="absolute inset-0 z-0">
          {isDesktop === false ? map : <div className="size-full animate-pulse bg-blue-100" />}
        </div>

        {/* Bottom wash — the same treatment as desktop's left gradient
            (HeroSection.tsx's own formula), just turned 90°: bottom-anchored
            and fading upward instead of left-anchored fading rightward, since
            it's the bottom of this section — where the results slider floats —
            that needs the help reading over the map here. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3"
          style={{
            background: "linear-gradient(to top, rgba(15,15,15,0.7) 0%, rgba(15,15,15,0) 100%)",
          }}
        />

        {/* Top panel — heading, then the button/search/filter controls.
            Centred and width-capped rather than a plain `inset-x-4`, so a
            sub-xl tablet viewport doesn't stretch it edge to edge the way a
            phone-width `inset-x-4` alone would. */}
        <div
          data-reveal
          // `overflow-visible`, not `-clip`: the search combobox's suggestion
          // list (see Controls below) is an absolutely-positioned child that
          // drops below this panel's own bottom edge — clipping here cut that
          // dropdown off instead of letting it float over the map like the
          // rest of this floating composition.
          className="absolute left-1/2 top-4 z-10 w-[calc(100%-32px)] max-w-[560px] -translate-x-1/2 overflow-visible rounded-2xl border border-neutral-300 bg-white shadow-[0px_8px_24px_0px_rgba(18,20,23,0.16)]"
        >
          {/* -2% kerning: 20px font-size × -0.02 = -0.4px. */}
          <h2 className="px-5 pt-5 text-xl font-semibold leading-7 tracking-[-0.4px] text-blue-800">
            {t("heading")}
          </h2>
          <Controls
            idBase={mobileIdBase}
            inputRef={mobileInputRef}
            divider={false}
            usePortal
            {...controlsShared}
          />
        </div>

        {/* Bottom composition — no enclosing card. The cards themselves are
            already opaque (see ResultCardCompact), so there is nothing an
            outer panel was adding here besides a second box the eye had to
            parse; floating them directly is one less shape on the map.
            Unlike the top panel, this wrapper isn't width-capped — the
            horizontal scroller inside is meant to bleed to the screen edges
            (its own padding stands in for the 16px margin instead), so a
            partial card peeking past the edge can still read as "more to
            scroll to" rather than being clipped by this wrapper first. */}
        <div data-reveal className="absolute inset-x-0 bottom-12 z-10">
          <ResultsSlider {...resultsShared} />
        </div>
      </div>

      {/* ================= DESKTOP (xl+) — the map hugs the panel's own
          content height instead of filling some fixed figure: the content
          column below is in *normal flow* (not `absolute`), so its real
          height — the panel plus 64px of padding above and below it — is
          what this whole section ends up being. The map and gradient wash
          are what's `absolute` here, each filling in behind whatever height
          that normal-flow column settles on (an ordinary CSS pattern: an
          absolutely-positioned background sized off a normal-flow sibling,
          not the other way around). See LocationSection.tsx's `xl:h-auto`
          for the other half of this. ================= */}
      <div className="hidden xl:relative xl:block">
        <div className="xl:absolute xl:inset-0 xl:z-0">
          {isDesktop === true ? map : <div className="size-full bg-blue-100" />}
        </div>

        {/* Left wash — identical formula to the hero banner's own left
            gradient, so this section reads as a second, later "hero moment"
            rather than a one-off treatment. */}
        <div
          aria-hidden
          className="pointer-events-none xl:absolute xl:inset-y-0 xl:left-0 xl:z-[1] xl:w-1/3"
          style={{
            background: "linear-gradient(to right, rgba(15,15,15,0.7) 0%, rgba(15,15,15,0) 100%)",
          }}
        />

        {/* Content column — centred to the same 1280px grid every other
            section on the page uses via ordinary `mx-auto` (not the
            absolute-positioned `left-1/2 -translate-x-1/2` trick — this
            column is what the map/gradient above key their height off, so it
            has to be real, height-contributing, normal-flow content, not
            something removed from the flow like they are). The panel hugs
            its own content (only ever three cards) instead of being
            stretched to some fixed height with a scrollbar nothing needs.
            `pointer-events-none` here, `pointer-events-auto` back on the
            panel below — this column is `w-[1280px]` (the full grid) but the
            visible panel only fills the left 452px of it; without this, the
            empty ~828px to its right was still an invisible box sitting at
            `z-10` over the map, silently eating every drag and wheel-zoom
            meant for it. */}
        <div className="xl:relative xl:z-10 xl:mx-auto xl:flex xl:w-[1280px] xl:flex-col xl:items-start xl:py-16 xl:pointer-events-none">
          <div
            data-reveal
            className="xl:pointer-events-auto xl:flex xl:w-[452px] xl:flex-col xl:overflow-clip xl:rounded-2xl xl:border xl:border-neutral-300 xl:bg-white xl:shadow-[0px_16px_48px_0px_rgba(18,20,23,0.28)]"
          >
            {/* -2% kerning: 24px font-size × -0.02 = -0.48px. */}
            <h2 className="xl:px-6 xl:pt-6 xl:text-2xl xl:font-semibold xl:leading-8 xl:tracking-[-0.48px] xl:text-blue-800">
              {t("heading")}
            </h2>
            <Controls idBase={desktopIdBase} inputRef={desktopInputRef} {...controlsShared} />
            <ResultsList {...resultsShared} />
          </div>
        </div>
      </div>
    </div>
  );
}

type ControlsProps = {
  idBase: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  originIsUser: boolean;
  pending: boolean;
  locatedArea: { label: string; sub: string } | null;
  stopUsingMyLocation: () => void;
  geo: GeoState;
  permission: PermissionState | null;
  primerMounted: boolean;
  primerOpen: boolean;
  requestLocation: () => void;
  closePrimer: () => void;
  primerAllow: () => void;
  query: string;
  setQuery: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  suggestions: Place[];
  activeIndex: number;
  setActiveIndex: (value: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  choosePlace: (place: Place) => void;
  filter: Filter;
  setFilter: (value: Filter) => void;
  /** Whether this instance ends in a bottom rule. Desktop's Controls is
   *  followed by ResultsList inside the same panel, so the line still marks a
   *  real boundary; mobile's is the last thing in its own floating card (see
   *  the top panel in the render below) — nothing follows it there, so the
   *  same line was just a stray mark sitting in front of the card's own
   *  rounded bottom edge. Defaults to shown, since desktop is the more common
   *  case to reach for this component without thinking about the prop. */
  divider?: boolean;
  /** Mobile's geo-primer popover must be a bottom sheet pinned to the
   *  viewport, but its button sits inside the top panel's `-translate-x-1/2`
   *  centering trick — a transform, which makes that panel a new containing
   *  block for `position: fixed` descendants and traps the sheet inside it
   *  instead of the screen. Portaling to `document.body` escapes that.
   *  Desktop's popover is a small anchored card that deliberately relies on
   *  its button's `relative` ancestor for `xl:absolute` positioning, so it
   *  stays inline. */
  usePortal?: boolean;
};

/** The button/search/filter block — one component so the mobile and desktop
 *  layouts can each mount their own instance (distinct ids, distinct input
 *  refs) without duplicating this much markup inline. Both instances share
 *  the same state from the parent; only one is ever visible at a time (see
 *  the `xl:hidden` / `hidden xl:block` split above), so there is nothing to
 *  keep in sync between them. */
function Controls({
  idBase,
  inputRef,
  originIsUser,
  pending,
  locatedArea,
  stopUsingMyLocation,
  geo,
  permission,
  primerMounted,
  primerOpen,
  requestLocation,
  closePrimer,
  primerAllow,
  query,
  setQuery,
  open,
  setOpen,
  suggestions,
  activeIndex,
  setActiveIndex,
  onKeyDown,
  choosePlace,
  filter,
  setFilter,
  divider = true,
  usePortal = false,
}: ControlsProps) {
  const t = useTranslations("lokasi");
  const listboxId = `${idBase}-listbox`;

  return (
    // No bottom padding here — the tab strip's own border (when `divider` is
    // on; see the Figma "Tab Style" spec) is meant to sit flush at the bottom
    // edge of this block, not floating above a gap of empty padding.
    <div
      className={`flex flex-col gap-4 px-5 pt-5 xl:px-6 xl:pt-6 ${divider ? "border-b border-neutral-300" : ""}`}
    >
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
          <div className="flex h-12 items-center gap-3 rounded-xl border border-cyan-500 bg-blue-100 pl-4 pr-2">
            {/* Same icon as the "Gunakan lokasi saya" button — this row is
                what that button turned into, so it keeps the same mark rather
                than switching to a different "done" glyph. */}
            <span aria-hidden className="bca-locate-icon size-6 shrink-0 bg-blue-500" />
            <span className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden">
              {pending ? (
                <span className="truncate text-base text-blue-500 opacity-70">
                  {t("locatingDetail")}
                </span>
              ) : locatedArea ? (
                <>
                  <span className="truncate text-base font-semibold text-neutral-800">
                    {locatedArea.label}
                  </span>
                  {locatedArea.sub && (
                    <span className="truncate text-sm text-neutral-600">{locatedArea.sub}</span>
                  )}
                </>
              ) : (
                <span className="truncate text-base text-blue-500 opacity-70">
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
                className="size-5"
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
            {primerMounted &&
              (() => {
                const primer = (
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
                      aria-labelledby={`${idBase}-primer-title`}
                      data-state={primerOpen ? "open" : "closing"}
                      className="geo-primer-panel fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[560px] rounded-t-2xl bg-neutral-100 p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.16)] xl:absolute xl:inset-x-auto xl:bottom-auto xl:left-0 xl:top-[calc(100%+8px)] xl:mx-0 xl:w-[340px] xl:max-w-none xl:rounded-2xl xl:p-5 xl:shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
                    >
                      <p
                        id={`${idBase}-primer-title`}
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
                );
                return usePortal ? createPortal(primer, document.body) : primer;
              })()}
          </div>
        )}

        {/* Combobox over the dataset's own kelurahan/kecamatan/kota names —
            every suggestion is somewhere we can actually answer for. */}
        <div className="relative">
          <label htmlFor={`${idBase}-input`} className="sr-only">
            {t("searchLabel")}
          </label>
          <input
            ref={inputRef}
            id={`${idBase}-input`}
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
            // `focus:outline-none` here, on purpose, unlike this section's
            // other controls: text inputs are the one element type where
            // browsers (Safari and Chrome both) draw their native focus ring
            // on *any* focus, not just `:focus-visible` keyboard focus — so a
            // mouse click was showing that ring's default blue laid directly
            // over our cyan-500 border, reading as a colour neither one of
            // them. `focus-visible:` reinstates a ring for keyboard focus
            // specifically, in the same cyan so the two never disagree.
            // `peer` lets the icon below (a sibling, not a descendant) react
            // to this input's own focus state via `peer-focus:`.
            className="peer h-12 w-full rounded-xl border border-neutral-300 bg-neutral-200 pl-12 pr-4 text-base text-neutral-800 transition-colors placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
          />
          <span
            aria-hidden
            className="bca-search-icon pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 bg-neutral-700 transition-colors peer-focus:bg-blue-500"
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
                    className={`flex w-full items-baseline gap-2 px-4 py-2.5 text-left transition-colors ${index === activeIndex ? "bg-blue-100" : "bg-white"
                      }`}
                  >
                    <span className="text-base font-semibold text-neutral-800">{place.label}</span>
                    <span className="truncate text-sm text-neutral-600">{place.sub}</span>
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

      {/* Tabs, not chips — per the Figma "Tab Style" spec (node 1700-6158):
          a shared bottom rule under the whole row, each tab a 14px label over
          a 4px indicator bar that's transparent until active rather than
          absent, so switching filters never shifts any tab's label
          vertically. */}
      <div className="flex items-center gap-2">
        {FILTERS.map((key) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className="flex h-12 cursor-pointer flex-col items-center"
            >
              <span
                className={`flex flex-1 items-center justify-center gap-1.5 px-3 text-md ${active ? "font-bold text-blue-500" : "font-semibold text-neutral-700"
                  }`}
              >
                {t(`filters.${key}`)}
              </span>
              <span
                aria-hidden
                className={`h-1 w-full rounded-t-xl bg-cyan-500 ${active ? "" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ResultsListProps = {
  originLabel: string;
  data: NearbyResponse;
  pending: boolean;
  locale: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

/** Desktop's vertical list, plus the "see all" link — split out for the same
 *  reason as `Controls`: it's mounted once per breakpoint. Mobile uses
 *  `ResultsSlider` below instead, not this — its horizontal row of cards and
 *  unenclosed layout are different enough that sharing one component meant
 *  more branching in here than the two ever had in common. */
function ResultsList({ originLabel, data, pending, locale, selectedId, setSelectedId }: ResultsListProps) {
  const t = useTranslations("lokasi");

  return (
    <div className="flex min-h-0 flex-col xl:flex-1">
      {/* Origin changes are still announced to assistive tech — just not
          printed on screen, where a repeated "Terdekat dari …" line in front
          of three cards that already say how far each one is stopped adding
          anything past the first read. */}
      <p role="status" className="sr-only">
        {t("nearestFrom", { place: originLabel })}
      </p>

      <ul
        data-pending={pending}
        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-neutral-100 p-5 pt-4 transition-opacity duration-200 data-[pending=true]:opacity-50 xl:px-6 xl:py-6"
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
            // Clicking the already-selected card deselects it, rather than
            // leaving no way back to "nothing selected" short of picking a
            // different card first.
            onSelect={() => setSelectedId(selectedId === location.id ? null : location.id)}
          />
        ))}
        {!data.results.length && (
          <li className="py-8 text-center text-sm text-neutral-600">{t("noResults")}</li>
        )}
      </ul>

      <div className="border-t border-neutral-300 px-5 py-6 xl:px-6">
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
  );
}

type ResultsSliderProps = {
  originLabel: string;
  data: NearbyResponse;
  pending: boolean;
  locale: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

/** Mobile's floating bottom composition — the horizontal card row and the
 *  "see all" CTA, with no enclosing panel around either: the cards are
 *  already opaque on their own (see `ResultCardCompact`), so a card behind the
 *  cards was one more shape than the eye needed to place on top of the map.
 *  The CTA becomes its own secondary (outlined) button rather than the plain
 *  text link `ResultsList` uses, for the same reason — floating alone, it
 *  needs a shape of its own to read as tappable over a busy map background. */
function ResultsSlider({
  originLabel,
  data,
  pending,
  locale,
  selectedId,
  setSelectedId,
}: ResultsSliderProps) {
  const t = useTranslations("lokasi");
  const listRef = useRef<HTMLUListElement>(null);

  /* Brings the selected card into view — flush against whichever edge it was
   * closer to, 16px in (see `scroll-px-4` below matching the list's own
   * `px-4`). Selection can come from the map (tapping a pin), which has no
   * bearing on this list's own scroll position, so the card the map just
   * highlighted may currently be off-screen or half-visible in the slider;
   * this is what makes sure it isn't. `"nearest"` means a card already fully
   * visible doesn't move at all — only a cut-off one gets scrolled, exactly
   * up to the point where it clears the edge it was cut off on. */
  useEffect(() => {
    if (!selectedId) return;
    const card = listRef.current?.querySelector<HTMLElement>(`[data-location-id="${selectedId}"]`);
    if (!card) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [selectedId]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Same silent announcement as ResultsList's — nothing printed, since
          the cards right below already say how far each one is. */}
      <p role="status" className="sr-only">
        {t("nearestFrom", { place: originLabel })}
      </p>

      {/* `px-4` stands in for the 16px edge margin the outer wrapper no longer
          provides (see LocationFinder.tsx) — the scroller itself bleeds full
          width so a partial card can peek past the screen edge as a "there's
          more" cue, rather than being cut off by a width-capped parent.
          `scroll-px-4` is the same 16px again, but for *scroll-snap*
          purposes specifically: `padding` alone only affects layout, not
          where a snap point or `scrollIntoView` considers "the edge" —
          without it, snapping card 1 into view landed it flush against the
          true container edge, ignoring the `px-4` entirely.
          `snap-x snap-mandatory` (paired with `snap-start` on each card, see
          ResultCardCompact) settles a swipe on the nearest card instead of
          wherever momentum happened to stop it.
          `py-4` isn't decorative spacing — `overflow-x-auto` without an
          explicit `overflow-y` forces the browser to clip *both* axes to this
          box, which was cropping every card's own drop shadow at the top and
          bottom edges. The padding gives the shadow room to render before that
          clip line. */}
      <ul
        ref={listRef}
        data-pending={pending}
        className="hide-scrollbar flex w-full snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-4 transition-opacity duration-200 [scrollbar-width:none] data-[pending=true]:opacity-100"
      >
        {data.results.map((location, index) => (
          <ResultCardCompact
            key={index}
            rank={index + 1}
            location={location}
            locale={locale}
            selected={location.id === selectedId}
            // Clicking the already-selected card deselects it, rather than
            // leaving no way back to "nothing selected" short of picking a
            // different card first.
            onSelect={() => setSelectedId(selectedId === location.id ? null : location.id)}
          />
        ))}
        {!data.results.length && (
          <li className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-white px-4 text-center text-sm text-neutral-600 shadow-[0px_8px_24px_0px_rgba(18,20,23,0.16)]">
            {t("noResults")}
          </li>
        )}
      </ul>

      <a
        href="https://www.bca.co.id/id/lokasi-bca"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 shrink-0 items-center justify-center rounded-full border border-blue-500 bg-white px-5 text-sm font-semibold text-blue-500 shadow-[0px_8px_24px_0px_rgba(18,20,23,0.16)] transition-colors hover:bg-blue-100"
      >
        {t("seeAll")}
      </a>
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
      // `[&:hover]:`, not the plain `hover:` variant: Tailwind wraps `hover:`
      // in `@media (hover: hover)` so a tap doesn't leave touch devices stuck
      // in a hover state — but that same guard reports `hover: none` under a
      // browser's responsive-design/touch-emulation mode even at a desktop
      // viewport width, which was silently swallowing this state exactly
      // there. The arbitrary variant compiles to a plain `:hover` selector,
      // so a real mouse still gets it and a touch tap still can't stick it.
      className="flex items-stretch rounded-xl border border-neutral-300 bg-neutral-100 transition-colors [&:hover]:bg-blue-100 data-[selected=true]:border-cyan-500 data-[selected=true]:bg-blue-100"
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
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-neutral-100 ${isBranch ? "bg-blue-500" : "bg-cyan-500"
            }`}
        >
          {rank}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span
              // Per the Figma "Badge Style" spec (node 1704-6230): 12px
              // SemiBold, 20px tall pill, sentence case (no uppercase/tracking
              // — "Cabang" reads as "Cabang", not "CABANG").
              className={`flex h-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold ${isBranch ? "bg-blue-300 text-blue-600" : "bg-cyan-300 text-cyan-700"
                }`}
            >
              {typeLabel}
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              {formatDistance(location.distance, locale)}
            </span>
          </span>

          <span className="line-clamp-1 text-base font-semibold text-neutral-800">{title}</span>
          {sub && <span className="line-clamp-1 text-sm text-neutral-600">{sub}</span>}
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

/** The mobile slider's card — same information as `ResultCard`, stacked
 *  vertically instead of laid out as a horizontal row, since a 200px-wide card
 *  doesn't have the room for the rank badge and the copy to sit side by side
 *  the way they do in the full-width list row. The badge moves to sit beside
 *  the type/distance line at the top of the card instead of floating to its
 *  left down the card's full height. */
function ResultCardCompact({
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
      // Read by ResultsSlider's scroll-into-view effect — lets it find this
      // card without needing a ref threaded down through the map's-eye-view
      // (a pin tap) as well as this component's own click handler.
      data-location-id={location.id}
      // `bg-white` explicitly here, not inherited from an enclosing panel —
      // this card floats directly on the map (see ResultsSlider), so it has
      // to carry its own opaque fill or the map would show straight through
      // it. Selection reads through the border alone now (no fill swap): a
      // tint this pale (blue-100) over a card already sitting on a busy map
      // looked like a stray translucent layer rather than a clear "selected".
      // `snap-start` is `scroll-snap-align`, paired with `snap-x snap-mandatory`
      // on the parent `<ul>` (see ResultsSlider) for the swipe-to-settle feel.
      // `[&:hover]:`, not `hover:` — same reasoning as ResultCard above.
      className="flex w-[220px] shrink-0 snap-start flex-col overflow-clip rounded-xl border border-neutral-300 bg-white transition-colors [&:hover]:bg-blue-100 data-[selected=true]:border-cyan-500"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 flex-col items-start gap-2 p-3 text-left"
      >
        {/* Same number as the map pin — this is what ties a card to a dot.
            Distance sits at the far end of this same row (not under it),
            level with the rank badge and type tag rather than stacked below
            them, so the numbers a visitor scans first — how far, which kind —
            read as one line. */}
        <span className="flex w-full items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-neutral-100 ${isBranch ? "bg-blue-500" : "bg-cyan-500"
                }`}
            >
              {rank}
            </span>
            <span
              // Per the Figma "Badge Style" spec (node 1704-6230): 12px
              // SemiBold, 20px tall pill, sentence case (no uppercase/tracking
              // — "Cabang" reads as "Cabang", not "CABANG").
              className={`flex h-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold ${isBranch ? "bg-blue-300 text-blue-600" : "bg-cyan-300 text-cyan-700"
                }`}
            >
              {typeLabel}
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-neutral-600">
            {formatDistance(location.distance, locale)}
          </span>
        </span>

        <span className="line-clamp-2 text-base font-semibold text-neutral-800">{title}</span>
        {sub && <span className="line-clamp-1 text-sm text-neutral-600">{sub}</span>}
        {hours && <span className="line-clamp-1 text-xs text-neutral-700">{hours}</span>}
      </button>

      {/* Text button, not the outlined pill `ResultCard` (the desktop row)
          uses — floating alone at the bottom of an already-bordered card, a
          second border here read as a box inside a box. Left-aligned under
          the copy above it rather than centred, so it reads as the last line
          of the card's own content instead of a separate footer control. */}
      <a
        href={directionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("routeLabel", { name: `${typeLabel} — ${title}` })}
        className="mx-3 mb-3 flex items-center gap-1 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-400"
      >
        {t("route")}
        <img loading="lazy" decoding="async" src="/assets/navbar/icon-arrow-diag-blue.svg" alt="" className="size-3.5" />
      </a>
    </li>
  );
}
