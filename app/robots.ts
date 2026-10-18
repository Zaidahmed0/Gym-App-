import type { MetadataRoute } from "next";

const SITE = "https://getgainzo.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/owner", "/api", "/g/", "/set-password", "/v"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}