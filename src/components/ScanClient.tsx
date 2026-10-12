"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
  IconArrowRight,
  IconBolt,
  IconCamera,
  IconCheck,
  IconCopy,
  IconExternal,
  IconQr,
  IconSearch,
} from "@/components/icons";

type Decoded = {
  kind: string;
  label: string;
  value: string;
  fields: { label: string; value: string }[];
  href: string | null;
};

function classify(raw: string): Decoded {
  const value = raw.trim();
  const lower = value.toLowerCase();

  if (/^wifi:/i.test(value)) {
    const parsed: Record<string, string> = {};
    value
      .replace(/^WIFI:/i, "")
      .replace(/;;$/, "")
      .split(/;(?!\\)/)
      .forEach((part) => {
        const idx = part.indexOf(":");
        if (idx > 0) parsed[part.slice(0, idx).trim().toUpperCase()] = part.slice(idx + 1);
      });
    return {
      kind: "wifi",
      label: "Wi-Fi network",
      value,
      href: null,
      fields: [
        { label: "Network", value: parsed.S ?? "—" },
        { label: "Security", value: parsed.T === "nopass" ? "Open" : parsed.T ?? "WPA" },
        { label: "Password", value: parsed.P ?? "none" },
      ],
    };
  }

  if (/^begin:vcard/i.test(value)) {
    const parsed: Record<string, string> = {};
    value.split(/\r?\n/).forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) parsed[line.slice(0, idx).split(";")[0].trim().toUpperCase()] = line.slice(idx + 1).trim();
    });
    return {
      kind: "vcard",
      label: "vCard contact",
      value,
      href: null,
      fields: [
        { label: "Name", value: parsed.FN ?? "—" },
        { label: "Company", value: parsed.ORG ?? "" },
        { label: "Title", value: parsed.TITLE ?? "" },
        { label: "Phone", value: parsed.TEL ?? "" },
        { label: "Email", value: parsed.EMAIL ?? "" },
        { label: "Website", value: parsed.URL ?? "" },
      ].filter((f) => f.value),
    };
  }

  if (/^begin:ve/i.test(value)) {
    const parsed: Record<string, string> = {};
    value.split(/\r?\n/).forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) parsed[line.slice(0, idx).trim().toUpperCase()] = line.slice(idx + 1).trim();
    });
    return {
      kind: "event",
      label: "Calendar event",
      value,
      href: null,
      fields: [
        { label: "Title", value: parsed.SUMMARY ?? "—" },
        { label: "Starts", value: parsed.DTSTART ?? "" },
        { label: "Ends", value: parsed.DTEND ?? "" },
        { label: "Location", value: parsed.LOCATION ?? "" },
        { label: "Details", value: parsed.DESCRIPTION ?? "" },
      ].filter((f) => f.value),
    };
  }

  if (/^mailto:/i.test(value)) {
    const [address, query] = value.slice(7).split("?");
    const params = new URLSearchParams(query ?? "");
    return {
      kind: "email",
      label: "Email message",
      value,
      href: value,
      fields: [
        { label: "To", value: address },
        { label: "Subject", value: params.get("subject") ?? "" },
        { label: "Body", value: params.get("body") ?? "" },
      ].filter((f) => f.value),
    };
  }

  if (/^(tel|sms|smsto):/i.test(value)) {
    const scheme = lower.startsWith("smsto") ? "smsto" : lower.startsWith("sms") ? "sms" : "tel";
    const rest = value.slice(scheme.length + 1);
    const [number, message] = rest.split(/[:?]/);
    return {
      kind: scheme === "tel" ? "phone" : "sms",
      label: scheme === "tel" ? "Phone number" : "SMS message",
      value,
      href: scheme === "tel" ? `tel:${number}` : `sms:${number}`,
      fields: [
        { label: "Number", value: number },
        { label: "Message", value: (message ?? "").replace(/^body=/, "") },
      ].filter((f) => f.value),
    };
  }

  if (/^geo:/i.test(value)) {
    const [lat, lng] = value.slice(4).split(",");
    return {
      kind: "location",
      label: "GPS location",
      value,
      href: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
      fields: [
        { label: "Latitude", value: lat ?? "" },
        { label: "Longitude", value: (lng ?? "").split("?")[0] },
      ],
    };
  }

  if (/^(bitcoin|ethereum|litecoin|tron):/i.test(value)) {
    const [scheme, rest] = value.split(":");
    const [address, query] = (rest ?? "").split("?");
    const params = new URLSearchParams(query ?? "");
    return {
      kind: "crypto",
      label: `${scheme} payment`,
      value,
      href: null,
      fields: [
        { label: "Network", value: scheme },
        { label: "Address", value: address },
        { label: "Amount", value: params.get("amount") ?? "" },
        { label: "Label", value: params.get("label") ?? "" },
      ].filter((f) => f.value),
    };
  }

  if (/^https?:\/\//i.test(value)) {
    let host = value;
    try {
      host = new URL(value).hostname.replace(/^www\./, "");
    } catch {
      /* keep raw */
    }
    const isWhats = /wa\.me|whatsapp/i.test(lower);
    return {
      kind: isWhats ? "whatsapp" : "url",
      label: isWhats ? "WhatsApp chat" : "Website link",
      value,
      href: value,
      fields: [
        { label: "Host", value: host },
        { label: "Full URL", value },
      ],
    };
  }

  return { kind: "text", label: "Plain text", value, href: null, fields: [{ label: "Text", value }] };
}

