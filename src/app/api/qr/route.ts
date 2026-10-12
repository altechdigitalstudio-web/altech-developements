import { renderQrPng, renderQrSvg } from "@/lib/qr-server";
import type { QRStyle } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const value = url.searchParams.get("v") ?? "https://altech.hub";
  const size = Math.max(48, Math.min(2400, Number(url.searchParams.get("size") ?? "320") || 320));
  const format = url.searchParams.get("format") === "svg" ? "svg" : "png";

  const style: Partial<QRStyle> = {
    dotColor: url.searchParams.get("fg") ?? "#0E1015",
    backgroundColor: url.searchParams.get("bg") ?? "#FFFFFF",
    transparentBackground: url.searchParams.get("transparent") === "1",
    margin: Math.max(0, Math.min(8, Number(url.searchParams.get("margin") ?? "2") || 0)),
    errorCorrection: (url.searchParams.get("ecl") ?? "H") as QRStyle["errorCorrection"],
  };

  try {
    if (format === "svg") {
      const svg = await renderQrSvg(value, style);
      return new Response(svg, {
        headers: {
          "content-type": "image/svg+xml; charset=utf-8",
          "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }
    const png = await renderQrPng(value, style, size);
    return new Response(new Uint8Array(png), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Could not render QR", { status: 400 });
  }
}
