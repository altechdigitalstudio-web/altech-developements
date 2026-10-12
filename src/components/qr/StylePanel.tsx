"use client";

import { useRef, useState } from "react";
import type { QRStyle } from "@/lib/types";
import { CORNER_TYPES, DOT_TYPES, GRADIENT_PRESETS, SOLID_PRESETS } from "@/lib/qr-style";
import { IconChevron, IconRefresh, IconSparkle } from "@/components/icons";

export const STYLE_TEMPLATES: { id: string; name: string; hint: string; patch: Partial<QRStyle> }[] = [
  {
    id: "ink",
    name: "Classic Slate",
    hint: "High-contrast clean",
    patch: {
      dotType: "square",
      cornerSquareType: "square",
      cornerDotType: "square",
      useGradient: false,
      dotColor: "#0f172a",
      cornerColor: "#0f172a",
      backgroundColor: "#ffffff",
      transparentBackground: false,
      shape: "square",
    },
  },
  {
    id: "royal",
    name: "Royal Blue",
    hint: "Corporate gradient",
    patch: {
      dotType: "classy-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      useGradient: true,
      gradientRotation: 45,
      dotColor: "#2563eb",
      gradientColor: "#0284c7",
      cornerColor: "#1d4ed8",
      backgroundColor: "#ffffff",
      transparentBackground: false,
    },
  },
  {
    id: "emerald",
    name: "Emerald Mint",
    hint: "Fresh & vibrant",
    patch: {
      dotType: "extra-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      useGradient: true,
      gradientType: "linear",
      gradientRotation: 45,
      dotColor: "#059669",
      gradientColor: "#10b981",
      cornerColor: "#047857",
      backgroundColor: "#ffffff",
      transparentBackground: false,
    },
  },
  {
    id: "matrix",
    name: "Dot Matrix",
    hint: "Airy circular dots",
    patch: {
      dotType: "dots",
      cornerSquareType: "dot",
      cornerDotType: "dot",
      useGradient: false,
      dotColor: "#0f172a",
      cornerColor: "#2563eb",
      backgroundColor: "#f8fafc",
      transparentBackground: false,
      shape: "circle",
    },
  },
  {
    id: "coral",
    name: "Sunset Coral",
    hint: "Warm retail favorite",
    patch: {
      dotType: "rounded",
      cornerSquareType: "rounded",
      cornerDotType: "dot",
      useGradient: true,
      gradientRotation: 30,
      dotColor: "#ea580c",
      gradientColor: "#f59e0b",
      cornerColor: "#c2410c",
      backgroundColor: "#ffffff",
      transparentBackground: false,
    },
  },
  {
    id: "frame",
    name: "Scan-Me Frame",
    hint: "Print-ready callout",
    patch: {
      dotType: "extra-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      useGradient: false,
      dotColor: "#0f172a",
      cornerColor: "#0f172a",
      backgroundColor: "#ffffff",
      transparentBackground: false,
      frame: {
        enabled: true,
        text: "SCAN ME",
        variant: "classic",
        color: "#ffffff",
        background: "#0f172a",
      },
    },
  },
  {
    id: "mono",
    name: "Mono Minimal",
    hint: "Transparent vector-ready",
    patch: {
      dotType: "classy",
      cornerSquareType: "square",
      cornerDotType: "square",
      useGradient: false,
      dotColor: "#0f172a",
      cornerColor: "#0f172a",
      transparentBackground: true,
      backgroundColor: "#ffffff",
    },
  },
];

