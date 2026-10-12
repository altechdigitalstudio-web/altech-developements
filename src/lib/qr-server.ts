import QRCode from "qrcode";
import type { QRStyle } from "./types";

/**
 * Server-side raster generation. Used for dashboard thumbnails, API embeds and
 * the redirect interstitial — anywhere the browser canvas isn't available.
 */
export async function renderQrPng(value: string, style: Partial<QRStyle> = {}, size = 240): Promise<Buffer> {
  const data = value || "https://altech.hub";
  return QRCode.toBuffer(data, {
    type: "png",
    width: size,
    margin: style.margin ?? 2,
    errorCorrectionLevel: style.errorCorrection ?? "H",
    color: {
      dark: normalizeColor(style.dotColor ?? "#0E1015"),
      light: style.transparentBackground ? "#00000000" : normalizeColor(style.backgroundColor ?? "#FFFFFF"),
    },
  });
}

export async function renderQrSvg(value: string, style: Partial<QRStyle> = {}): Promise<string> {
  const data = value || "https://altech.hub";
  return QRCode.toString(data, {
    type: "svg",
    margin: style.margin ?? 2,
    errorCorrectionLevel: style.errorCorrection ?? "H",
    color: {
      dark: normalizeColor(style.dotColor ?? "#0E1015"),
      light: style.transparentBackground ? "#00000000" : normalizeColor(style.backgroundColor ?? "#FFFFFF"),
    },
  });
}

export async function renderQrDataUrl(value: string, style: Partial<QRStyle> = {}, size = 240): Promise<string> {
  const data = value || "https://altech.hub";
  return QRCode.toDataURL(data, {
    width: size,
    margin: style.margin ?? 2,
    errorCorrectionLevel: style.errorCorrection ?? "H",
    color: {
      dark: normalizeColor(style.dotColor ?? "#0E1015"),
      light: style.transparentBackground ? "#00000000" : normalizeColor(style.backgroundColor ?? "#FFFFFF"),
    },
  });
}

/** QRCode lib wants 8-digit hex with alpha last (#RRGGBBAA). */
function normalizeColor(input: string): string {
  const value = input.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return `${value}ff`;
  if (/^#[0-9a-f]{8}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const expanded = value
      .slice(1)
      .split("")
      .map((c) => `${c}${c}`)
      .join("");
    return `#${expanded}ff`;
  }
  if (value.toLowerCase() === "transparent") return "#00000000";
  return "#0e1015ff";
}
