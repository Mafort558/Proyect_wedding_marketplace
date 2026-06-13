import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/bookings", "/favorites", "/messages", "/cart", "/checkout"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
