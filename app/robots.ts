import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.okyanus.org.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/panel", "/koordinator", "/personel", "/api"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
