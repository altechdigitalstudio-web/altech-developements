"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CodeAnalytics } from "@/lib/analytics";
import type { QrCodeRow } from "@/lib/types";
import { getKindLabel } from "@/lib/content";
import { AreaChart, BarList, DonutChart, HourHeat, StatTile } from "@/components/charts";
import { LocationMap } from "@/components/LocationMap";
import {
  IconBolt,
  IconChart,
  IconCheck,
  IconCopy,
  IconDevice,
  IconDownload,
  IconEdit,
  IconExternal,
  IconEye,
  IconGlobe,
  IconInfinity,
  IconLock,
  IconPin,
  IconRefresh,
  IconTrash,
  kindIcon,
} from "@/components/icons";

const RANGES = [7, 30, 90, 180];
const DEVICE_COLORS: Record<string, string> = {
  mobile: "#D8FF4F",
  desktop: "#4C7DFF",
  tablet: "#FF8360",
  bot: "#3A4152",
};

export function AnalyticsClient({
  code: initialCode,
  analytics: initialAnalytics,
}: {
  code: QrCodeRow;
  analytics: CodeAnalytics;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [data, setData] = useState<CodeAnalytics>(initialAnalytics);
  const [days, setDays] = useState(initialAnalytics.days);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [destination, setDestination] = useState(code.destination ?? "");
  const [slugDraft, setSlugDraft] = useState(code.slug);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const changeRange = async (next: number) => {
    setDays(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/codes/${code.id}/analytics?days=${next}`);
      if (!res.ok) throw new Error("Could not load analytics");
      const payload = (await res.json()) as CodeAnalytics & { code: QrCodeRow };
      setData(payload);
      setCode(payload.code);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not load analytics");
    } finally {
      setLoading(false);
    }
  };

  const saveDestination = async () => {
    if (!code.isDynamic) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/codes/${code.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          destination: destination.trim() || code.destination,
          slug: slugDraft.trim() && slugDraft.trim() !== code.slug ? slugDraft.trim() : undefined,
        }),
      });
      const payload = (await res.json()) as { code?: QrCodeRow; error?: string };
      if (!res.ok || !payload.code) throw new Error(payload.error ?? "Update failed");
      setCode(payload.code);
      setSlugDraft(payload.code.slug);
      setDestination(payload.code.destination ?? "");
      notify("Saved — the printed code now resolves to the new destination.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/codes/${code.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: code.status === "paused" ? "active" : "paused" }),
      });
      const payload = (await res.json()) as { code?: QrCodeRow };
      if (payload.code) {
        setCode(payload.code);
        notify(payload.code.status === "paused" ? "Code paused — scanners see a notice page." : "Code resumed.");
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/codes/${code.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Delete failed");
      setBusy(false);
    }
  };

  const download = async () => {
    setBusy(true);
    try {
      const params = new URLSearchParams({
        v: code.value,
        size: String(code.style.size ?? 1200),
        fg: code.style.dotColor,
        bg: code.style.backgroundColor,
        margin: String(code.style.margin ?? 2),
        ecl: code.style.errorCorrection ?? "H",
      });
      if (code.style.transparentBackground) params.set("transparent", "1");
      const res = await fetch(`/api/qr?${params.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${code.slug}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      notify("PNG downloaded");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(code.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      notify("Clipboard blocked by the browser.");
    }
  };

  const Icon = kindIcon[code.kind] ?? IconChart;
  const totalDevices = data.devices.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-dim transition-colors hover:text-volt-400"
      >
        ← all codes
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-white p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr?v=${encodeURIComponent(code.value)}&size=160&fg=${encodeURIComponent(
                code.style.dotColor,
              )}&bg=${encodeURIComponent(code.style.backgroundColor)}&margin=${code.style.margin}&ecl=${
                code.style.errorCorrection
              }${code.style.transparentBackground ? "&transparent=1" : ""}`}
              alt=""
              width={72}
              height={72}
              className={`h-[72px] w-[72px] ${code.status === "paused" ? "opacity-40 grayscale" : ""}`}
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
              {code.name}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-volt-400">
                <Icon width={13} height={13} />
                {getKindLabel(code.kind)}
              </span>
              <span className="text-dim">·</span>
              <span className={code.isDynamic ? "text-blue-600 dark:text-signal-300 font-semibold" : "text-muted"}>
                {code.isDynamic ? "Dynamic (Tracked)" : "Static"}
              </span>
              <span className="text-dim">·</span>
              <span className={code.status === "paused" ? "text-rose-500 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                {code.status === "paused" ? "Paused" : "Active"}
              </span>
            </p>
            {code.isDynamic && (
              <div className="mt-3 flex max-w-md items-center gap-2 rounded-xl border border-line bg-ink-900 px-3 py-2">
                <IconInfinity width={14} height={14} className="shrink-0 text-volt-400" />
                <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-signal-300">{code.value}</code>
                <button type="button" onClick={copyLink} className="shrink-0 text-mist hover:text-volt-300" aria-label="Copy link">
                  {copied ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
                </button>
                <Link href={`/s/${code.slug}`} target="_blank" className="shrink-0 text-mist hover:text-volt-300" aria-label="Test scan">
                  <IconExternal width={14} height={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-line bg-ink-850 p-0.5">
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => changeRange(range)}
                className={`rounded-md px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-all ${
                  days === range ? "bg-volt-400 text-ink-950" : "text-mist hover:text-chalk"
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => changeRange(days)}
            className="btn-ghost flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold"
          >
            <IconRefresh width={14} height={14} className={loading ? "animate-spin-slow" : ""} />
            Refresh
          </button>
          <Link
            href={`/create?id=${code.id}`}
            className="btn-ghost flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold"
          >
            <IconEdit width={14} height={14} />
            Edit design
          </Link>
          <button
            type="button"
            onClick={download}
            className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px]"
          >
            <IconDownload width={14} height={14} />
            Download
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label={`scans · last ${data.days}d`}
          value={data.rangeTotal.toLocaleString()}
          delta={`${data.delta >= 0 ? "+" : ""}${data.delta}% vs previous window`}
          icon={<IconEye width={15} height={15} />}
        />
        <StatTile
          label="all-time scans"
          value={data.total.toLocaleString()}
          delta={data.firstScan ? `first scan ${data.firstScan}` : "no scans yet"}
          accent="#4C7DFF"
          icon={<IconChart width={15} height={15} />}
        />
        <StatTile
          label="average / day"
          value={data.avgPerDay}
          delta={`best day ${data.bestDay.label} · ${data.bestDay.count}`}
          accent="#FF8360"
          icon={<IconBolt width={15} height={15} />}
        />
        <StatTile
          label="unique locations"
          value={data.countries.length}
          delta={data.countries[0] ? `top: ${data.countries[0].key} (${data.countries[0].count})` : "—"}
          icon={<IconGlobe width={15} height={15} />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              Scans Over Time
            </h2>
            <span className="text-xs font-mono text-muted">
              {loading ? "Refreshing…" : `Last ${data.days} days`}
            </span>
          </div>
          <div className={loading ? "opacity-40 transition-opacity" : "transition-opacity"}>
            <AreaChart series={data.series} height={210} stroke="#2563eb" fillFrom="rgba(37,99,235,0.22)" />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
            Device Breakdown
          </h2>
          {totalDevices > 0 ? (
            <DonutChart
              size={150}
              items={data.devices.map((device) => ({
                label: device.key === "bot" ? "Bot / Scanner" : device.key[0].toUpperCase() + device.key.slice(1),
                count: device.count,
                color: DEVICE_COLORS[device.key] ?? "#94a3b8",
              }))}
            />
          ) : (
            <EmptyScans />
          )}
        </div>
      </div>

      {/* Scanner Geographic Location Map & Intelligence */}
      <div className="mt-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-main">
              <IconPin width={17} height={17} className="text-emerald-500" />
              Scanner Locations & Geography
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Live geographic distribution of scanner IPs, countries and cities for this QR code.
            </p>
          </div>
        </div>

        <LocationMap locations={data.locations ?? []} totalScans={data.rangeTotal} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-main">Top Countries</h2>
          <BarList
            items={(data.countries ?? []).map((c) => ({
              label: `${c.badge} · ${c.name || c.key}`,
              count: c.count,
              meta: `${c.key}`,
            }))}
          />
        </div>
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-main">Referrers & Sources</h2>
          <BarList color="#2563eb" items={data.referrers.map((r) => ({ label: r.key, count: r.count }))} />
        </div>
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-main">Peak Hours</h2>
          <HourHeat hours={data.hours} />
          <h3 className="mb-2 mt-5 text-xs font-semibold text-muted">Operating Systems</h3>
          <BarList color="#10b981" items={data.os.map((o) => ({ label: o.key, count: o.count }))} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
            Recent Live Scan Events
          </h2>
          {data.recent.length === 0 ? (
            <EmptyScans />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="pb-2 pr-3 font-medium">Time</th>
                    <th className="pb-2 pr-3 font-medium">Location</th>
                    <th className="pb-2 pr-3 font-medium">Device & OS</th>
                    <th className="pb-2 pr-3 font-medium">Browser</th>
                    <th className="pb-2 font-medium">Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((scan) => (
                    <tr key={scan.id} className="border-b border-line/60 text-xs last:border-0 hover:bg-card-subtle transition-colors">
                      <td className="py-2.5 pr-3 font-mono text-muted">
                        {new Date(scan.at).toLocaleString("en-GB", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-main">
                        <span className="inline-flex items-center gap-2">
                          <span className="rounded-md border border-line bg-card-subtle px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted">
                            {scan.badge || scan.country}
                          </span>
                          <span>{scan.city && scan.city !== "—" ? `${scan.city}, ` : ""}{scan.countryName || scan.country}</span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-1.5 text-muted">
                          <IconDevice width={13} height={13} className="text-blue-500" />
                          {scan.deviceType} · {scan.os}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-muted">{scan.browser}</td>
                      <td className="py-2.5 font-mono text-xs text-muted truncate max-w-[140px]">{scan.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {code.isDynamic && (
            <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-main">
                Destination Management
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Update where scanners land without modifying your printed artwork.
              </p>
              <input
                className="input-base mt-3 font-mono text-xs"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="https://…"
              />

              <div className="mt-3">
                <label htmlFor="slug" className="mb-1 block text-xs font-medium text-muted">
                  Custom short link slug
                </label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-page focus-within:border-blue-500 shadow-inner">
                  <span className="grid place-items-center border-r border-line px-3 text-xs font-mono text-muted bg-card-subtle">
                    /s/
                  </span>
                  <input
                    id="slug"
                    className="w-full bg-transparent px-3 py-2 text-xs font-mono text-main outline-none"
                    value={slugDraft}
                    onChange={(e) => setSlugDraft(e.target.value)}
                    placeholder={code.slug}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={saveDestination}
                  disabled={busy}
                  className="btn-volt flex-1 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-60 shadow-xs"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={toggleStatus}
                  disabled={busy}
                  className={`btn-ghost flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs ${
                    code.status === "paused" ? "text-emerald-600 dark:text-volt-300" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {code.status === "paused" ? <IconLock width={14} height={14} /> : <IconBolt width={14} height={14} />}
                  {code.status === "paused" ? "Resume" : "Pause"}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Raw Target</h2>
            <p className="mt-2 max-h-40 overflow-auto break-all rounded-xl border border-line bg-page p-3 font-mono text-xs leading-relaxed text-blue-600 dark:text-volt-300">
              {code.destination || code.value}
            </p>
            <dl className="mt-4 space-y-2 text-xs">
              {[
                ["Slug", code.slug],
                ["Created", new Date(code.createdAt).toLocaleDateString()],
                ["Updated", new Date(code.updatedAt).toLocaleDateString()],
                ["Last Scan", code.lastScanAt ? new Date(code.lastScanAt).toLocaleString("en-GB") : "Never"],
                ["Error Correction", code.style.errorCorrection],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-line/60 pb-1.5">
                  <dt className="text-muted font-medium">{label}</dt>
                  <dd className="truncate text-main font-semibold font-mono text-[11px]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Delete QR Code
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Permanently delete this code, short link and all recorded scan geolocation analytics.
            </p>
            {confirmDelete ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Yes, Delete Code
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:border-rose-400 shadow-xs"
              >
                <IconTrash width={14} height={14} />
                Delete this QR code
              </button>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-volt-400/60 bg-volt-400/12 px-4 py-3 text-[13px] font-semibold text-volt-200 shadow-2xl backdrop-blur">
            <IconCheck width={16} height={16} />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyScans() {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card-subtle px-4 py-10 text-center">
      <p className="text-sm font-bold text-main">No scans in this window</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">
        Share your short link or print the QR code. Real-time events and map pins will populate here.
      </p>
      <p className="mt-2 text-xs text-dim">
        Tip: Open your short link in a new tab to record a test scan.
      </p>
    </div>
  );
}
