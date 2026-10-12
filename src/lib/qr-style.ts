import type { QRStyle } from "./types";

/** Minimal shape of the qr-code-styling instance we rely on (avoids its jsdom/canvas type deps). */
export interface QrStylingInstance {
  update: (options: Record<string, unknown>) => void;
  append: (element: HTMLElement) => void;
  getRawData: (extension?: "svg" | "png" | "jpeg" | "webp") => Promise<Blob | undefined>;
  download: (options?: { name?: string; extension?: string }) => void;
}

export type QrStylingConstructor = new (options: Record<string, unknown>) => QrStylingInstance;

type Gradient = {
  type: "linear" | "radial";
  rotation: number;
  colorStops: { offset: number; color: string }[];
};

export function gradientFor(style: QRStyle): Gradient {
  return {
    type: style.gradientType,
    rotation: (style.gradientRotation * Math.PI) / 180,
    colorStops: [
      { offset: 0, color: style.dotColor },
      { offset: 1, color: style.gradientColor },
    ],
  };
}

export function buildStylingOptions(
  style: QRStyle,
  data: string,
  renderSize: number,
  drawType: "canvas" | "svg" = "canvas",
): Record<string, unknown> {
  const background = style.transparentBackground ? "transparent" : style.backgroundColor;
  const cornerColor = style.cornerColor || style.dotColor;

  return {
    type: drawType,
    shape: style.shape,
    width: renderSize,
    height: renderSize,
    margin: style.margin * (renderSize / 300 > 1 ? 1 : 1),
    data: data || " ",
    image: style.logo || undefined,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: style.errorCorrection,
    },
    imageOptions: {
      hideBackgroundDots: style.hideBackgroundDots,
      imageSize: style.logoScale,
      margin: style.logoMargin,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      type: style.dotType,
      color: style.useGradient ? "#00000000" : style.dotColor,
      ...(style.useGradient ? { gradient: gradientFor(style) } : {}),
    },
    cornersSquareOptions: {
      type: style.cornerSquareType,
      color: style.useGradient ? "#00000000" : cornerColor,
      ...(style.useGradient ? { gradient: gradientFor(style) } : {}),
    },
    cornersDotOptions: {
      type: style.cornerDotType,
      color: style.useGradient ? "#00000000" : cornerColor,
      ...(style.useGradient ? { gradient: gradientFor(style) } : {}),
    },
    backgroundOptions: {
      color: background,
    },
  };
}

export const DOT_TYPES: { id: QRStyle["dotType"]; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "classy", label: "Classy" },
  { id: "classy-rounded", label: "Classy round" },
  { id: "extra-rounded", label: "Soft" },
];

export const CORNER_TYPES: { id: QRStyle["cornerSquareType"]; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "extra-rounded", label: "Rounded" },
  { id: "dot", label: "Dot" },
];

export const GRADIENT_PRESETS: { name: string; from: string; to: string; rotation: number }[] = [
  { name: "Voltage", from: "#D8FF4F", to: "#2FBF71", rotation: 45 },
  { name: "Deep signal", from: "#4C7DFF", to: "#0B1B4D", rotation: 90 },
  { name: "Sunset run", from: "#FF5F3C", to: "#FFC53D", rotation: 30 },
  { name: "Neon mint", from: "#12E2A0", to: "#0A5CFF", rotation: 135 },
  { name: "Ultra violet", from: "#8B5CF6", to: "#F472B6", rotation: 60 },
  { name: "Graphite", from: "#3A4152", to: "#0E1016", rotation: 120 },
  { name: "Coral reef", from: "#FF6B6B", to: "#4C7DFF", rotation: 200 },
  { name: "Citrus", from: "#F7FF3C", to: "#FF8A00", rotation: 15 },
];

export const SOLID_PRESETS: string[] = [
  "#0E1015",
  "#1F2937",
  "#4C7DFF",
  "#2F5CE0",
  "#12A870",
  "#D8FF4F",
  "#FF5F3C",
  "#B026FF",
  "#0F766E",
  "#B91C1C",
  "#C2410C",
  "#FFFFFF",
];
