import { getAnalytics } from "@/lib/analytics";
import { findVisibleCode, jsonError, requestOrigin, serializeCode } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const row = await findVisibleCode(id);
    if (!row) return jsonError("QR code not found.", 404);

    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") ?? "30") || 30;
    const analytics = await getAnalytics(row, days);

    return Response.json({ code: serializeCode(row, requestOrigin(req)), ...analytics });
  } catch (error) {
    console.error("analytics failed", error);
    return jsonError("Could not load analytics.", 500);
  }
}
