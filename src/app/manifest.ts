import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BCA - Senantiasa di Sisi Anda",
    short_name: "BCA",
    description: "Prototype revamp homepage BCA.co.id",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8fc",
    theme_color: "#005CAA",
    icons: [
      // Android / desktop install — standard icons
      { src: "/web-app-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/web-app-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Adaptive (maskable) icons — edge-to-edge, safe-zone padded
      { src: "/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
