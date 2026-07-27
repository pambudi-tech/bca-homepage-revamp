import type { MapOptions } from "maplibre-gl";

/** MapLibre keeps `StyleSpecification` in `@maplibre/maplibre-gl-style-spec`,
 *  which reaches us only as a transitive dependency — so the type is derived
 *  from the one package we actually depend on instead. */
type StyleSpecification = Exclude<MapOptions["style"], string | undefined>;

/* BCA daylight — the basemap for the Lokasi BCA section.
 *
 * Authored here rather than pulled from a hosted style. OpenFreeMap serves the
 * vector tiles (OpenMapTiles schema), the sprite and the glyphs, but the
 * cartography is ours: the palette is built from the BCA ramps in globals.css,
 * and the layer list is deliberately short. Two reasons for writing it out:
 *
 *   1. Branding — a stock style would drop OSM's own greys and greens into a
 *      page whose entire surface is blue-100.
 *   2. Scope — this map exists to show BCA ATMs and branches. Every POI layer
 *      is simply absent, so no competing bank, café or shop icon can ever
 *      appear next to our pins. That is a property of the style, not something
 *      toggled off at runtime.
 *
 * Attribution is mandatory and is rendered by the map's AttributionControl
 * (see LocationMap.tsx) — OpenFreeMap, OpenMapTiles and OpenStreetMap.
 */

const TILES = "https://tiles.openfreemap.org/planet";
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

/* Palette. Named tokens are the BCA ramps verbatim; the few marked "derived"
   are blends between two of them, because a basemap needs steps between
   neighbours that the UI ramp never has to draw. */
const C = {
  land: "#f4f8fc", //           blue-100
  landResidential: "#eef4fa", // derived: blue-100 → neutral-300
  green: "#e6efe7", //          derived, the one non-ramp hue: parks have to
  //                            read as parks, so they keep a trace of green.
  water: "#d1eaff", //          blue-300
  waterway: "#b9ddf7", //       derived: blue-300 deepened
  building: "#e9ecef", //       neutral-300
  road: "#ffffff", //           neutral-100
  roadCasing: "#dfe0e2", //     neutral-400
  motorwayCasing: "#cfcfcf", // neutral-500
  rail: "#dfe0e2", //           neutral-400
  boundary: "#cfcfcf", //       neutral-500
  labelStrong: "#26292c", //    neutral-800
  label: "#495057", //          neutral-700
  labelMuted: "#868e96", //     neutral-600
  labelWater: "#1179d1", //     blue-400
  halo: "#ffffff", //           neutral-100
} as const;

const REGULAR = ["Noto Sans Regular"];
const BOLD = ["Noto Sans Bold"];

/** Place labels come back in the local language already; `name:latin` is the
 *  fallback for anywhere the primary name isn't Latin script.
 *  Annotated as an exact tuple — inferred, it widens to `(string | string[])[]`
 *  and stops matching MapLibre's expression types. */
const NAME: ["coalesce", ["get", "name:latin"], ["get", "name"]] = [
  "coalesce",
  ["get", "name:latin"],
  ["get", "name"],
];

