"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buildValue, contentTypeMap, getKindLabel } from "@/lib/content";
import { defaultStyle, type QRStyle, type QrCodeRow } from "@/lib/types";
import { downloadFile, type ExportFormat } from "@/lib/export-qr";
import { STYLE_TEMPLATES } from "./StylePanel";
import { ContentPanel } from "./ContentPanel";
import { StylePanel } from "./StylePanel";
import { QrCanvas } from "./QrCanvas";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCopy,
  IconDownload,
  IconExternal,
  IconEye,
  IconInfinity,
  IconLock,
  IconPalette,
  IconQr,
  IconRefresh,
  IconSparkle,
  kindIcon,
} from "@/components/icons";

const FORMATS: { id: ExportFormat; label: string; note: string }[] = [
  { id: "png", label: "PNG", note: "Raster · print & web" },
  { id: "jpeg", label: "JPG", note: "Small raster" },
  { id: "svg", label: "SVG", note: "Vector · infinite" },
  { id: "pdf", label: "PDF", note: "A4 poster sheet" },
  { id: "webp", label: "WebP", note: "Modern web" },
];

const SIZES = [500, 1000, 2000, 3000];

function toastClass(kind: "ok" | "info" | "error") {
  if (kind === "ok") return "border-volt-400/60 bg-volt-400/12 text-volt-200";
  if (kind === "error") return "border-coral-400/60 bg-coral-500/12 text-coral-400";
  return "border-signal-400/50 bg-signal-500/12 text-signal-300";
}

