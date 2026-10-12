"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QRStyle, QrCodeRow } from "@/lib/types";
import { defaultStyle } from "@/lib/types";
import { STYLE_TEMPLATES } from "@/components/qr/StylePanel";
import { buildValue, contentTypeMap } from "@/lib/content";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconDownload,
  IconInfinity,
  IconLayers,
  IconLock,
  IconSparkle,
} from "@/components/icons";

const SAMPLE = `name,kind,url,ssid,password
Nordkaffe table 01,url,https://nordkaffe.cafe/menu-spring
Nordkaffe table 02,url,https://nordkaffe.cafe/menu-spring
Staff Wi-Fi,wifi,,Altech-Staff,s3cr3t-key
Guest Wi-Fi,wifi,,Altech-Guest,welcome2026
Ada business card,vcard,,,,,,,,
Launch poster,url,https://altech.hub/launch`;

const SAMPLE_VCARD = `name,kind,firstName,lastName,organization,title,phone,email,website
Ada Lovelace,vcard,Ada,Lovelace,Altech Hub,Founder,+15550100100,ada@altech.hub,altech.hub
Grace Hopper,vcard,Grace,Hopper,Altech Hub,CTO,+15550100101,grace@altech.hub,altech.hub`;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += char;
      continue;
    }
    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(field.trim());
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  row.push(field.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

type ParsedRow = { index: number; name: string; kind: string; fields: Record<string, string>; value: string; ok: boolean };

export function BulkClient({ signedIn }: { signedIn: boolean }) {
  const [csv, setCsv] = useState(SAMPLE);
  const [isDynamic, setIsDynamic] = useState(true);
  const [template, setTemplate] = useState(STYLE_TEMPLATES[0].id);
  const [size, setSize] = useState(1000);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "error" } | null>(null);
  const [created, setCreated] = useState<QrCodeRow[]>([]);

  const style: QRStyle = useMemo(() => {
    const tpl = STYLE_TEMPLATES.find((t) => t.id === template);
    return { ...defaultStyle, ...(tpl?.patch ?? {}), size, errorCorrection: "H" } as QRStyle;
  }, [template, size]);

  const parsed = useMemo<ParsedRow[]>(() => {
    const rows = parseCsv(csv);
    if (rows.length < 2) return [];
    const header = rows[0].map((h) => h.trim().toLowerCase());
    return rows.slice(1, 501).map((cells, index) => {
      const record: Record<string, string> = {};
      header.forEach((key, i) => {
        record[key] = cells[i] ?? "";
      });
      const kind = record.kind && contentTypeMap[record.kind] ? record.kind : "url";
      const fields: Record<string, string> = {};
      (contentTypeMap[kind].fields ?? []).forEach((field) => {
        fields[field.id] = record[field.id] ?? record[field.id.toLowerCase()] ?? "";
      });
      if (!fields.url && record.url) fields.url = record.url;
      const value = buildValue(kind, fields);
      return {
        index: index + 1,
        name: record.name || `${contentTypeMap[kind].label} #${index + 1}`,
        kind,
        fields,
        value,
        ok: Boolean(value) && !/^https?:\/\/$/.test(value),
      };
    });
  }, [csv]);

  const valid = parsed.filter((row) => row.ok);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    setMessage({ text: `Loaded ${file.name}`, kind: "ok" });
  };

  const generate = async () => {
    if (!valid.length) {
      setMessage({ text: "Nothing valid to generate — check your CSV columns.", kind: "error" });
      return;
    }
    setBusy(true);
    setProgress(0);
    setMessage(null);
    try {
      const res = await fetch("/api/codes/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          isDynamic,
          style,
          rows: valid.map((row) => ({ name: row.name, kind: row.kind, fields: row.fields })),
        }),
      });
      const payload = (await res.json()) as { codes?: QrCodeRow[]; error?: string };
      if (!res.ok || !payload.codes) throw new Error(payload.error ?? "Bulk generation failed");
      setCreated(payload.codes);
      setProgress(100);
      setMessage({ text: `${payload.codes.length} codes created and saved to your workspace.`, kind: "ok" });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Bulk generation failed", kind: "error" });
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!created.length) return;
    setBusy(true);
    setProgress(0);
    try {
      const [{ default: JSZip }] = await Promise.all([import("jszip")]);
      const zip = new JSZip();
      const manifest: string[] = ["name,kind,slug,short_link,destination"];

      for (let i = 0; i < created.length; i += 1) {
        const code = created[i];
        const params = new URLSearchParams({
          v: code.value,
          size: String(size),
          fg: code.style.dotColor,
          bg: code.style.backgroundColor,
          margin: String(code.style.margin ?? 2),
          ecl: code.style.errorCorrection ?? "H",
        });
        if (code.style.transparentBackground) params.set("transparent", "1");
        const res = await fetch(`/api/qr?${params.toString()}`);
        const buffer = await res.arrayBuffer();
        zip.file(`${String(i + 1).padStart(3, "0")}-${code.slug}.png`, buffer);
        manifest.push(
          [code.name.replace(/,/g, " "), code.kind, code.slug, code.value, code.destination ?? ""].join(","),
        );
        setProgress(Math.round(((i + 1) / created.length) * 100));
      }

      zip.file("manifest.csv", manifest.join("\n"));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `altech-qr-bulk-${created.length}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setMessage({ text: "ZIP exported with PNGs and manifest.csv", kind: "ok" });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "ZIP export failed", kind: "error" });
    } finally {
      setBusy(false);
    }
  };

  const downloadManifest = () => {
    if (!created.length) return;
    const rows = [
      "name,kind,slug,short_link,destination",
      ...created.map((code) =>
        [code.name.replace(/,/g, " "), code.kind, code.slug, code.value, code.destination ?? ""].join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-manifest.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <header>
        <span className="eyebrow">Bulk Processing</span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
          Batch QR Code Generator
        </h1>
        <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted">
          Generate up to 500 QR codes from a single CSV spreadsheet. Each code inherits your chosen style, generates
          individual short links and analytics, and exports a ZIP bundle of PNGs and a manifest file.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-main">Source CSV Data</h2>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCsv(SAMPLE)}
                className="rounded-lg border border-line bg-card-subtle px-2.5 py-1 text-xs font-medium text-muted hover:text-main hover:border-slate-400 transition-colors"
              >
                Link sample
              </button>
              <button
                type="button"
                onClick={() => setCsv(SAMPLE_VCARD)}
                className="rounded-lg border border-line bg-card-subtle px-2.5 py-1 text-xs font-medium text-muted hover:text-main hover:border-slate-400 transition-colors"
              >
                vCard sample
              </button>
              <label className="cursor-pointer rounded-lg border border-line bg-card-subtle px-2.5 py-1 text-xs font-medium text-muted hover:text-main hover:border-slate-400 transition-colors">
                Upload .CSV
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    void onFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            spellCheck={false}
            className="input-base mt-3 min-h-[240px] resize-y font-mono text-[12px] leading-relaxed"
            placeholder="name,kind,url"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.12em]">
            <span className="text-mist-dim">
              {parsed.length} rows · <span className="text-volt-400">{valid.length} valid</span>
            </span>
            {parsed.length > valid.length && (
              <span className="text-coral-400">{parsed.length - valid.length} skipped (missing payload)</span>
            )}
            <span className="ml-auto text-mist-dim">supported columns: name, kind, + any type field</span>
          </div>

          {parsed.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <div className="grid grid-cols-[40px_1.3fr_0.7fr_1.4fr] gap-2 border-b border-line bg-ink-850 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-mist-dim">
                <span>#</span>
                <span>name</span>
                <span>type</span>
                <span>payload</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto">
                {parsed.slice(0, 40).map((row) => (
                  <div
                    key={row.index}
                    className={`grid grid-cols-[40px_1.3fr_0.7fr_1.4fr] gap-2 border-b border-line/60 px-3 py-2 text-[11.5px] last:border-0 ${
                      row.ok ? "" : "opacity-45"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-mist-dim">{row.index}</span>
                    <span className="truncate text-chalk">{row.name}</span>
                    <span className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-volt-400">
                      {row.kind}
                    </span>
                    <span className="truncate font-mono text-[10.5px] text-mist">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-main">Batch Configuration</h2>

            <button
              type="button"
              onClick={() => setIsDynamic((v) => !v)}
              className={`mt-4 flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                isDynamic ? "border-blue-500/40 bg-blue-50 dark:bg-volt-400/10" : "border-line bg-card-subtle"
              }`}
            >
              <span className={isDynamic ? "text-blue-600 dark:text-volt-400" : "text-muted"}>
                {isDynamic ? <IconInfinity width={18} height={18} /> : <IconLock width={18} height={18} />}
              </span>
              <span className="flex-1">
                <span className="block text-xs font-bold text-main">
                  {isDynamic ? "Dynamic Codes (Tracked & Editable)" : "Static Codes (Direct Data)"}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">
                  {isDynamic
                    ? "Each row receives an individual short link with location analytics."
                    : "Payloads baked directly into the pattern without redirects."}
                </span>
              </span>
            </button>

            <div className="mt-4">
              <p className="mb-2 text-[11.5px] font-semibold text-mist">Design template</p>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplate(tpl.id)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11.5px] font-semibold transition-all ${
                      template === tpl.id
                        ? "border-volt-400 bg-volt-400/12 text-volt-300"
                        : "border-line text-mist hover:border-ink-600"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-[3px] border border-line"
                      style={{
                        background: tpl.patch.useGradient
                          ? `linear-gradient(135deg, ${tpl.patch.dotColor}, ${tpl.patch.gradientColor})`
                          : tpl.patch.dotColor,
                      }}
                    />
                    <span className="truncate">{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11.5px] font-semibold text-mist">Export resolution</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[500, 1000, 2000, 3000].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={`rounded-lg border px-2 py-2 font-mono text-[10.5px] transition-all ${
                      size === option
                        ? "border-volt-400 bg-volt-400/12 text-volt-300"
                        : "border-line text-mist hover:border-ink-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={busy || !valid.length}
              className="btn-volt mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[13.5px] disabled:opacity-50"
            >
              {busy ? <IconBolt width={16} height={16} /> : <IconLayers width={16} height={16} />}
              {busy ? "Generating…" : `Generate ${valid.length || 0} codes`}
            </button>
            {!signedIn && (
              <p className="mt-3 text-[11.5px] leading-relaxed text-mist-dim">
                You are in a guest workspace.{" "}
                <Link href="/register" className="text-volt-400 underline underline-offset-2">
                  Create a free account
                </Link>{" "}
                to keep these codes.
              </p>
            )}
          </div>

          {created.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <IconCheck width={15} height={15} />
                {created.length} Codes Ready for Export
              </h2>
              <div className="mt-4 grid grid-cols-5 gap-1.5">
                {created.slice(0, 10).map((code) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={code.id}
                    src={`/api/qr?v=${encodeURIComponent(code.value)}&size=120&fg=${encodeURIComponent(
                      code.style.dotColor,
                    )}&bg=${encodeURIComponent(code.style.backgroundColor)}&margin=${code.style.margin}&ecl=${
                      code.style.errorCorrection
                    }`}
                    alt={code.name}
                    className="aspect-square w-full rounded-md border border-line bg-white p-0.5"
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={busy}
                  className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] disabled:opacity-60"
                >
                  <IconDownload width={14} height={14} />
                  {busy ? `Packing… ${progress}%` : "Download ZIP"}
                </button>
                <button
                  type="button"
                  onClick={downloadManifest}
                  className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold"
                >
                  <IconSparkle width={14} height={14} className="text-volt-400" />
                  Manifest CSV
                </button>
                <Link
                  href="/dashboard"
                  className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold"
                >
                  Dashboard
                  <IconArrowRight width={14} height={14} />
                </Link>
              </div>
              {busy && progress > 0 && progress < 100 && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full bg-volt-400 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-semibold shadow-2xl backdrop-blur ${
              message.kind === "ok"
                ? "border-volt-400/60 bg-volt-400/12 text-volt-200"
                : "border-coral-400/60 bg-coral-500/12 text-coral-400"
            }`}
          >
            {message.kind === "ok" ? <IconCheck width={16} height={16} /> : <IconBolt width={16} height={16} />}
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
}
