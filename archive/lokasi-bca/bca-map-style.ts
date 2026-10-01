import type { MapOptions } from "maplibre-gl";

/** MapLibre keeps `StyleSpecification` in a transitive dependency, so derive
 *  the accepted style type from the MapOptions package we already use. */
type StyleSpecification = Exclude<MapOptions["style"], string | undefined>;

/** OpenStreetMap raster tiles keep the archived map readable in local preview
 *  and only require the tile host already allowed by the site's CSP. */
export const BCA_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "BCA Prioritas",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    },
  },
  layers: [{ id: "osm-basemap", type: "raster", source: "osm" }],
};
