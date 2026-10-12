"use client";

import { useMemo, useState } from "react";
import { geoToSvg, getCountryCodeBadge } from "@/lib/geo";
import { IconClose, IconGlobe } from "@/components/icons";

export type LocationPoint = {
  country: string;
  countryName: string;
  city: string;
  count: number;
  code?: string;
  lat: number;
  lng: number;
};

// Lightweight vector world landmass paths for clean, high-performance rendering
const WORLD_PATHS = [
  // North America
  "M 120 75 Q 160 50 220 55 Q 260 65 280 110 Q 260 140 230 155 Q 200 170 175 190 Q 150 180 135 150 Q 110 130 110 95 Z",
  // Greenland
  "M 270 30 Q 310 25 330 45 Q 310 70 280 65 Q 260 50 270 30 Z",
  // South America
  "M 230 205 Q 275 220 285 270 Q 270 340 240 375 Q 225 350 215 300 Q 210 250 230 205 Z",
  // Europe
  "M 410 75 Q 450 70 475 90 Q 480 125 450 135 Q 425 140 405 125 Q 395 95 410 75 Z",
  // United Kingdom & Ireland
  "M 390 85 Q 405 80 400 100 Q 388 105 390 85 Z",
  // Africa
  "M 405 150 Q 465 150 495 190 Q 505 240 480 295 Q 450 330 435 320 Q 410 270 395 210 Q 390 170 405 150 Z",
  // Asia
  "M 480 70 Q 560 55 650 65 Q 710 90 730 145 Q 690 190 620 190 Q 560 195 530 160 Q 490 140 480 70 Z",
  // India subcontinent
  "M 570 165 Q 610 170 605 220 Q 585 245 570 215 Q 560 185 570 165 Z",
  // Japan
  "M 715 115 Q 730 120 725 145 Q 710 145 715 115 Z",
  // Southeast Asia / Indonesia
  "M 625 210 Q 675 215 690 245 Q 660 255 625 240 Q 615 225 625 210 Z",
  // Australia
  "M 660 270 Q 735 265 750 310 Q 720 355 665 345 Q 640 310 660 270 Z",
  // New Zealand
  "M 760 340 Q 775 345 770 365 Q 755 365 760 340 Z",
];