function Section({
  title,
  step,
  children,
  defaultOpen = true,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-card-subtle"
      >
        <span className="text-xs font-mono font-bold text-blue-600 dark:text-volt-400">{step}</span>
        <span className="flex-1 text-xs font-bold uppercase tracking-wider text-main">
          {title}
        </span>
        <IconChevron
          width={15}
          height={15}
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180 text-main" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-mist">{label}</span>
        <span className="font-mono text-[11px] text-volt-400">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-700 accent-volt-400"
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-ink-850/60 px-3 py-2.5 text-left transition-colors hover:border-ink-600"
    >
      <span>
        <span className="block text-[12.5px] font-semibold text-chalk">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-snug text-mist-dim">{hint}</span>}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-volt-400" : "bg-ink-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Swatches({
  colors,
  value,
  onChange,
  allowCustom = true,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  allowCustom?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Use ${color}`}
          onClick={() => onChange(color)}
          style={{ background: color }}
          className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
            value.toLowerCase() === color.toLowerCase()
              ? "border-volt-400 ring-2 ring-volt-400/40"
              : "border-line"
          }`}
        />
      ))}
      {allowCustom && (
        <label className="relative ml-1 flex h-6 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-ink-600 px-1.5 font-mono text-[9.5px] uppercase text-mist transition-colors hover:border-volt-400/60 hover:text-volt-300">
          custom
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      )}
    </div>
  );
}

