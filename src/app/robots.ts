import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/s/"],
      },
    ],
    sitemap: "https://qr.altech.hub/sitemap.xml",
  };
}
