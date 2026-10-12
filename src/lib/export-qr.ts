import type { QRStyle } from "./types";
import { buildStylingOptions, type QrStylingConstructor, type QrStylingInstance } from "./qr-style";

export type ExportFormat = "png" | "jpeg" | "webp" | "svg" | "pdf";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not decode QR image"));
      img.src = url;
    });
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}

export function frameGeometry(size: number, style: QRStyle) {
  if (!style.frame.enabled) return { width: size, height: size, barHeight: 0, pad: 0 };
  const pad = Math.round(size * 0.06);
  const barHeight = style.frame.variant === "minimal" ? Math.round(size * 0.14) : Math.round(size * 0.17);
  return { width: size + pad * 2, height: size + pad * 2 + barHeight, barHeight, pad };
}

/**
 * Builds a throwaway high-resolution renderer so exports are independent from
 * whatever resolution the on-screen preview happens to use.
 */
async function withExportInstance<T>(
  style: QRStyle,
  data: string,
  drawType: "canvas" | "svg",
  size: number,
  run: (instance: QrStylingInstance) => Promise<T>,
): Promise<T> {
  const mod = (await import("qr-code-styling")) as unknown as { default: QrStylingConstructor };
  const Ctor = mod.default ?? (mod as unknown as QrStylingConstructor);
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;left:-100000px;top:0;width:16px;height:16px;overflow:hidden;opacity:0;pointer-events:none";
  document.body.appendChild(holder);
  try {
    const instance = new Ctor(buildStylingOptions(style, data, size, drawType));
    instance.append(holder);
    // Give the logo image (if any) a beat to decode before we rasterise.
    await new Promise((resolve) => setTimeout(resolve, style.logo ? 320 : 60));
    return await run(instance);
  } finally {
    holder.remove();
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, style: QRStyle, size: number) {
  const { width, barHeight, pad } = frameGeometry(size, style);
  const frame = style.frame;
  const barY = pad + size;
  const fontSize = Math.round(barHeight * 0.42);
  const label = (frame.text || "SCAN ME").toUpperCase();
  const pillW = Math.min(width * 0.9, label.length * fontSize * 0.74 + fontSize * 2.4);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (frame.variant === "classic") {
    ctx.fillStyle = frame.background;
    ctx.fillRect(pad * 0.3, barY, width - pad * 0.6, barHeight);
  } else if (frame.variant === "banner") {
    const pillH = barHeight * 0.7;
    const x = (width - pillW) / 2;
    const y = barY + (barHeight - pillH) / 2;
    const r = pillH / 2;
    ctx.fillStyle = frame.background;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + pillW, y, x + pillW, y + pillH, r);
    ctx.arcTo(x + pillW, y + pillH, x, y + pillH, r);
    ctx.arcTo(x, y + pillH, x, y, r);
    ctx.arcTo(x, y, x + pillW, y, r);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = frame.color;
  ctx.font = `700 ${fontSize}px "Space Grotesk", "Manrope", system-ui, sans-serif`;
  try {
    const withSpacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    if ("letterSpacing" in withSpacing) withSpacing.letterSpacing = `${Math.round(fontSize * 0.14)}px`;
  } catch {
    /* unsupported */
  }
  ctx.fillText(label, width / 2, barY + barHeight / 2);
}

async function composeCanvas(style: QRStyle, data: string, size: number): Promise<HTMLCanvasElement> {
  return withExportInstance(style, data, "canvas", size, async (instance) => {
    const raw = await instance.getRawData("png");
    if (!raw) throw new Error("QR renderer returned no data");
    const img = await blobToImage(raw);
    const { width, height, pad } = frameGeometry(size, style);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser");
    if (!style.transparentBackground) {
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, pad, pad, size, size);
    if (style.frame.enabled) {
      if (style.transparentBackground) {
        ctx.fillStyle = style.frame.variant === "minimal" ? "rgba(0,0,0,0)" : style.backgroundColor;
        ctx.fillRect(0, pad + size, width, height - pad - size);
      }
      drawFrame(ctx, style, size);
    }
    return canvas;
  });
}

export async function exportRaster(
  style: QRStyle,
  data: string,
  format: "png" | "jpeg" | "webp",
  filename: string,
) {
  const size = Math.max(240, Math.min(4000, style.size));
  const canvas = await composeCanvas(style, data, size);
  if (format === "jpeg") {
    const ctx = canvas.getContext("2d");
    if (ctx && style.transparentBackground) {
      const flat = document.createElement("canvas");
      flat.width = canvas.width;
      flat.height = canvas.height;
      const fctx = flat.getContext("2d");
      if (fctx) {
        fctx.fillStyle = "#ffffff";
        fctx.fillRect(0, 0, flat.width, flat.height);
        fctx.drawImage(canvas, 0, 0);
      }
      canvas.width = flat.width;
      canvas.height = flat.height;
      if (ctx) ctx.drawImage(flat, 0, 0);
    }
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, `image/${format}`, format === "jpeg" ? 0.95 : 1),
  );
  if (!blob) throw new Error("Export failed");
  triggerDownload(blob, `${filename}.${format === "jpeg" ? "jpg" : format}`);
}

