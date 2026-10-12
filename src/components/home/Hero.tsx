"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QrCanvas } from "@/components/qr/QrCanvas";
import { defaultStyle, type QRStyle } from "@/lib/types";
import { exportRaster } from "@/lib/export-qr";
import { IconArrowRight, IconBolt, IconCheck, IconDownload, IconInfinity, IconSparkle } from "@/components/icons";

const HERO_PRESETS: { id: string; name: string; patch: Partial<QRStyle> }[] = [
  {
    id: "ink",
    name: "Classic Slate",
    patch: {
      useGradient: false,
      dotColor: "#0f172a",
      cornerColor: "#0f172a",
      dotType: "extra-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "royal",
    name: "Royal Blue",
    patch: {
      useGradient: true,
      gradientRotation: 45,
      dotColor: "#2563eb",
      gradientColor: "#0284c7",
      cornerColor: "#1d4ed8",
      dotType: "classy-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "emerald",
    name: "Emerald Mint",
    patch: {
      useGradient: true,
      gradientRotation: 120,
      dotColor: "#059669",
      gradientColor: "#10b981",
      cornerColor: "#047857",
      dotType: "dots",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "sunset",
    name: "Sunset Coral",
    patch: {
      useGradient: true,
      gradientRotation: 20,
      dotColor: "#ea580c",
      gradientColor: "#f59e0b",
      cornerColor: "#c2410c",
      dotType: "rounded",
      cornerSquareType: "rounded",
      cornerDotType: "dot",
      backgroundColor: "#ffffff",
    },
  },
];

export function Hero({ stats }: { stats: { codes: number; scans: number; countries: number } }) {
  const [url, setUrl] = useState("https://altech.hub/launch");
  const [preset, setPreset] = useState("royal");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const style: QRStyle = useMemo(() => {
    const found = HERO_PRESETS.find((p) => p.id === preset);
    return { ...defaultStyle, ...(found?.patch ?? {}), size: 1200, margin: 2, errorCorrection: "H" };
  }, [preset]);

  const data = url.trim() ? (url.trim().match(/^https?:\/\//i) ? url.trim() : `https://${url.trim()}`) : "https://";

  const download = async () => {
    setBusy(true);
    try {
      await exportRaster(style, data, "png", "altech-qr-code");
    } catch {
      window.alert("Download is not available in this browser.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="studio" className="relative overflow-hidden pt-28 lg:pt-36 pb-16 lg:pb-24">
      {/* Background subtle mesh */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-16 h-[460px] w-[460px] rounded-full bg-blue-500/10 dark:bg-volt-400/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 top-36 h-[400px] w-[400px] rounded-full bg-emerald-500/10 dark:bg-signal-500/10 blur-[130px]" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-500"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(10px)" }}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted">
              Altech Hub QR Studio · Built with Next.js & Postgres
            </span>
          </div>

          <h1 className="mt-6 text-[clamp(2.6rem,5.6vw,4.4rem)] font-extrabold leading-[1.05] tracking-tight text-main">
            Every QR code you need,
            <span className="block text-blue-600 dark:text-gradient-volt">
              with real-time analytics.
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transitionDelay: "150ms" }}
          >
            Create professional static and dynamic QR codes with live scanner location tracking, editable destinations,
            bulk CSV generation, brand frames and vector SVG exports. Free to use, no scan limits, no watermarks.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3.5 transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(14px)", transitionDelay: "250ms" }}
          >
            <Link href="/create" className="btn-volt group flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-base font-semibold shadow-md">
              Open QR Studio
              <IconArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="btn-ghost flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-base font-semibold shadow-sm"
            >
              <IconSparkle width={16} height={16} className="text-blue-600 dark:text-volt-400" />
              Live Workspace
            </Link>
          </div>

          <dl
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7 transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transitionDelay: "350ms" }}
          >
            {[
              { label: "Codes Minted", value: stats.codes, suffix: "+" },
              { label: "Scans Tracked", value: stats.scans, suffix: "" },
              { label: "Countries Active", value: stats.countries, suffix: "" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight text-main font-mono">
                  {stat.value.toLocaleString()}
                  <span className="text-blue-600 dark:text-volt-400">{stat.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Live interactive Generator card */}
        <div
          className="relative transition-all duration-800"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transitionDelay: "200ms" }}
        >
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-card-subtle">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Instant Live Generator
              </span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="order-2 sm:order-1 space-y-4">
                <div>
                  <label htmlFor="hero-url" className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Destination URL
                  </label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-page px-3.5 py-2.5 transition-colors focus-within:border-blue-500 shadow-inner">
                    <IconInfinity width={16} height={16} className="shrink-0 text-blue-600 dark:text-volt-400" />
                    <input
                      id="hero-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://your-website.com"
                      className="w-full bg-transparent font-mono text-sm text-main outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Color Style
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {HERO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPreset(p.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          preset === p.id
                            ? "border-blue-600 bg-blue-50 dark:bg-volt-400/15 text-blue-700 dark:text-volt-300 font-semibold"
                            : "border-line text-muted hover:border-slate-300 dark:hover:border-slate-700 hover:text-main"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={download}
                    disabled={busy}
                    className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
                  >
                    <IconDownload width={15} height={15} />
                    {busy ? "Exporting…" : "Download PNG"}
                  </button>
                  <Link
                    href="/create"
                    className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm"
                  >
                    <IconBolt width={15} height={15} className="text-blue-600 dark:text-volt-400" />
                    Customizer
                  </Link>
                </div>
              </div>

              <div className="order-1 sm:order-2 flex flex-col items-center">
                <div className="relative w-[200px] sm:w-[220px] rounded-2xl bg-white p-3.5 shadow-lg border border-slate-100 dark:border-slate-800">
                  <div className="pointer-events-none absolute inset-x-3.5 top-3.5 bottom-3.5 overflow-hidden rounded-xl">
                    <div className="h-[2px] w-full animate-scanline bg-gradient-to-r from-transparent via-blue-500 dark:via-volt-400 to-transparent shadow-[0_0_12px_2px_rgba(37,99,235,0.4)]" />
                  </div>
                  <QrCanvas data={data} style={style} renderSize={460} />
                </div>
                <p className="mt-2.5 text-center text-[11px] font-mono text-muted">
                  ECC Level H · 30% redundancy
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs font-medium text-muted bg-card-subtle">
              <span className="inline-flex items-center gap-1.5"><IconCheck width={13} height={13} className="text-emerald-500" /> No signup required</span>
              <span className="inline-flex items-center gap-1.5"><IconCheck width={13} height={13} className="text-emerald-500" /> No scan caps</span>
              <span className="inline-flex items-center gap-1.5"><IconCheck width={13} height={13} className="text-emerald-500" /> 20 QR formats</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
