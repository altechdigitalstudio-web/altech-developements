"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QrCodeRow } from "@/lib/types";
import { getKindLabel } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import {
  IconArrowRight,
  IconBolt,
  IconChart,
  IconCheck,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternal,
  IconEye,
  IconInfinity,
  IconLock,
  IconPlus,
  IconQr,
  IconSearch,
  IconTrash,
  kindIcon,
} from "@/components/icons";

type Stats = { total: number; dynamic: number; scans: number; scans7d: number };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "dynamic", label: "Dynamic" },
  { id: "static", label: "Static" },
  { id: "paused", label: "Paused" },
] as const;

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "scans", label: "Most scans" },
  { id: "name", label: "A → Z" },
] as const;

function thumbUrl(code: QrCodeRow, size = 220) {
  const params = new URLSearchParams({
    v: code.value,
    size: String(size),
    fg: code.style.dotColor,
    bg: code.style.backgroundColor,
    margin: String(code.style.margin ?? 2),
    ecl: code.style.errorCorrection ?? "H",
  });
  if (code.style.transparentBackground) params.set("transparent", "1");
  return `/api/qr?${params.toString()}`;
}

export function DashboardClient({
  codes: initialCodes,
  stats,
  signedIn,
}: {
  codes: QrCodeRow[];
  stats: Stats;
  signedIn: boolean;
}) {
  const [codes, setCodes] = useState(initialCodes);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = codes.filter((code) => {
      const matchesQuery =
        !q || `${code.name} ${code.kind} ${code.value} ${code.destination ?? ""}`.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "dynamic" && code.isDynamic) ||
        (filter === "static" && !code.isDynamic) ||
        (filter === "paused" && code.status === "paused");
      return matchesQuery && matchesFilter;
    });
    return filtered.sort((a, b) => {
      if (sort === "scans") return b.scans - a.scans;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [codes, query, filter, sort]);

  const patch = async (code: QrCodeRow, body: Record<string, unknown>) => {
    setBusyId(code.id);
    try {
      const res = await fetch(`/api/codes/${code.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { code?: QrCodeRow; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? "Update failed");
      setCodes((prev) => prev.map((item) => (item.id === data.code!.id ? data.code! : item)));
      return data.code;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Update failed");
      return null;
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (code: QrCodeRow) => {
    setBusyId(code.id);
    try {
      const res = await fetch(`/api/codes/${code.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCodes((prev) => prev.filter((item) => item.id !== code.id));
      setConfirmDelete(null);
      notify(`Deleted “${code.name}”`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const download = async (code: QrCodeRow) => {
    setBusyId(code.id);
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
      if (!res.ok) throw new Error("Render failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${code.slug}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      notify(`Downloaded ${code.slug}.png`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Download failed");
    } finally {
      setBusyId(null);
    }
  };

  const copy = async (code: QrCodeRow) => {
    const link = code.isDynamic ? code.value : code.destination || code.value;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(code.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      notify("Clipboard blocked by the browser.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
            Your QR Codes
          </h1>
          <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-muted">
            {signedIn
              ? "Manage, edit destinations and view live scanner locations for all your QR codes."
              : "Guest workspace active. Create a free account anytime to sync these codes permanently across devices."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/bulk" className="btn-ghost flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs">
            <IconBolt width={14} height={14} className="text-blue-600 dark:text-volt-400" />
            Bulk CSV
          </Link>
          <Link href="/create" className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs">
            <IconPlus width={14} height={14} />
            New QR Code
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Codes", value: stats.total, icon: <IconQr width={15} height={15} /> },
          { label: "Dynamic Retargetable", value: stats.dynamic, icon: <IconInfinity width={15} height={15} /> },
          { label: "All-Time Scans", value: stats.scans.toLocaleString(), icon: <IconEye width={15} height={15} /> },
          { label: "Last 7 Days", value: stats.scans7d.toLocaleString(), icon: <IconChart width={15} height={15} /> },
        ].map((tile, index) => (
          <Reveal key={tile.label} delay={index * 50}>
            <div className="card-lift rounded-2xl border border-line bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{tile.label}</span>
                <span className="text-blue-600 dark:text-volt-400">{tile.icon}</span>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-main font-mono">
                {tile.value}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-ink-900/70 p-3">
        <div className="relative min-w-[200px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, type or destination…"
            className="input-base pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-line bg-ink-850 p-0.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-md px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-all ${
                filter === item.id ? "bg-volt-400 text-ink-950" : "text-mist hover:text-chalk"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input-base w-auto">
          {SORTS.map((item) => (
            <option key={item.id} value={item.id} className="bg-ink-850">
              {item.label}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-line bg-ink-850 p-0.5">
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-md px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-all ${
                view === mode ? "bg-volt-400 text-ink-950" : "text-mist hover:text-chalk"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center shadow-xs">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-line bg-card-subtle text-blue-600 dark:text-volt-400 shadow-xs">
            <IconQr width={22} height={22} />
          </span>
          <h2 className="mt-4 text-lg font-bold tracking-tight text-main">
            {codes.length === 0 ? "No codes created yet" : "No results match that search"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-mist">
            {codes.length === 0
              ? "Create your first QR code — pick a type, drop in a link, style it and download. It takes under two minutes."
              : "Try a different search term or switch the filter back to All."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/create" className="btn-volt rounded-xl px-5 py-3 text-[13.5px]">
              Create a QR code
            </Link>
            {codes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="btn-ghost rounded-xl px-5 py-3 text-[13.5px] font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((code, index) => {
            const Icon = kindIcon[code.kind] ?? IconQr;
            const paused = code.status === "paused";
            return (
              <Reveal key={code.id} delay={Math.min(index * 45, 400)}>
                <article
                  className={`card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-ink-900 ${
                    paused ? "border-coral-500/40" : "border-line"
                  }`}
                >
                  <div className="relative flex items-start gap-4 border-b border-line p-4">
                    <div className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-white p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl(code)}
                        alt={`${code.name} QR code`}
                        width={92}
                        height={92}
                        className={`h-[92px] w-[92px] ${paused ? "opacity-40 grayscale" : ""}`}
                      />
                      {code.isDynamic && (
                        <span className="absolute -right-1 -top-1 rounded-md bg-volt-400 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-ink-950">
                          dyn
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold tracking-tight text-main">
                        {code.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-volt-400">
                        <Icon width={12} height={12} />
                        {getKindLabel(code.kind)}
                      </p>
                      <p className="mt-1.5 truncate font-mono text-xs text-muted" title={code.destination || code.value}>
                        {code.isDynamic ? code.destination || code.value : code.value}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 rounded-md border border-line bg-card-subtle px-2 py-0.5 font-mono text-xs text-main">
                          <IconEye width={12} height={12} className="text-blue-600 dark:text-volt-400" />
                          {code.scans.toLocaleString()}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                            paused
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "border-line bg-card-subtle text-muted"
                          }`}
                        >
                          {paused ? "Paused" : code.isDynamic ? "Dynamic" : "Static"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 p-3">
                    <Link
                      href={`/dashboard/${code.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[11.5px] font-semibold text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    >
                      <IconChart width={13} height={13} />
                      Analytics
                    </Link>
                    <Link
                      href={`/create?id=${code.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[11.5px] font-semibold text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    >
                      <IconEdit width={13} height={13} />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => copy(code)}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[11.5px] font-semibold text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    >
                      {copied === code.id ? <IconCheck width={13} height={13} /> : <IconCopy width={13} height={13} />}
                      {copied === code.id ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => download(code)}
                      disabled={busyId === code.id}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[11.5px] font-semibold text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300 disabled:opacity-50"
                    >
                      <IconDownload width={13} height={13} />
                      PNG
                    </button>
                    {code.isDynamic && (
                      <button
                        type="button"
                        onClick={() => patch(code, { status: paused ? "active" : "paused" })}
                        disabled={busyId === code.id}
                        className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[11.5px] font-semibold text-mist transition-colors hover:border-coral-400/50 hover:text-coral-400 disabled:opacity-50"
                      >
                        {paused ? <IconLock width={13} height={13} /> : <IconBolt width={13} height={13} />}
                        {paused ? "Resume" : "Pause"}
                      </button>
                    )}
                    {confirmDelete === code.id ? (
                      <span className="ml-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => remove(code)}
                          className="rounded-lg bg-coral-500 px-2.5 py-2 text-[11.5px] font-bold text-ink-950"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-line px-2.5 py-2 text-[11.5px] font-semibold text-mist"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(code.id)}
                        className="ml-auto flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-2 text-[11.5px] font-semibold text-mist-dim transition-colors hover:border-coral-500/40 hover:text-coral-400"
                      >
                        <IconTrash width={13} height={13} />
                      </button>
                    )}
                  </div>

                  {code.isDynamic && (
                    <Link
                      href={`/s/${code.slug}`}
                      target="_blank"
                      className="flex items-center justify-between gap-2 border-t border-line bg-ink-950/60 px-4 py-2.5 font-mono text-[10.5px] text-signal-300 transition-colors hover:text-volt-300"
                    >
                      <span className="truncate">{code.value}</span>
                      <IconExternal width={12} height={12} className="shrink-0" />
                    </Link>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-ink-900/70">
          <div className="hidden grid-cols-[1fr_120px_90px_110px_140px] gap-3 border-b border-line px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist-dim lg:grid">
            <span>code</span>
            <span>type</span>
            <span>scans</span>
            <span>status</span>
            <span className="text-right">actions</span>
          </div>
          {visible.map((code) => {
            const Icon = kindIcon[code.kind] ?? IconQr;
            return (
              <div
                key={code.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-ink-850/60 lg:grid-cols-[1fr_120px_90px_110px_140px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl(code, 120)}
                    alt=""
                    width={38}
                    height={38}
                    className="h-[38px] w-[38px] rounded-lg border border-line bg-white p-0.5"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-chalk">{code.name}</div>
                    <div className="truncate font-mono text-[10.5px] text-mist-dim">
                      {code.isDynamic ? code.destination || code.value : code.value}
                    </div>
                  </div>
                </div>
                <span className="hidden items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-mist lg:flex">
                  <Icon width={12} height={12} className="text-volt-400" />
                  {code.kind}
                </span>
                <span className="hidden font-mono text-[12px] text-chalk lg:block">{code.scans.toLocaleString()}</span>
                <span
                  className={`hidden rounded-md border px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] lg:block ${
                    code.status === "paused"
                      ? "border-coral-500/50 bg-coral-500/10 text-coral-400"
                      : "border-line bg-ink-850 text-mist-dim"
                  }`}
                >
                  {code.status === "paused" ? "paused" : code.isDynamic ? "live" : "static"}
                </span>
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/dashboard/${code.id}`}
                    className="rounded-lg border border-line p-2 text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    aria-label="Analytics"
                  >
                    <IconChart width={13} height={13} />
                  </Link>
                  <Link
                    href={`/create?id=${code.id}`}
                    className="rounded-lg border border-line p-2 text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    aria-label="Edit"
                  >
                    <IconEdit width={13} height={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => download(code)}
                    className="rounded-lg border border-line p-2 text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    aria-label="Download"
                  >
                    <IconDownload width={13} height={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(code)}
                    className="rounded-lg border border-line p-2 text-mist transition-colors hover:border-volt-400/50 hover:text-volt-300"
                    aria-label="Copy link"
                  >
                    {copied === code.id ? <IconCheck width={13} height={13} /> : <IconCopy width={13} height={13} />}
                  </button>
                  <Link
                    href="/create"
                    className="hidden items-center gap-1.5 rounded-lg bg-volt-400 px-3 py-2 text-[11.5px] font-bold text-ink-950 lg:flex"
                  >
                    Open
                    <IconArrowRight width={12} height={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
