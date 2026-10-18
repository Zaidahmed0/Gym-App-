import type { MetadataRoute } from "next";

const SITE = "https://getgainzo.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/download`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/start`, changeFrequency: "monthly", priority: 0.5 },
  ];
}