export function ScanClient() {
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [status, setStatus] = useState<string>("Upload an image or start the camera");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const decodeRef = useRef<((data: string) => void) | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const runDetector = useCallback(
    async (source: HTMLCanvasElement) => {
      const { default: jsQR } = await import("jsqr");
      const ctx = source.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      const { width, height } = source;
      if (!width || !height) return null;
      const image = ctx.getImageData(0, 0, width, height);
      const found = jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" });
      return found?.data ?? null;
    },
    [],
  );

  const handleResult = useCallback((data: string) => {
    setDecoded(classify(data));
    setStatus("QR decoded successfully");
    setError(null);
  }, []);

  const decodeFile = useCallback(
    async (file: File) => {
      setError(null);
      setStatus("Reading image…");
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Could not read that image"));
          img.src = url;
        });
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const data = await runDetector(canvas);
        if (!data) {
          setStatus("No QR code found");
          setError("No decodable QR code in that image. Try a straight-on photo with good contrast.");
          return;
        }
        handleResult(data);
      } catch (err) {
        setStatus("Upload failed");
        setError(err instanceof Error ? err.message : "Could not decode that file");
      }
    },
    [handleResult, runDetector],
  );

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Camera unavailable");
      setError("This browser blocks camera access. Upload a screenshot or photo instead.");
      return;
    }
    try {
      setStatus("Requesting camera…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      setScanning(true);
      setStatus("Point the camera at a QR code");

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      const tick = async () => {
        if (!streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (width && height) {
            canvas.width = Math.min(900, width);
            canvas.height = Math.round((canvas.width * height) / width);
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const data = await runDetector(canvas);
              if (data) {
                handleResult(data);
                stopCamera();
                return;
              }
            }
          }
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };
      rafRef.current = requestAnimationFrame(() => void tick());
    } catch {
      setScanning(false);
      setStatus("Camera blocked");
      setError("Camera permission was denied. You can still upload an image of a QR code.");
    }
  }, [handleResult, runDetector, stopCamera]);

  decodeRef.current = handleResult;

  const copy = async () => {
    if (!decoded) return;
    try {
      await navigator.clipboard.writeText(decoded.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard blocked by the browser.");
    }
  };

  const recreateHref = decoded
    ? `/create?kind=${decoded.kind}&v=${encodeURIComponent(decoded.value)}`
    : "/create";

  return (
    <div className="mx-auto max-w-[1100px]">
      <header className="max-w-2xl">
        <span className="eyebrow">QR Decoder & Inspector</span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
          Decode and inspect any QR code safely.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Analyze any physical QR code from your phone camera or upload a screenshot. All decoding happens locally in
          your browser without sending images to any server.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-card-subtle">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-main">
                <IconSearch width={15} height={15} className="text-blue-600 dark:text-volt-400" />
                Input Source
              </span>
              <span className="text-xs text-muted font-medium">
                {scanning ? "Camera active" : "Ready"}
              </span>
            </div>

            <div className="p-4">
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void decodeFile(file);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  dragging ? "border-blue-500 bg-blue-50 dark:bg-volt-400/10" : "border-line bg-card-subtle hover:border-slate-400"
                }`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-card text-blue-600 dark:text-volt-400 shadow-xs">
                  <IconQr width={22} height={22} />
                </span>
                <span className="mt-3 text-sm font-bold text-main">
                  Drop a QR Image Here
                </span>
                <span className="mt-1 text-xs text-muted">or click to browse from device (PNG, JPG, WebP)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void decodeFile(file);
                    e.target.value = "";
                  }}
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => (scanning ? stopCamera() : void startCamera())}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-all ${
                    scanning ? "btn-ghost text-coral-400" : "btn-volt"
                  }`}
                >
                  <IconCamera width={16} height={16} />
                  {scanning ? "Stop camera" : "Use camera"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecoded(null);
                    setError(null);
                    setStatus("Upload an image or start the camera");
                  }}
                  className="btn-ghost rounded-xl px-4 py-3 text-[13px] font-semibold"
                >
                  Reset
                </button>
              </div>

              <div className="relative mt-3 overflow-hidden rounded-2xl border border-line bg-ink-950">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`w-full ${scanning ? "block" : "hidden"}`}
                />
                {scanning && (
                  <>
                    <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-volt-400/60" />
                    <div className="pointer-events-none absolute inset-x-6 top-6 bottom-6 overflow-hidden rounded-xl">
                      <div className="h-[2px] w-full animate-scanline bg-gradient-to-r from-transparent via-volt-400 to-transparent shadow-[0_0_18px_4px_rgba(216,255,79,0.45)]" />
                    </div>
                  </>
                )}
                {!scanning && (
                  <div className="grid h-[180px] place-items-center px-6 text-center">
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-dim">{status}</p>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-mist">
                        Camera frames are decoded locally at roughly 30 attempts per second and never leave the device.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Decoded Payload</h2>

            {error && (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <IconBolt width={14} height={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            {!decoded && !error && (
              <div className="mt-4 rounded-xl border border-dashed border-line px-4 py-12 text-center bg-card-subtle">
                <p className="text-sm font-bold text-main">Ready to Inspect</p>
                <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted">
                  Upload an image or point your camera at any QR pattern. Type classification and field extraction will appear here.
                </p>
              </div>
            )}

            {decoded && (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-blue-500/40 bg-blue-50 dark:bg-volt-400/12 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-volt-300">
                    {decoded.label}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    {decoded.value.length} characters
                  </span>
                </div>

                <dl className="mt-4 space-y-2">
                  {decoded.fields.map((field) => (
                    <div key={field.label} className="flex items-start gap-3 border-b border-line/60 pb-2">
                      <dt className="w-24 shrink-0 text-xs font-medium text-muted">
                        {field.label}
                      </dt>
                      <dd className="min-w-0 flex-1 break-words text-xs font-semibold text-main">{field.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <p className="text-xs font-medium text-muted">Raw Decoded String</p>
                  <pre className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-line bg-page p-3 font-mono text-xs leading-relaxed text-blue-600 dark:text-volt-300">
                    {decoded.value}
                  </pre>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {decoded.href && (
                    <a
                      href={decoded.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px]"
                    >
                      <IconExternal width={14} height={14} />
                      Open destination
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={copy}
                    className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold"
                  >
                    {copied ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
                    {copied ? "Copied" : "Copy payload"}
                  </button>
                  <Link
                    href={recreateHref}
                    className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold"
                  >
                    Recreate in studio
                    <IconArrowRight width={14} height={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Runs 100% locally", body: "Decoding is executed on your device canvas. Zero data or camera frames leave your browser." },
            { title: "20 format types", body: "Wi-Fi, vCard, calendar events, GPS pins, crypto addresses, phone numbers, and URLs." },
            { title: "Direct to studio", body: "Recreate whatever you scan into a styled, high-res branded QR asset in one click." },
          ].map((item) => (
            <div key={item.title} className="card-lift rounded-2xl border border-line bg-card p-4 shadow-sm">
              <h3 className="text-sm font-bold text-main">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
