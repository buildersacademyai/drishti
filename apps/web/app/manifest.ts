import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Drishti — Vector Surveillance",
    short_name: "Drishti",
    description: "Satellite-to-drone dengue prevention for climate-vulnerable communities.",
    start_url: "/dashboard/map",
    display: "standalone",
    background_color: "#f8f7f4",
    theme_color: "#1e3a5f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
