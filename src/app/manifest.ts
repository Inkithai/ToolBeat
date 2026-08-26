import type { MetadataRoute } from "next";
import { APP_NAME, TAGLINE } from "@/constants/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#090B10",
    theme_color: "#090B10",
    orientation: "any",
    categories: ["productivity", "utilities", "developer tools"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/favicon.ico", sizes: "32x32", type: "image/x-icon", purpose: "any" },
    ],
    shortcuts: [
      { name: "Format JSON", url: "/tools/json-formatter", description: "Format and validate JSON" },
      { name: "Count Words", url: "/tools/word-counter", description: "Count words and characters" },
      { name: "Convert PNG → JPG", url: "/conversion/png-to-jpg", description: "Convert image format" },
      { name: "Generate UUID", url: "/tools/uuid-generator", description: "Generate random UUIDs" },
    ],
  };
}