export const BCA_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "BCA Daylight",
  glyphs: GLYPHS,
  sources: {
    openmaptiles: { type: "vector", url: TILES },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": C.land } },

    {
      id: "landuse-residential",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landuse",
      maxzoom: 16,
      filter: ["==", ["get", "class"], "residential"],
      paint: {
        "fill-color": C.landResidential,
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.7, 12, 1],
      },
    },
    {
      id: "landcover-green",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["wood", "grass", "farmland"]]],
      paint: {
        "fill-color": C.green,
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 12, 1],
      },
    },
    {
      id: "park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      paint: { "fill-color": C.green },
    },

    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      filter: ["!=", ["get", "brunnel"], "tunnel"],
      paint: { "fill-color": C.water, "fill-antialias": true },
    },
    {
      id: "waterway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "waterway",
      minzoom: 9,
      paint: {
        "line-color": C.waterway,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 16, 3],
      },
    },

    {
      id: "building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13,
      paint: {
        "fill-color": C.building,
        // Faded in rather than switched on, so zooming past 13 doesn't snap.
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 15, 0.9],
      },
    },

    /* Roads. Each class is a casing line under a fill line — the casing is what
       separates a white road from white-ish land. Widths interpolate on an
       exponential base, the usual curve for road hierarchies: they stay hairline
       when zoomed out and open up quickly past z14. */
    {
      id: "road-rail",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 11,
      filter: ["==", ["get", "class"], "rail"],
      paint: {
        "line-color": C.rail,
        "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 11, 0.5, 18, 2.5],
        "line-dasharray": [3, 2],
      },
    },
    {
      id: "road-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["minor", "service", "track", "path"]],
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.road,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.5, 18, 8],
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13.5, 1],
      },
    },
    {
      id: "road-secondary-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 9,
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.roadCasing,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 9, 1.5, 18, 14],
      },
    },
    {
      id: "road-secondary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 9,
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.road,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 9, 0.5, 18, 11],
      },
    },
    {
      id: "road-primary-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 7,
      filter: ["in", ["get", "class"], ["literal", ["primary", "trunk"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.roadCasing,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 7, 1.5, 18, 18],
      },
    },
    {
      id: "road-primary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 7,
      filter: ["in", ["get", "class"], ["literal", ["primary", "trunk"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.road,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 7, 0.5, 18, 14],
      },
    },
    {
      id: "road-motorway-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["==", ["get", "class"], "motorway"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.motorwayCasing,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1, 18, 22],
      },
    },
    {
      id: "road-motorway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["==", ["get", "class"], "motorway"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": C.road,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.5, 18, 17],
      },
    },

    {
      id: "boundary-country",
      type: "line",
      source: "openmaptiles",
      "source-layer": "boundary",
      filter: ["<=", ["get", "admin_level"], 2],
      paint: {
        "line-color": C.boundary,
        "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.8, 12, 2],
      },
    },
    {
      id: "boundary-region",
      type: "line",
      source: "openmaptiles",
      "source-layer": "boundary",
      minzoom: 6,
      filter: ["==", ["get", "admin_level"], 4],
      paint: {
        "line-color": C.boundary,
        "line-width": 1,
        "line-dasharray": [4, 3],
        "line-opacity": 0.7,
      },
    },

    /* Labels. Roads first so place names, which matter more for orientation,
       are the ones that survive collision. */
    {
      id: "label-road",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "transportation_name",
      minzoom: 14,
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["motorway", "trunk", "primary", "secondary"]],
      ],
      layout: {
        "symbol-placement": "line",
        "text-field": NAME,
        "text-font": REGULAR,
        "text-size": ["interpolate", ["linear"], ["zoom"], 14, 10, 18, 13],
        "text-letter-spacing": 0.02,
      },
      paint: {
        "text-color": C.labelMuted,
        "text-halo-color": C.halo,
        "text-halo-width": 1.5,
      },
    },
    {
      id: "label-water",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "water_name",
      minzoom: 8,
      layout: {
        "text-field": NAME,
        "text-font": REGULAR,
        "text-size": 11,
        "text-max-width": 6,
      },
      paint: {
        "text-color": C.labelWater,
        "text-halo-color": C.halo,
        "text-halo-width": 1.5,
        "text-opacity": 0.9,
      },
    },
    {
      id: "label-place-small",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 12,
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["suburb", "neighbourhood", "quarter", "village"]],
      ],
      layout: {
        "text-field": NAME,
        "text-font": REGULAR,
        "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 13],
        "text-max-width": 8,
        "text-letter-spacing": 0.04,
      },
      paint: {
        "text-color": C.label,
        "text-halo-color": C.halo,
        "text-halo-width": 1.75,
      },
    },
    {
      id: "label-place-town",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      maxzoom: 15,
      filter: ["in", ["get", "class"], ["literal", ["town", "city"]]],
      layout: {
        "text-field": NAME,
        "text-font": BOLD,
        "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 14, 16],
        "text-max-width": 8,
      },
      paint: {
        "text-color": C.labelStrong,
        "text-halo-color": C.halo,
        "text-halo-width": 2,
      },
    },
    {
      id: "label-country",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      maxzoom: 8,
      filter: ["==", ["get", "class"], "country"],
      layout: {
        "text-field": NAME,
        "text-font": BOLD,
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 11, 7, 15],
        "text-letter-spacing": 0.1,
        "text-transform": "uppercase",
      },
      paint: {
        "text-color": C.labelMuted,
        "text-halo-color": C.halo,
        "text-halo-width": 2,
      },
    },
  ],
};
