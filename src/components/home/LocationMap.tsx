"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { BCA_MAP_STYLE } from "./bca-map-style";
import type { NearbyLocation } from "./location-data";

/* MapLibre's stylesheet, loaded with this chunk rather than the page: the whole
   component is behind a `next/dynamic` boundary (see LocationFinder), so a
   visitor who never scrolls this far downloads neither. */
import "maplibre-gl/dist/maplibre-gl.css";

/* Pin colours are the BCA ramps from globals.css. Kept as literals because a
   WebGL style can't read CSS custom properties. */
const BRANCH = "#005caa"; // blue-500
const ATM = "#00b5f0"; //    cyan-500
const RING = "#ffffff"; //   neutral-100

const PIN_SOURCE = "bca-pins";

export type MapLabels = {
  /** Accessible name for the map container. */
  region: string;
  zoomIn: string;
  zoomOut: string;
  /** Cooperative-gesture hints, shown over the map when a gesture is blocked. */
  ctrlZoom: string;
  cmdZoom: string;
  twoFingers: string;
  yourLocation: string;
  unavailable: string;
};

type Props = {
  origin: { lat: number; lng: number };
  /** Whether `origin` is the visitor's own position (drawn as a live dot) or a
   *  place they picked (drawn as a soft target ring). */
  originIsUser: boolean;
  pins: NearbyLocation[];
  /** The three cards, which get numbered pins tying the map to the list. */
  results: NearbyLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  labels: MapLabels;
};

function toFeatureCollection(pins: NearbyLocation[], results: NearbyLocation[]) {
  const ranks = new Map(results.map((r, i) => [r.id, i + 1]));
  return {
    type: "FeatureCollection" as const,
    features: pins.map((pin) => ({
      type: "Feature" as const,
      id: pin.id,
      geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] },
      properties: {
        id: pin.id,
        type: pin.type,
        // 0 = an ordinary nearby pin, 1-3 = one of the cards.
        rank: ranks.get(pin.id) ?? 0,
      },
    })),
  };
}

/** A dot for the origin. Built by hand rather than as a GeoJSON layer so the
 *  pulse can be a CSS animation (see `.bca-origin-*` in globals.css) instead of
 *  a per-frame WebGL repaint. */
function originElement(isUser: boolean, label: string): HTMLElement {
  const el = document.createElement("div");
  el.className = isUser ? "bca-origin bca-origin-user" : "bca-origin";
  el.setAttribute("aria-label", label);
  el.innerHTML = '<span class="bca-origin-pulse"></span><span class="bca-origin-dot"></span>';
  return el;
}