export function StylePanel({
  style,
  onChange,
  onReset,
}: {
  style: QRStyle;
  onChange: (patch: Partial<QRStyle>) => void;
  onReset: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      window.alert("Logo must be smaller than 4 MB.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      // Downscale to keep payloads light.
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode failed"));
        img.src = dataUrl;
      });
      const max = 512;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onChange({ logo: canvas.toDataURL("image/png"), errorCorrection: "H" });
      } else {
        onChange({ logo: dataUrl });
      }
    } catch {
      window.alert("Could not read that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-main">2. Design & Styling</h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-card-subtle px-2.5 py-1 text-xs font-medium text-muted hover:text-main hover:border-slate-400 transition-colors"
        >
          <IconRefresh width={12} height={12} />
          Reset
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="Templates" step="A">
          <div className="grid grid-cols-2 gap-2">
            {STYLE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange({ ...tpl.patch } as Partial<QRStyle>)}
                className="group overflow-hidden rounded-xl border border-line bg-ink-850/60 p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-volt-400/50"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-3.5 w-3.5 rounded-[4px] border border-line"
                    style={{
                      background: tpl.patch.useGradient
                        ? `linear-gradient(135deg, ${tpl.patch.dotColor}, ${tpl.patch.gradientColor})`
                        : tpl.patch.transparentBackground
                          ? "repeating-conic-gradient(#1b2029 0% 25%, #0e1016 0% 50%) 50% / 8px 8px"
                          : tpl.patch.dotColor,
                    }}
                  />
                  <span className="text-[12px] font-semibold text-chalk">{tpl.name}</span>
                </span>
                <span className="mt-1 block truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-mist-dim">
                  {tpl.hint}
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Dots & shape" step="B">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11.5px] font-semibold text-mist">Dot style</p>
              <div className="grid grid-cols-3 gap-1.5">
                {DOT_TYPES.map((dot) => (
                  <button
                    key={dot.id}
                    type="button"
                    onClick={() => onChange({ dotType: dot.id })}
                    className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all ${
                      style.dotType === dot.id
                        ? "border-volt-400 bg-volt-400/12 text-volt-300"
                        : "border-line text-mist hover:border-ink-600 hover:text-chalk"
                    }`}
                  >
                    {dot.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-[11.5px] font-semibold text-mist">Eye frame</p>
                <div className="flex flex-col gap-1.5">
                  {CORNER_TYPES.map((corner) => (
                    <button
                      key={corner.id}
                      type="button"
                      onClick={() => onChange({ cornerSquareType: corner.id })}
                      className={`rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition-all ${
                        style.cornerSquareType === corner.id
                          ? "border-volt-400 bg-volt-400/12 text-volt-300"
                          : "border-line text-mist hover:border-ink-600"
                      }`}
                    >
                      {corner.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11.5px] font-semibold text-mist">Eye dot</p>
                <div className="flex flex-col gap-1.5">
                  {CORNER_TYPES.map((corner) => (
                    <button
                      key={corner.id}
                      type="button"
                      onClick={() => onChange({ cornerDotType: corner.id })}
                      className={`rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition-all ${
                        style.cornerDotType === corner.id
                          ? "border-volt-400 bg-volt-400/12 text-volt-300"
                          : "border-line text-mist hover:border-ink-600"
                      }`}
                    >
                      {corner.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(["square", "circle"] as const).map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => onChange({ shape })}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-semibold capitalize transition-all ${
                    style.shape === shape
                      ? "border-volt-400 bg-volt-400/12 text-volt-300"
                      : "border-line text-mist hover:border-ink-600"
                  }`}
                >
                  {shape} canvas
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Colour & gradient" step="C">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11.5px] font-semibold text-mist">Foreground</p>
                <span className="font-mono text-[10px] text-mist-dim">{style.dotColor}</span>
              </div>
              <Swatches colors={SOLID_PRESETS} value={style.dotColor} onChange={(c) => onChange({ dotColor: c })} />
            </div>

            <Toggle
              label="Gradient fill"
              hint="Blend two colours across the dots"
              checked={style.useGradient}
              onChange={(v) => onChange({ useGradient: v })}
            />

            {style.useGradient && (
              <div className="space-y-3 rounded-xl border border-line bg-ink-850/60 p-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      title={preset.name}
                      onClick={() =>
                        onChange({
                          dotColor: preset.from,
                          gradientColor: preset.to,
                          gradientRotation: preset.rotation,
                          cornerColor: preset.from,
                        })
                      }
                      className="h-8 rounded-md border border-line transition-transform hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="mb-1.5 text-[11px] font-semibold text-mist">Second colour</p>
                    <Swatches
                      colors={SOLID_PRESETS.slice(0, 8)}
                      value={style.gradientColor}
                      onChange={(c) => onChange({ gradientColor: c })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Slider
                    label="Angle"
                    value={style.gradientRotation}
                    min={0}
                    max={360}
                    step={5}
                    suffix="°"
                    onChange={(v) => onChange({ gradientRotation: v })}
                  />
                  <div>
                    <p className="mb-1.5 text-[11.5px] font-semibold text-mist">Type</p>
                    <div className="flex gap-1.5">
                      {(["linear", "radial"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onChange({ gradientType: t })}
                          className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                            style.gradientType === t
                              ? "border-volt-400 bg-volt-400/12 text-volt-300"
                              : "border-line text-mist"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-[11.5px] font-semibold text-mist">Eyes colour</p>
              <Swatches
                colors={SOLID_PRESETS}
                value={style.cornerColor}
                onChange={(c) => onChange({ cornerColor: c })}
              />
            </div>

            <div>
              <p className="mb-2 text-[11.5px] font-semibold text-mist">Background</p>
              <Swatches
                colors={["#FFFFFF", "#F4F6FA", "#0E1016", "#D8FF4F", "#4C7DFF", "#FFE9D6", "#E8F7EE", "#111827"]}
                value={style.backgroundColor}
                onChange={(c) => onChange({ backgroundColor: c, transparentBackground: false })}
              />
            </div>
            <Toggle
              label="Transparent background"
              hint="Best for SVG / PNG on dark artwork"
              checked={style.transparentBackground}
              onChange={(v) => onChange({ transparentBackground: v })}
            />
          </div>
        </Section>

        <Section title="Logo embed" step="D" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="btn-ghost flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12.5px] font-semibold disabled:opacity-50"
              >
                <IconSparkle width={15} height={15} />
                {busy ? "Processing…" : style.logo ? "Replace logo" : "Upload logo"}
              </button>
              {style.logo && (
                <button
                  type="button"
                  onClick={() => onChange({ logo: null })}
                  className="btn-ghost rounded-lg px-3 py-2.5 text-[12.5px] font-semibold text-coral-400"
                >
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  void handleLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            {style.logo && (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-ink-850/60 p-3">
                <span className="checker grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={style.logo} alt="Embedded logo" className="h-full w-full object-contain" />
                </span>
                <div className="flex-1 space-y-2.5">
                  <Slider
                    label="Logo size"
                    value={Math.round(style.logoScale * 100)}
                    min={10}
                    max={45}
                    suffix="%"
                    onChange={(v) => onChange({ logoScale: v / 100 })}
                  />
                  <Slider
                    label="Logo padding"
                    value={style.logoMargin}
                    min={0}
                    max={14}
                    onChange={(v) => onChange({ logoMargin: v })}
                  />
                </div>
              </div>
            )}
            <Toggle
              label="Clear dots behind logo"
              hint="Keeps the centre readable"
              checked={style.hideBackgroundDots}
              onChange={(v) => onChange({ hideBackgroundDots: v })}
            />
            <p className="text-[11px] leading-relaxed text-mist-dim">
              Logos need redundancy. Error correction is locked to <span className="text-volt-400">H (30%)</span> when
              a logo is embedded so the code keeps scanning in the real world.
            </p>
          </div>
        </Section>

        <Section title="Call-to-action frame" step="E" defaultOpen={false}>
          <div className="space-y-3">
            <Toggle
              label="Add frame"
              hint="Rendered into PNG, JPEG, SVG and PDF exports"
              checked={style.frame.enabled}
              onChange={(v) => onChange({ frame: { ...style.frame, enabled: v } })}
            />
            {style.frame.enabled && (
              <div className="space-y-3 rounded-xl border border-line bg-ink-850/60 p-3">
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-semibold text-mist">Frame text</label>
                  <input
                    className="input-base font-mono text-[12.5px] uppercase"
                    maxLength={28}
                    value={style.frame.text}
                    onChange={(e) => onChange({ frame: { ...style.frame, text: e.target.value } })}
                    placeholder="SCAN ME"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["classic", "banner", "minimal"] as const).map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => onChange({ frame: { ...style.frame, variant } })}
                      className={`rounded-lg border px-2 py-2 text-[11px] font-semibold capitalize transition-all ${
                        style.frame.variant === variant
                          ? "border-volt-400 bg-volt-400/12 text-volt-300"
                          : "border-line text-mist hover:border-ink-600"
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="mb-1.5 text-[11.5px] font-semibold text-mist">Text colour</p>
                  <Swatches
                    colors={SOLID_PRESETS}
                    value={style.frame.color}
                    onChange={(c) => onChange({ frame: { ...style.frame, color: c } })}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-[11.5px] font-semibold text-mist">Bar colour</p>
                  <Swatches
                    colors={["#D8FF4F", "#4C7DFF", "#FF5F3C", "#0E1016", "#FFFFFF", "#12A870", "#FFC53D", "#B026FF"]}
                    value={style.frame.background}
                    onChange={(c) => onChange({ frame: { ...style.frame, background: c } })}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Advanced" step="F" defaultOpen={false}>
          <div className="space-y-4">
            <Slider
              label="Quiet zone (margin)"
              value={style.margin}
              min={0}
              max={10}
              suffix=" modules"
              onChange={(v) => onChange({ margin: v })}
            />
            <div>
              <p className="mb-1.5 text-[11.5px] font-semibold text-mist">Error correction</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ errorCorrection: level })}
                    className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all ${
                      style.errorCorrection === level
                        ? "border-volt-400 bg-volt-400/12 text-volt-300"
                        : "border-line text-mist hover:border-ink-600"
                    }`}
                  >
                    {level}
                    <span className="mt-0.5 block font-mono text-[8.5px] opacity-70">
                      {level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11.5px] font-semibold text-mist">Export resolution</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[500, 1000, 2000, 3000].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange({ size })}
                    className={`rounded-lg border px-1 py-2 font-mono text-[10.5px] transition-all ${
                      style.size === size
                        ? "border-volt-400 bg-volt-400/12 text-volt-300"
                        : "border-line text-mist hover:border-ink-600"
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
