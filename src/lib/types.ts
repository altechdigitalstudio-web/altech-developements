export type DotType =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type CornerType = "square" | "dot" | "rounded" | "extra-rounded" | "dots" | "classy";

export type QRStyle = {
  /** export resolution in px (square) */
  size: number;
  /** quiet zone in modules */
  margin: number;
  shape: "square" | "circle";
  dotType: DotType;
  cornerSquareType: CornerType;
  cornerDotType: CornerType;
  dotColor: string;
  useGradient: boolean;
  gradientType: "linear" | "radial";
  gradientRotation: number;
  gradientColor: string;
  cornerColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  logo: string | null;
  logoScale: number;
  logoMargin: number;
  hideBackgroundDots: boolean;
  errorCorrection: "L" | "M" | "Q" | "H";
  frame: {
    enabled: boolean;
    text: string;
    variant: "classic" | "banner" | "minimal";
    color: string;
    background: string;
  };
};

export const defaultStyle: QRStyle = {
  size: 1200,
  margin: 2,
  shape: "square",
  dotType: "extra-rounded",
  cornerSquareType: "extra-rounded",
  cornerDotType: "dot",
  dotColor: "#0E1015",
  useGradient: false,
  gradientType: "linear",
  gradientRotation: 45,
  gradientColor: "#4C7DFF",
  cornerColor: "#0E1015",
  backgroundColor: "#FFFFFF",
  transparentBackground: false,
  logo: null,
  logoScale: 0.28,
  logoMargin: 2,
  hideBackgroundDots: true,
  errorCorrection: "H",
  frame: {
    enabled: false,
    text: "SCAN ME",
    variant: "classic",
    color: "#0E1015",
    background: "#D8FF4F",
  },
};

export type FieldDef = {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "email"
    | "tel"
    | "url"
    | "number"
    | "datetime-local"
    | "select"
    | "password"
    | "color";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  hint?: string;
  half?: boolean;
};

export type ContentTypeDef = {
  id: string;
  label: string;
  group: "core" | "contact" | "social" | "utility" | "commerce";
  blurb: string;
  fields: FieldDef[];
  defaults: Record<string, string>;
  build: (values: Record<string, string>) => string;
  previewHint: string;
};

export type QrCodeRow = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  fields: Record<string, string>;
  value: string;
  isDynamic: boolean;
  destination: string | null;
  style: QRStyle;
  status: string;
  scans: number;
  lastScanAt: string | null;
  createdAt: string;
  updatedAt: string;
};
