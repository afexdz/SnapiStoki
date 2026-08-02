import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PixRaise",
    short_name: "PixRaise",
    description:
      "La marketplace créative algérienne — freelances & produits digitaux.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#FA8112",
    background_color: "#FFF8F0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon.png",     sizes: "512x512",  type: "image/png", purpose: "any" },
      { src: "/icon.png",     sizes: "512x512",  type: "image/png", purpose: "maskable" },
    ],
  };
}