export async function exportSvg(style: QRStyle, data: string, filename: string) {
  const size = style.size;
  const composed = await withExportInstance(style, data, "svg", size, async (instance) => {
    const raw = await instance.getRawData("svg");
    if (!raw) throw new Error("QR renderer returned no SVG");
    let svg = await raw.text();
    svg = svg.replace(/<\?xml[^>]*\?>/, "").trim();
    const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    const { width, height, barHeight, pad } = frameGeometry(size, style);
    const bg = style.transparentBackground ? "none" : style.backgroundColor;
    const fontSize = Math.round(barHeight * 0.42);
    const label = (style.frame.text || "SCAN ME").toUpperCase().replace(/[<>&"]/g, "");
    const pillW = Math.min(width * 0.9, label.length * fontSize * 0.74 + fontSize * 2.4);
    const pillH = barHeight * 0.7;

    let frameMarkup = "";
    if (style.frame.enabled) {
      if (style.frame.variant === "classic") {
        frameMarkup = `<rect x="${pad * 0.3}" y="${pad + size}" width="${width - pad * 0.6}" height="${barHeight}" fill="${style.frame.background}"/>`;
      } else if (style.frame.variant === "banner") {
        frameMarkup = `<rect x="${(width - pillW) / 2}" y="${pad + size + (barHeight - pillH) / 2}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${style.frame.background}"/>`;
      }
      frameMarkup += `<text x="${width / 2}" y="${pad + size + barHeight / 2}" font-family="'Plus Jakarta Sans','Inter',sans-serif" font-size="${fontSize}" font-weight="700" fill="${style.frame.color}" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${bg}"/><svg x="${pad}" y="${pad}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>${frameMarkup}</svg>`;
  });

  triggerDownload(new Blob([composed], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
}

export async function exportPdf(
  style: QRStyle,
  data: string,
  filename: string,
  meta: { name: string; link: string; kindLabel: string },
) {
  const [{ default: JsPdf }] = await Promise.all([import("jspdf")]);
  const size = 1400;
  const canvas = await composeCanvas(style, data, size);
  const dataUrl = canvas.toDataURL("image/png");

  const pdf = new JsPdf({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  pdf.setFillColor("#0E1016");
  pdf.rect(0, 0, pageW, 104, "F");
  pdf.setTextColor("#D8FF4F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("ALTECH HUB  ·  QR STUDIO", 48, 44);
  pdf.setTextColor("#8992A5");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text(meta.kindLabel.toUpperCase(), 48, 62);
  pdf.setTextColor("#EDEFF4");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(meta.name.slice(0, 44), pageW - 48, 52, { align: "right" });

  const qrW = Math.min(340, pageW - 180);
  const qrH = (qrW * canvas.height) / canvas.width;
  pdf.addImage(dataUrl, "PNG", (pageW - qrW) / 2, 158, qrW, qrH);

  const below = Math.min(pageH - 150, 158 + qrH + 42);
  pdf.setTextColor("#111418");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Scan to continue", pageW / 2, below, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor("#4A5262");
  pdf.text(meta.link.slice(0, 84), pageW / 2, below + 20, { align: "center" });

  pdf.setDrawColor("#DDE1E8");
  pdf.line(48, pageH - 74, pageW - 48, pageH - 74);
  pdf.setFontSize(8);
  pdf.setTextColor("#8A93A6");
  pdf.text(
    `Generated ${new Date().toLocaleString()} · Destination editable any time · qr.altech.hub`,
    pageW / 2,
    pageH - 52,
    { align: "center" },
  );

  pdf.save(`${filename}.pdf`);
}

export async function rasterBlob(style: QRStyle, data: string, size = 1000): Promise<Blob> {
  const canvas = await composeCanvas(style, data, size);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!blob) throw new Error("Export failed");
  return blob;
}

export async function rasterDataUrl(style: QRStyle, data: string, size = 900): Promise<string> {
  const canvas = await composeCanvas(style, data, size);
  return canvas.toDataURL("image/png");
}

export async function downloadFile(
  style: QRStyle,
  data: string,
  format: ExportFormat,
  filename: string,
  meta: { name: string; link: string; kindLabel: string },
) {
  if (format === "svg") return exportSvg(style, data, filename);
  if (format === "pdf") return exportPdf(style, data, filename, meta);
  return exportRaster(style, data, format, filename);
}
