import type { MetadataRoute } from "next";

const BASE = "https://qr.altech.hub";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/create`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/dashboard`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/dashboard/bulk`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
