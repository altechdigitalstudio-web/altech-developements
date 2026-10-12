import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { scans } from "@/db/schema";
import type { QrCode } from "@/db/schema";
import { countryName } from "@/lib/device";
import { getCityCoordinates, getCountryCoordinates, getCountryCodeBadge } from "@/lib/geo";

export type CodeAnalytics = Awaited<ReturnType<typeof getAnalytics>>;

export async function getAnalytics(row: QrCode, days = 30) {
  const span = Math.max(1, Math.min(365, days));
  const since = new Date(Date.now() - span * 24 * 60 * 60 * 1000);
  const scope = and(eq(scans.qrCodeId, row.id), gte(scans.createdAt, since));

  const [totals, timeline, byDevice, byOs, byCountry, byCity, byReferrer, byHour, recent] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        first: sql<string | null>`min(to_char(${scans.createdAt}, 'YYYY-MM-DD'))`,
      })
      .from(scans)
      .where(eq(scans.qrCodeId, row.id)),
    db
      .select({ day: sql<string>`to_char(${scans.createdAt}, 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
      .from(scans)
      .where(scope)
      .groupBy(sql`to_char(${scans.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${scans.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({ key: scans.deviceType, count: sql<number>`count(*)::int` })
      .from(scans)
      .where(scope)
      .groupBy(scans.deviceType)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({ key: scans.os, count: sql<number>`count(*)::int` })
      .from(scans)
      .where(scope)
      .groupBy(scans.os)
      .orderBy(desc(sql`count(*)`))
      .limit(6),
    db
      .select({ key: scans.country, count: sql<number>`count(*)::int` })
      .from(scans)
      .where(scope)
      .groupBy(scans.country)
      .orderBy(desc(sql`count(*)`))
      .limit(12),
      db
        .select({
          country: scans.country,
          city: scans.city,
          count: sql<number>`count(*)::int`,
        })
        .from(scans)
        .where(scope)
        .groupBy(scans.country, scans.city)
        .orderBy(desc(sql`count(*)`))
        .limit(16),
      db
        .select({ key: scans.referrer, count: sql<number>`count(*)::int` })
        .from(scans)
        .where(scope)
        .groupBy(scans.referrer)
        .orderBy(desc(sql`count(*)`))
        .limit(6),
      db
        .select({ hour: sql<number>`extract(hour from ${scans.createdAt})::int`, count: sql<number>`count(*)::int` })
        .from(scans)
        .where(scope)
        .groupBy(sql`extract(hour from ${scans.createdAt})`)
        .orderBy(sql`extract(hour from ${scans.createdAt})`),
      db
        .select()
        .from(scans)
        .where(eq(scans.qrCodeId, row.id))
        .orderBy(desc(scans.createdAt))
        .limit(24),
    ]);

  const buckets = new Map(timeline.map((t) => [t.day, t.count]));
  const series: { day: string; label: string; count: number }[] = [];
  for (let i = span - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    series.push({
      day: key,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: buckets.get(key) ?? 0,
    });
  }

  const hours = new Array(24).fill(0) as number[];
  byHour.forEach((h) => {
    if (h.hour >= 0 && h.hour < 24) hours[h.hour] = h.count;
  });

  const rangeTotal = series.reduce((sum, point) => sum + point.count, 0);
  const allTime = totals[0]?.count ?? 0;
  const previous = Math.max(0, allTime - rangeTotal);
  const delta = previous > 0 ? Math.round(((rangeTotal - previous) / previous) * 100) : rangeTotal > 0 ? 100 : 0;

  const enrichedLocations = byCity
    .filter((loc) => Boolean(loc.country))
    .map((loc) => {
      const countryCode = loc.country || "GLOBAL";
      const city = loc.city || "Central";
      const coords = getCityCoordinates(city, countryCode);
      return {
        country: countryCode,
        countryName: countryName(countryCode),
        city,
        count: loc.count,
        code: getCountryCodeBadge(countryCode),
        lat: coords.lat,
        lng: coords.lng,
      };
    });

  const enrichedCountries = byCountry.map((c) => ({
    key: c.key,
    name: countryName(c.key),
    badge: getCountryCodeBadge(c.key),
    count: c.count,
    coords: getCountryCoordinates(c.key),
  }));

  return {
    days: span,
    total: allTime,
    firstScan: totals[0]?.first ?? null,
    rangeTotal,
    delta,
    avgPerDay: Math.round((rangeTotal / span) * 10) / 10,
    bestDay: series.reduce(
      (best, point) => (point.count > best.count ? point : best),
      series[0] ?? { count: 0, label: "—", day: "" },
    ),
    series,
    hours,
    devices: byDevice,
    os: byOs,
    countries: enrichedCountries,
    locations: enrichedLocations,
    referrers: byReferrer,
    recent: recent.map((scan) => ({
      id: scan.id,
      at: scan.createdAt.toISOString(),
      country: scan.country,
      countryName: countryName(scan.country),
      city: scan.city || "—",
      badge: getCountryCodeBadge(scan.country),
      deviceType: scan.deviceType,
      os: scan.os,
      browser: scan.browser,
      referrer: scan.referrer,
    })),
  };
}
