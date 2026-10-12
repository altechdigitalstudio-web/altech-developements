"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AreaChart, BarList, DonutChart, HourHeat, StatTile } from "@/components/charts";
import { LocationMap, type LocationPoint } from "@/components/LocationMap";
import { Reveal } from "@/components/Reveal";
import { IconArrowRight, IconBolt, IconChart, IconDevice, IconEye, IconGlobe, IconPin } from "@/components/icons";

const RANGES = [
  { id: 7, label: "7d" },
  { id: 30, label: "30d" },
  { id: 90, label: "90d" },
];

function seededSeries(days: number) {
  const out: { day: string; label: string; count: number }[] = [];
  let seed = days * 9301 + 49297;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 86400000);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const trend = 1 + (days - i) / (days * 1.6);
    const base = (weekend ? 34 : 52) * trend;
    out.push({
      day: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.max(2, Math.round(base * (0.55 + rnd() * 0.9))),
    });
  }
  return out;
}

const SAMPLE_LOCATIONS: LocationPoint[] = [
  { country: "US", countryName: "United States", city: "New York", count: 242, lat: 40.7128, lng: -74.006, code: "US" },
  { country: "US", countryName: "United States", city: "San Francisco", count: 170, lat: 37.7749, lng: -122.4194, code: "US" },
  { country: "DE", countryName: "Germany", city: "Berlin", count: 154, lat: 52.52, lng: 13.405, code: "DE" },
  { country: "DE", countryName: "Germany", city: "Munich", count: 114, lat: 48.1351, lng: 11.582, code: "DE" },
  { country: "GB", countryName: "United Kingdom", city: "London", count: 231, lat: 51.5074, lng: -0.1278, code: "GB" },
  { country: "IN", countryName: "India", city: "Bengaluru", count: 186, lat: 12.9716, lng: 77.5946, code: "IN" },
  { country: "FR", countryName: "France", city: "Paris", count: 148, lat: 48.8566, lng: 2.3522, code: "FR" },
  { country: "BR", countryName: "Brazil", city: "São Paulo", count: 122, lat: -23.5505, lng: -46.6333, code: "BR" },
  { country: "JP", countryName: "Japan", city: "Tokyo", count: 98, lat: 35.6762, lng: 139.6503, code: "JP" },
  { country: "AU", countryName: "Australia", city: "Sydney", count: 86, lat: -33.8688, lng: 151.2093, code: "AU" },
  { country: "SG", countryName: "Singapore", city: "Singapore", count: 72, lat: 1.3521, lng: 103.8198, code: "SG" },
  { country: "CA", countryName: "Canada", city: "Toronto", count: 68, lat: 43.6532, lng: -79.3832, code: "CA" },
];

const COUNTRIES = [
  { label: "United States", count: 412, meta: "US" },
  { label: "Germany", count: 268, meta: "DE" },
  { label: "United Kingdom", count: 231, meta: "GB" },
  { label: "India", count: 186, meta: "IN" },
  { label: "France", count: 148, meta: "FR" },
  { label: "Brazil", count: 122, meta: "BR" },
];

const HOURS = [
  2, 1, 1, 0, 1, 2, 5, 12, 24, 31, 28, 35, 44, 38, 29, 33, 41, 52, 47, 36, 28, 19, 12, 6,
];

export function LiveAnalytics() {
  const [range, setRange] = useState(30);
  const series = useMemo(() => seededSeries(range), [range]);
  const total = series.reduce((sum, p) => sum + p.count, 0);
  const peak = series.reduce((best, p) => (p.count > best.count ? p : best), series[0]);

  return (
    <section id="analytics" className="relative mx-auto max-w-[1400px] px-5 py-24 lg:px-8">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Analytics & Scanner Geolocation</span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
            See where and when your codes get scanned.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Every dynamic code streams real-time events into a dashboard answering what matters: city, country, device,
            OS, browser, and peak hours. Explore live sample data below or generate your own code.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="btn-ghost group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm"
        >
          Open live dashboard
          <IconArrowRight width={16} height={16} className="text-blue-600 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 bg-card-subtle">
            <span className="flex items-center gap-2 text-sm font-bold text-main">
              <IconChart width={16} height={16} className="text-blue-600" />
              Workspace Intelligence
            </span>
            <span className="text-xs text-dim">· Live demo preview</span>
            <div className="ml-auto flex rounded-lg border border-line bg-card p-0.5">
              {RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRange(item.id)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    range === item.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "text-muted hover:text-main"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Scans in window" value={total.toLocaleString()} delta={`Peak ${peak.count} on ${peak.label}`} icon={<IconEye width={15} height={15} />} />
            <StatTile
              label="Active Days"
              value={series.filter((p) => p.count > 0).length}
              delta={`Avg ${(total / series.length).toFixed(1)} / day`}
              accent="#2563eb"
              icon={<IconBolt width={15} height={15} />}
            />
            <StatTile label="Countries Scanned" value={COUNTRIES.length} delta="Geolocated via Edge headers" accent="#10b981" icon={<IconGlobe width={15} height={15} />} />
            <StatTile label="Mobile Share" value="74%" delta="iOS 41% · Android 33%" accent="#8b5cf6" icon={<IconDevice width={15} height={15} />} />
          </div>

          {/* Scanner World Map */}
          <div className="border-t border-line p-5">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                <IconPin width={16} height={16} className="text-emerald-500" />
                Live Scanner Locations & City Heatmap
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Pinpoint real scanner coordinates and country shares in real time.
              </p>
            </div>
            <LocationMap locations={SAMPLE_LOCATIONS} totalScans={total} />
          </div>

          <div className="grid gap-5 border-t border-line p-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-line bg-card-subtle p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-main">Scans Over Time</h3>
                <span className="text-xs text-muted font-mono">Last {range} days</span>
              </div>
              <AreaChart series={series} height={190} stroke="#2563eb" fillFrom="rgba(37,99,235,0.25)" />
            </div>

            <div className="rounded-2xl border border-line bg-card-subtle p-4">
              <h3 className="mb-4 text-sm font-bold text-main">Device Distribution</h3>
              <DonutChart
                size={150}
                items={[
                  { label: "Mobile (iOS/Android)", count: 742, color: "#2563eb" },
                  { label: "Desktop", count: 186, color: "#10b981" },
                  { label: "Tablet", count: 61, color: "#f59e0b" },
                  { label: "Bot / Scanner", count: 24, color: "#94a3b8" },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-5 border-t border-line p-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-card-subtle p-4">
              <h3 className="mb-4 text-sm font-bold text-main">Top Countries</h3>
              <BarList items={COUNTRIES} color="#2563eb" />
            </div>
            <div className="rounded-2xl border border-line bg-card-subtle p-4">
              <h3 className="mb-4 text-sm font-bold text-main">Peak Hours of the Day</h3>
              <HourHeat hours={HOURS} />
              <p className="mt-4 text-xs leading-relaxed text-muted">
                High scan density between 11:00 and 14:00 indicates tabletop & restaurant QR engagement.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card-subtle p-4">
              <h3 className="mb-4 text-sm font-bold text-main">Traffic Referrers</h3>
              <BarList
                color="#10b981"
                items={[
                  { label: "Direct Camera App", count: 812 },
                  { label: "Instagram App", count: 143 },
                  { label: "Google Lens", count: 88 },
                  { label: "Linktree / Social", count: 62 },
                ]}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