export default function LocationMap({
  origin,
  originIsUser,
  pins,
  results,
  selectedId,
  onSelect,
  labels,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const hasFittedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // `onSelect` through a ref: the map's click handler is registered once, and
  // re-registering it on every render of the parent would leak listeners.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  /* ---- create the map once ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibreMap | null = null;
    let cancelled = false;
    let styleTimeout = 0;

    (async () => {
      // MapLibre v6 is ESM-only and has no default export.
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;

      try {
        map = new maplibregl.Map({
          container,
          style: BCA_MAP_STYLE,
          center: [origin.lng, origin.lat],
          zoom: 14,
          minZoom: 4,
          maxZoom: 18,
          // A locator doesn't need a tilted or rotated camera, and both make the
          // labels harder to read.
          pitchWithRotate: false,
          dragRotate: false,
          touchZoomRotate: true,
          // The section sits mid-page. Without this, a wheel over the map eats
          // the page scroll and a one-finger drag traps the reader entirely;
          // MapLibre puts up its own hint the first time a gesture is blocked.
          cooperativeGestures: true,
          attributionControl: { compact: true },
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": labels.ctrlZoom,
            "CooperativeGesturesHandler.MacHelpText": labels.cmdZoom,
            "CooperativeGesturesHandler.MobileHelpText": labels.twoFingers,
            "AttributionControl.ToggleAttribution": "Atribusi",
            "NavigationControl.ZoomIn": labels.zoomIn,
            "NavigationControl.ZoomOut": labels.zoomOut,
          },
        });
      } catch {
        // No WebGL (old browser, blocked context, some VMs). The list below the
        // map is the whole feature; the map is the garnish.
        setFailed(true);
        return;
      }

      // Top-right so it doesn't crowd the attribution, which MapLibre pins to
      // the bottom-right and which is not ours to move.
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      // `dragRotate: false` covers the mouse; this is the touch half. Pinch to
      // zoom stays, the twist that comes with it does not — a rotated locator
      // map is disorienting and there is no compass control to undo it.
      map.touchZoomRotate.disableRotation();

      // If the style or its glyphs never arrive (OpenFreeMap unreachable, a
      // captive-portal network, an offline visitor), `load` simply never fires
      // and the panel would sit blank and unexplained. Bound the wait and say
      // so instead. Cleared below the moment `load` does fire.
      styleTimeout = window.setTimeout(() => setFailed(true), 10_000);

      map.on("load", () => {
        window.clearTimeout(styleTimeout);
        if (!map) return;

        map.addSource(PIN_SOURCE, {
          type: "geojson",
          data: toFeatureCollection(pins, results),
        });

        // Selection ring, under the dots so it reads as a halo.
        map.addLayer({
          id: "pins-selected",
          type: "circle",
          source: PIN_SOURCE,
          filter: ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 20,
            "circle-color": BRANCH,
            "circle-opacity": 0.14,
          },
        });

        // Ordinary nearby pins — small, so the three ranked ones dominate.
        map.addLayer({
          id: "pins-dot",
          type: "circle",
          source: PIN_SOURCE,
          filter: ["==", ["get", "rank"], 0],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              ["case", ["==", ["get", "type"], "cabang"], 4, 3],
              16,
              ["case", ["==", ["get", "type"], "cabang"], 7, 5.5],
            ],
            "circle-color": ["case", ["==", ["get", "type"], "cabang"], BRANCH, ATM],
            "circle-stroke-color": RING,
            "circle-stroke-width": 1.5,
          },
        });

        // The three results, sized to be unmistakable and carrying their number.
        map.addLayer({
          id: "pins-ranked",
          type: "circle",
          source: PIN_SOURCE,
          filter: [">", ["get", "rank"], 0],
          paint: {
            "circle-radius": 13,
            "circle-color": ["case", ["==", ["get", "type"], "cabang"], BRANCH, ATM],
            "circle-stroke-color": RING,
            "circle-stroke-width": 2.5,
          },
        });
        map.addLayer({
          id: "pins-rank-label",
          type: "symbol",
          source: PIN_SOURCE,
          filter: [">", ["get", "rank"], 0],
          layout: {
            "text-field": ["to-string", ["get", "rank"]],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: { "text-color": RING },
        });

        for (const layer of ["pins-dot", "pins-ranked", "pins-rank-label"]) {
          map.on("click", layer, (event) => {
            const id = event.features?.[0]?.properties?.id;
            if (typeof id === "string") onSelectRef.current(id);
          });
          map.on("mouseenter", layer, () => {
            if (map) map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layer, () => {
            if (map) map.getCanvas().style.cursor = "";
          });
        }

        originMarkerRef.current = new maplibregl.Marker({
          element: originElement(originIsUser, labels.yourLocation),
        })
          .setLngLat([origin.lng, origin.lat])
          .addTo(map);

        setReady(true);
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(styleTimeout);
      originMarkerRef.current?.remove();
      originMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Created once. Every prop below is applied by the effects that follow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- data + camera follow the origin ---- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const source = map.getSource(PIN_SOURCE) as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(pins, results));

    originMarkerRef.current?.setLngLat([origin.lng, origin.lat]);
    const element = originMarkerRef.current?.getElement();
    if (element) {
      element.className = originIsUser ? "bca-origin bca-origin-user" : "bca-origin";
      element.setAttribute("aria-label", labels.yourLocation);
    }

    // Frame the origin together with all three results, so no card points at a
    // pin that is off-screen. `maxZoom` stops a single very close result from
    // zooming into the rooftops.
    //
    // The first fit is instant. It runs the moment the style finishes loading,
    // when the map has only just appeared — animating there would read as the
    // map drifting on arrival rather than as a response to anything. Every fit
    // after that is a reply to the visitor moving the origin, and does animate.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion || !hasFittedRef.current ? 0 : 900;
    hasFittedRef.current = true;

    if (results.length) {
      const lats = [origin.lat, ...results.map((r) => r.lat)];
      const lngs = [origin.lng, ...results.map((r) => r.lng)];
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 64, maxZoom: 16, duration },
      );
    } else {
      map.easeTo({ center: [origin.lng, origin.lat], zoom: 13, duration });
    }
  }, [origin, originIsUser, pins, results, ready, labels.yourLocation]);

  /* ---- selection ---- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    map.setFilter("pins-selected", ["==", ["get", "id"], selectedId ?? ""]);

    const selected = pins.find((p) => p.id === selectedId);
    if (!selected) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({
      center: [selected.lng, selected.lat],
      zoom: Math.max(map.getZoom(), 15),
      duration: reduceMotion ? 0 : 600,
    });
  }, [selectedId, pins, ready]);

  /* Giving up swaps the container out of the DOM, which React does on its own —
     but the map instance, its WebGL context and its workers would survive that,
     attached to a node nobody can see. Tear it down explicitly. (When WebGL was
     unsupported no map was ever constructed, and this is a no-op.) */
  useEffect(() => {
    if (!failed) return;
    originMarkerRef.current?.remove();
    originMarkerRef.current = null;
    mapRef.current?.remove();
    mapRef.current = null;
  }, [failed]);

  if (failed) {
    return (
      <div className="flex size-full items-center justify-center bg-blue-100 px-6 text-center">
        <p className="text-sm text-neutral-700">{labels.unavailable}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      // Lenis owns the page's wheel events; without this it would keep smooth-
      // scrolling the page while the pointer is over the map.
      data-lenis-prevent
      role="region"
      aria-label={labels.region}
      className="size-full"
    />
  );
}