export function StudioClient({
  initialKind,
  initialValues,
  initialCode,
  user,
}: {
  initialKind?: string;
  initialValues?: Record<string, string> | null;
  initialCode?: QrCodeRow | null;
  user: { name: string; email: string } | null;
}) {
  const kind =
    initialCode?.kind ?? (initialKind && contentTypeMap[initialKind] ? initialKind : "url");
  const [activeKind, setActiveKind] = useState(kind);
  const [values, setValues] = useState<Record<string, string>>(
    initialCode?.fields ??
      (initialValues ? { ...contentTypeMap[kind].defaults, ...initialValues } : { ...contentTypeMap[kind].defaults }),
  );
  const [style, setStyle] = useState<QRStyle>(initialCode?.style ?? defaultStyle);
  const [name, setName] = useState(initialCode?.name ?? `${contentTypeMap[kind].label} QR`);
  const [isDynamic, setIsDynamic] = useState(initialCode?.isDynamic ?? true);
  const [destinationOverride, setDestinationOverride] = useState(initialCode?.destination ?? "");
  const [saved, setSaved] = useState<QrCodeRow | null>(initialCode ?? null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "info" | "error" } | null>(null);
  const [tab, setTab] = useState<"content" | "design" | "preview">("content");
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const notify = useCallback((message: string, kind: "ok" | "info" | "error" = "ok") => {
    setToast({ message, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(() => () => void (toastTimer.current && clearTimeout(toastTimer.current)), []);

  const encodedValue = useMemo(() => buildValue(activeKind, values), [activeKind, values]);
  const effectiveDestination = destinationOverride.trim() || encodedValue;
  const scanTarget =
    saved && saved.isDynamic
      ? `${origin || ""}/s/${saved.slug}`
      : isDynamic && saved
        ? `${origin || ""}/s/${saved.slug}`
        : encodedValue;
  const previewData = scanTarget || encodedValue || "https://altech.hub";

  const activeDef = contentTypeMap[activeKind];
  const KindIcon = kindIcon[activeKind] ?? IconQr;

  const patchStyle = (patch: Partial<QRStyle>) => {
    setStyle((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const changeKind = (next: string) => {
    setActiveKind(next);
    setName(`${contentTypeMap[next]?.label ?? "QR"} QR`);
    setDestinationOverride("");
    setDirty(true);
  };

  const changeValues = (next: Record<string, string>) => {
    setValues(next);
    setDestinationOverride("");
    setDirty(true);
  };

  const handleDownload = async (format: ExportFormat) => {
    setBusy(true);
    try {
      const filename =
        (name || "qr-code")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 48) || "qr-code";
      await downloadFile(style, previewData, format, filename, {
        name: name || "QR code",
        link: isDynamic && saved ? `${origin}/s/${saved.slug} → ${effectiveDestination}` : encodedValue,
        kindLabel: getKindLabel(activeKind),
      });
      notify(`${format.toUpperCase()} exported at ${style.size}px`, "ok");
    } catch (error) {
      console.error(error);
      notify("Export failed — try a smaller resolution.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!encodedValue) {
      notify("Fill in the content fields first.", "error");
      return;
    }
    setBusy(true);
    try {
      const body = {
        name: name || `${activeDef.label} QR`,
        kind: activeKind,
        fields: values,
        isDynamic,
        destination: isDynamic ? effectiveDestination : null,
        style,
      };
      const res = await fetch(saved ? `/api/codes/${saved.id}` : "/api/codes", {
        method: saved ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { code?: QrCodeRow; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? "Save failed");
      setSaved(data.code);
      setDirty(false);
      notify(
        saved
          ? "Changes saved — printed codes keep working."
          : user
            ? "Saved to your dashboard."
            : "Saved to this browser's guest workspace. Create a free account to keep it forever.",
        "ok",
      );
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : "Could not save.", "error");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      notify("Clipboard blocked by the browser.", "error");
    }
  };

  const randomize = () => {
    const tpl = STYLE_TEMPLATES[Math.floor(Math.random() * STYLE_TEMPLATES.length)];
    patchStyle({ ...tpl.patch } as Partial<QRStyle>);
    notify(`Applied the “${tpl.name}” template`, "info");
  };

  const missingRequired = activeDef.fields.filter((f) => f.required && !(values[f.id] ?? "").trim());
  const charCount = encodedValue.length;
  const printHint =
    style.errorCorrection === "H"
      ? "Down to 18 mm on matte paper"
      : style.errorCorrection === "Q"
        ? "Down to 22 mm recommended"
        : "Keep above 30 mm";

  return (
    <div className="min-h-screen bg-page pt-16">
      {/* toolbar */}
      <div className="sticky top-16 z-40 border-b border-line bg-card/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-muted transition-colors hover:text-main hover:border-slate-400 sm:flex"
          >
            ← Studio
          </Link>

          <div className="flex min-w-[180px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2 shadow-xs focus-within:border-blue-500">
            <span className="text-blue-600 dark:text-volt-400">
              <KindIcon width={16} height={16} />
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
              placeholder="Name this QR code"
              className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-dim"
            />
            <span className="hidden shrink-0 rounded-md border border-line bg-card-subtle px-2 py-0.5 text-xs font-medium text-muted sm:block">
              {activeDef.label}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDynamic((v) => !v);
              setDirty(true);
            }}
            title="Dynamic codes can be re-pointed after printing"
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
              isDynamic
                ? "border-blue-600 dark:border-volt-400 bg-blue-50 dark:bg-volt-400/12 text-blue-700 dark:text-volt-300 font-bold"
                : "border-line bg-card text-muted hover:border-slate-400"
            }`}
          >
            {isDynamic ? <IconInfinity width={15} height={15} /> : <IconLock width={15} height={15} />}
            <span className="hidden sm:inline">{isDynamic ? "Dynamic QR" : "Static QR"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={randomize}
              className="btn-ghost hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold md:flex shadow-xs"
            >
              <IconSparkle width={15} height={15} />
              Preset Style
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="btn-ghost flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold disabled:opacity-60 shadow-xs"
            >
              {dirty ? <IconRefresh width={14} height={14} /> : <IconCheck width={14} height={14} />}
              {saved ? (dirty ? "Save Changes" : "Saved") : "Save QR"}
            </button>
            <button
              type="button"
              onClick={() => handleDownload("png")}
              disabled={busy || !encodedValue}
              className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-60 shadow-xs"
            >
              <IconDownload width={14} height={14} />
              Export
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-t border-line px-4 py-2 lg:hidden">
          {(["content", "preview", "design"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                tab === t ? "bg-slate-900 text-white dark:bg-volt-400 dark:text-slate-900 font-bold" : "text-muted hover:bg-card-subtle"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-0 px-0 lg:grid-cols-[minmax(340px,400px)_1fr_minmax(320px,380px)] lg:px-6 lg:py-5">
        {/* content column */}
        <aside
          className={`border-line bg-card shadow-sm lg:sticky lg:top-[136px] lg:h-[calc(100vh-160px)] lg:overflow-hidden lg:rounded-2xl lg:border ${
            tab === "content" ? "block" : "hidden lg:block"
          }`}
        >
          <ContentPanel kind={activeKind} onKindChange={changeKind} values={values} onValuesChange={changeValues} />
        </aside>

        {/* preview column */}
        <main className={`px-4 py-6 lg:px-8 ${tab === "preview" ? "block" : "hidden lg:block"}`}>
          <div className="relative mx-auto max-w-[520px]">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-card-subtle">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Live Preview</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-volt-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to scan
                </span>
              </div>

              <div className={`relative p-8 flex justify-center items-center bg-white dark:bg-card ${style.transparentBackground ? "checker" : ""}`}>
                <div className="relative w-full max-w-[340px] overflow-hidden rounded-2xl shadow-inner">
                  <QrCanvas data={previewData} style={style} renderSize={560} />
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-line border-t border-line bg-card-subtle">
                {[
                  { label: "Payload", value: `${charCount} chars` },
                  { label: "Correction", value: `${style.errorCorrection} (30% ECC)` },
                  { label: "Print Size", value: printHint },
                ].map((item) => (
                  <div key={item.label} className="px-3 py-2.5 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{item.label}</div>
                    <div className="mt-0.5 truncate text-xs font-bold text-main">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* payload */}
            <div className="mt-4 rounded-2xl border border-line bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Encoded Target
                </span>
                <button
                  type="button"
                  onClick={() => copy("payload", previewData)}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-card-subtle px-2.5 py-1 text-xs font-medium text-muted hover:text-main hover:border-slate-400 transition-colors"
                >
                  {copied === "payload" ? <IconCheck width={12} height={12} /> : <IconCopy width={12} height={12} />}
                  Copy
                </button>
              </div>
              <p className="mt-2 max-h-20 overflow-auto break-all font-mono text-xs leading-relaxed text-blue-600 dark:text-volt-300 bg-page p-2.5 rounded-xl border border-line">
                {previewData}
              </p>
              {missingRequired.length > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                  <IconBolt width={13} height={13} />
                  Required: {missingRequired.map((f) => f.label).join(", ")}
                </p>
              )}
            </div>

            {/* dynamic controls */}
            <div className="mt-4 rounded-2xl border border-line bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                    isDynamic ? "border-blue-500/40 bg-blue-50 dark:bg-volt-400/12 text-blue-600 dark:text-volt-300" : "border-line bg-card-subtle text-muted"
                  }`}
                >
                  {isDynamic ? <IconInfinity width={17} height={17} /> : <IconLock width={17} height={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-main">
                    {isDynamic ? "Dynamic QR (Editable & Tracked)" : "Static QR (Direct Data)"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {isDynamic
                      ? "Points to a short link. Update the destination or view scanner location analytics anytime without reprinting."
                      : "Directly encodes data into the pattern. Works without internet and never expires."}
                  </p>

                  {isDynamic && (
                    <div className="mt-3 space-y-2.5">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">
                          Destination URL
                        </label>
                        <input
                          className="input-base font-mono text-xs"
                          value={destinationOverride || encodedValue}
                          placeholder="https://…"
                          onChange={(e) => {
                            setDestinationOverride(e.target.value);
                            setDirty(true);
                          }}
                        />
                      </div>
                      {saved && (
                        <div className="flex items-center gap-2 rounded-xl border border-line bg-page px-3 py-2 shadow-inner">
                          <IconLink2 />
                          <code className="min-w-0 flex-1 truncate font-mono text-xs text-blue-600 dark:text-signal-300">
                            {origin}/s/{saved.slug}
                          </code>
                          <button
                            type="button"
                            onClick={() => copy("link", `${origin}/s/${saved.slug}`)}
                            className="shrink-0 text-muted hover:text-main"
                            aria-label="Copy short link"
                          >
                            {copied === "link" ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
                          </button>
                          <Link
                            href={`/s/${saved.slug}`}
                            target="_blank"
                            className="shrink-0 text-muted hover:text-main"
                            aria-label="Test scan"
                          >
                            <IconExternal width={14} height={14} />
                          </Link>
                        </div>
                      )}
                      {!saved && (
                        <p className="text-xs text-dim">
                          Save this code to activate the short link and enable real-time scan location tracking.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* export bar */}
            <div className="mt-4 rounded-2xl border border-line bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-main">Export Assets</h3>
                  <p className="text-xs text-muted">Professional print and digital formats.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={style.size}
                    onChange={(e) => patchStyle({ size: Number(e.target.value) })}
                    className="input-base w-auto py-1 text-xs font-mono"
                    aria-label="Export resolution"
                  >
                    {SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {FORMATS.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    disabled={busy || !encodedValue}
                    onClick={() => handleDownload(format.id)}
                    className="group rounded-xl border border-line bg-card-subtle p-2.5 text-left transition-all hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xs disabled:opacity-50"
                  >
                    <span className="block text-xs font-bold text-main group-hover:text-blue-600 dark:group-hover:text-volt-300">
                      {format.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted">
                      {format.note}
                    </span>
                  </button>
                ))}
              </div>
              {saved && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <Link
                    href={`/dashboard/${saved.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-muted hover:text-main hover:border-slate-400 transition-colors shadow-xs"
                  >
                    <IconEye width={14} height={14} />
                    View Analytics
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-muted hover:text-main hover:border-slate-400 transition-colors shadow-xs"
                  >
                    Dashboard
                    <IconArrowRight width={14} height={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* design column */}
        <aside
          className={`border-line bg-card shadow-sm lg:sticky lg:top-[136px] lg:h-[calc(100vh-160px)] lg:overflow-hidden lg:rounded-2xl lg:border ${
            tab === "design" ? "block" : "hidden lg:block"
          }`}
        >
          <StylePanel
            style={style}
            onChange={patchStyle}
            onReset={() => {
              setStyle(defaultStyle);
              setDirty(true);
              notify("Design reset to studio defaults", "info");
            }}
          />
        </aside>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 pb-10 lg:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-ink-900/60 px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist-dim">
          <span className="flex items-center gap-2 text-volt-400">
            <IconPalette width={13} height={13} /> studio v2.6
          </span>
          <span>{isDynamic ? "dynamic · redirect tracked" : "static · zero redirect"}</span>
          <span>ecc {style.errorCorrection}</span>
          <span>{charCount} byte payload</span>
          <span className="ml-auto hidden sm:block">qr.altech.hub — a side project</span>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-semibold shadow-2xl backdrop-blur ${toastClass(
              toast.kind,
            )}`}
          >
            {toast.kind === "ok" ? <IconCheck width={16} height={16} /> : <IconBolt width={16} height={16} />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function IconLink2() {
  return (
    <span className="shrink-0 text-volt-400">
      <IconQr width={14} height={14} />
    </span>
  );
}
