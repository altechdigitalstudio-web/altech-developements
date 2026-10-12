import { eq } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { buildValue } from "@/lib/content";
import { findVisibleCode, jsonError, mergeStyle, readJson, requestOrigin, serializeCode, shortLink } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await findVisibleCode(id);
  if (!row) return jsonError("QR code not found.", 404);
  return Response.json({ code: serializeCode(row, requestOrigin(req)) });
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const row = await findVisibleCode(id);
    if (!row) return jsonError("QR code not found.", 404);

    const body = await readJson<{
      name?: string;
      kind?: string;
      fields?: Record<string, string>;
      isDynamic?: boolean;
      destination?: string;
      style?: unknown;
      status?: string;
      slug?: string;
    }>(req);
    const origin = requestOrigin(req);

    const kind = body.kind ?? row.kind;
    const fields = body.fields ?? (row.fields as Record<string, string>);
    const rebuilt = body.fields || body.kind ? buildValue(kind, fields) : row.value;
    const isDynamic = body.isDynamic ?? row.isDynamic;
    const destination = isDynamic
      ? (body.destination ?? row.destination ?? (kind === row.kind && !body.fields ? row.destination : rebuilt)) ||
        rebuilt
      : null;

    let slug = row.slug;
    if (body.slug !== undefined && body.slug !== row.slug) {
      const desired = body.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
      if (desired.length < 3) return jsonError("Custom slugs need at least 3 characters.", 400);
      const clash = await db.select().from(qrCodes).where(eq(qrCodes.slug, desired)).limit(1);
      if (clash[0] && clash[0].id !== row.id) return jsonError("That slug is already taken.", 409);
      slug = desired;
    }

    const encoded = isDynamic ? shortLink(origin, slug) : rebuilt;

    const [updated] = await db
      .update(qrCodes)
      .set({
        name: body.name?.trim() || row.name,
        kind,
        fields,
        slug,
        value: encoded,
        isDynamic,
        destination,
        status: body.status ?? row.status,
        style: body.style ? mergeStyle(body.style) : mergeStyle(row.style),
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.id, row.id))
      .returning();

    return Response.json({ code: serializeCode(updated, origin) });
  } catch (error) {
    console.error("update code failed", error);
    return jsonError("Could not update the QR code.", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const row = await findVisibleCode(id);
    if (!row) return jsonError("QR code not found.", 404);
    await db.delete(qrCodes).where(eq(qrCodes.id, row.id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("delete code failed", error);
    return jsonError("Could not delete the QR code.", 500);
  }
}
