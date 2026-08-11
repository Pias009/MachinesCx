import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/products";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cx-ops-x7k9q2", "/account", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
