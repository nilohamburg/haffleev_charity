import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HAFFleev Charity Festival",
    short_name: "HAFFleev",
    description: "Die offizielle App für das HAFFleev Charity Festival",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a8fe8",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