export function LocationMap({
  locations,
  totalScans,
}: {
  locations: LocationPoint[];
  totalScans?: number;
}) {
  const [activePoint, setActivePoint] = useState<LocationPoint | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const total = useMemo(
    () => totalScans || Math.max(1, locations.reduce((sum, l) => sum + l.count, 0)),
    [locations, totalScans],
  );

  const maxCount = useMemo(() => Math.max(1, ...locations.map((l) => l.count)), [locations]);

  const mapPoints = useMemo(() => {
    return locations.map((loc) => {
      const { x, y } = geoToSvg(loc.lat, loc.lng, 800, 420);
      return { ...loc, x, y };
    });
  }, [locations]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-volt-400" />
          <span className="text-xs font-semibold text-main">
            {locations.length} {locations.length === 1 ? "Active Location" : "Active Locations"}
          </span>
          <span className="text-xs text-dim">·</span>
          <span className="text-xs text-muted font-mono">
            {total.toLocaleString()} total scans
          </span>
        </div>

        <div className="flex rounded-lg border border-line bg-card-subtle p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              viewMode === "map"
                ? "bg-card text-main shadow-xs"
                : "text-muted hover:text-main"
            }`}
          >
            Live Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-card text-main shadow-xs"
                : "text-muted hover:text-main"
            }`}
          >
            City Breakdown
          </button>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-slate-900 dark:bg-slate-950 p-4 shadow-sm">
          {/* Subtle grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <svg
            viewBox="0 0 800 420"
            className="w-full h-auto max-h-[380px] overflow-visible select-none"
            role="img"
            aria-label="Scanner locations world map"
            onClick={() => setActivePoint(null)}
          >
            {/* World Landmasses */}
            <g className="fill-slate-800 stroke-slate-700/60 transition-colors" strokeWidth="1">
              {WORLD_PATHS.map((path, idx) => (
                <path key={idx} d={path} />
              ))}
            </g>

            {/* Latitude / Longitude guide lines */}
            <line x1="0" y1="210" x2="800" y2="210" stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <line x1="400" y1="0" x2="400" y2="420" stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />

            {/* Location pins */}
            {mapPoints.map((point, index) => {
              const radius = Math.max(5, Math.min(18, 5 + (point.count / maxCount) * 13));

              return (
                <g
                  key={`${point.city}-${point.country}-${index}`}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setActivePoint(point)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePoint(point);
                  }}
                >
                  {/* Outer pulse wave */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius * 1.8}
                    className="fill-blue-400 dark:fill-volt-400 opacity-20 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />

                  {/* Soft glow circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius * 1.25}
                    className="fill-blue-500/30 dark:fill-volt-400/30"
                  />

                  {/* Core marker */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius * 0.75}
                    className="fill-blue-400 dark:fill-volt-400 stroke-slate-950 transition-all hover:brightness-125"
                    strokeWidth="1.5"
                  />

                  {/* Inner center dot */}
                  <circle cx={point.x} cy={point.y} r="2.5" className="fill-white" />
                </g>
              );
            })}
          </svg>

          {/* Floating inspect card */}
          {activePoint && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-white shadow-xl backdrop-blur-md">
              <span className="flex h-7 px-2 items-center justify-center rounded-md bg-slate-800 text-xs font-mono font-bold text-blue-400 dark:text-volt-300">
                {activePoint.code || getCountryCodeBadge(activePoint.country)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{activePoint.city}</span>
                  <span className="text-xs text-slate-400">({activePoint.countryName})</span>
                </div>
                <div className="mt-0.5 text-xs text-blue-400 dark:text-volt-300 font-mono">
                  {activePoint.count} scans ({Math.round((activePoint.count / total) * 100)}% of traffic)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePoint(null)}
                className="ml-2 text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>
          )}

          {locations.length === 0 && (
            <div className="absolute inset-0 grid place-items-center bg-slate-950/70 p-4 text-center">
              <div>
                <p className="text-sm font-semibold text-white">No scans recorded yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Scan this code from a phone to plot your location on the map.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Detailed City & Country breakdown table */
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-xs">
          <div className="grid grid-cols-[1.4fr_1fr_90px_80px] gap-2 border-b border-line bg-card-subtle px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <span>Location</span>
            <span>Country</span>
            <span className="text-right">Scans</span>
            <span className="text-right">Share</span>
          </div>

          <div className="max-h-[320px] divide-y divide-line/60 overflow-y-auto">
            {locations.map((loc, idx) => {
              const share = total ? Math.round((loc.count / total) * 100) : 0;
              return (
                <div
                  key={`${loc.city}-${loc.country}-${idx}`}
                  className="grid grid-cols-[1.4fr_1fr_90px_80px] items-center gap-2 px-4 py-3 text-xs hover:bg-card-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted">
                      {loc.code || getCountryCodeBadge(loc.country)}
                    </span>
                    <span className="font-semibold text-main truncate">
                      {loc.city}
                    </span>
                  </div>

                  <span className="text-muted truncate">{loc.countryName}</span>

                  <span className="text-right font-mono font-semibold text-main">
                    {loc.count.toLocaleString()}
                  </span>

                  <div className="flex items-center justify-end gap-1.5">
                    <div className="h-1.5 w-10 overflow-hidden rounded-full bg-card-subtle">
                      <div className="h-full rounded-full bg-blue-600 dark:bg-volt-400" style={{ width: `${share}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-muted">{share}%</span>
                  </div>
                </div>
              );
            })}

            {locations.length === 0 && (
              <p className="py-8 text-center text-xs text-muted">No scanner locations found yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
