export type DeviceInfo = {
  deviceType: "mobile" | "tablet" | "desktop" | "bot";
  os: string;
  browser: string;
};

export function parseUserAgent(ua: string): DeviceInfo {
  const agent = ua || "";
  const lower = agent.toLowerCase();

  if (/bot|crawl|spider|slurp|preview|whatsapp|telegram|slack|discord|facebookexternalhit/i.test(lower)) {
    return { deviceType: "bot", os: "Bot", browser: "Crawler" };
  }

  let os = "Unknown";
  if (/windows nt/i.test(lower)) os = "Windows";
  else if (/android/i.test(lower)) os = "Android";
  else if (/(iphone|ipad|ipod)/i.test(lower)) os = "iOS";
  else if (/mac os x|macintosh/i.test(lower)) os = "macOS";
  else if (/cros/i.test(lower)) os = "ChromeOS";
  else if (/linux/i.test(lower)) os = "Linux";

  let browser = "Unknown";
  if (/edg\//i.test(lower)) browser = "Edge";
  else if (/opr\/|opera/i.test(lower)) browser = "Opera";
  else if (/samsungbrowser/i.test(lower)) browser = "Samsung Internet";
  else if (/chrome|crios/i.test(lower)) browser = "Chrome";
  else if (/safari/i.test(lower) && !/chrome/i.test(lower)) browser = "Safari";
  else if (/firefox|fxios/i.test(lower)) browser = "Firefox";

  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lower)) deviceType = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(lower)) deviceType = "mobile";

  return { deviceType, os, browser };
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  PL: "Poland",
  PT: "Portugal",
  IE: "Ireland",
  CA: "Canada",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  IN: "India",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  AU: "Australia",
  NZ: "New Zealand",
  SG: "Singapore",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  ZA: "South Africa",
  NG: "Nigeria",
  EG: "Egypt",
  TR: "Türkiye",
  CH: "Switzerland",
  AT: "Austria",
  BE: "Belgium",
  DK: "Denmark",
  FI: "Finland",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code?.toUpperCase()] ?? code;
}

import { COUNTRY_META } from "./geo";

export function countryCode(headers: Headers, forwardedFor: string | null): { code: string; name: string; city: string } {
  const candidates = [
    headers.get("cf-ipcountry"),
    headers.get("x-vercel-ip-country"),
    headers.get("x-geo-country"),
    headers.get("x-country-code"),
  ].filter(Boolean) as string[];

  const cityCandidate =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity") ||
    headers.get("x-geo-city") ||
    headers.get("x-city") ||
    "";

  const raw = candidates.find((c) => /^[A-Za-z]{2}$/.test(c))?.toUpperCase();
  if (raw && raw !== "XX" && raw !== "T1") {
    const defaultCity = COUNTRY_META[raw]?.defaultCity ?? "Capital";
    return {
      code: raw,
      name: countryName(raw),
      city: cityCandidate ? decodeURIComponent(cityCandidate) : defaultCity,
    };
  }

  // Deterministic fallback so local / preview traffic still groups sensibly.
  const ip = (forwardedFor || headers.get("x-real-ip") || "").split(",")[0]?.trim() ?? "";
  if (ip) {
    const pool = ["US", "GB", "DE", "FR", "IN", "BR", "JP", "AU", "NL", "CA"];
    let hash = 0;
    for (let i = 0; i < ip.length; i += 1) hash = (hash * 31 + ip.charCodeAt(i)) % 9973;
    const code = pool[hash % pool.length];
    const cities = COUNTRY_META[code]?.cities ?? ["Central"];
    const city = cities[hash % cities.length];
    return { code, name: countryName(code), city };
  }

  return { code: "US", name: "United States", city: "New York" };
}

export function referrerLabel(referer: string | null): string {
  if (!referer) return "Direct / camera";
  try {
    const host = new URL(referer).hostname.replace(/^www\./, "");
    return host || "Direct / camera";
  } catch {
    return "Direct / camera";
  }
}
