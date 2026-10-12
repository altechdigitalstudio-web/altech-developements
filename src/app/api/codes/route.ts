import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes, scans } from "@/db/schema";
import { buildValue } from "@/lib/content";
import { slugSeed, getWorkspaceId, getCurrentUser } from "@/lib/auth";
import { jsonError, mergeStyle, readJson, requestOrigin, serializeCode, shortLink, visibleScope } from "@/lib/api";

export const dynamic = "force-dynamic";

type CreateBody = {
  name?: string;
  kind?: string;
  fields?: Record<string, string>;
  isDynamic?: boolean;
  destination?: string;
  style?: unknown;
};

export async function GET(req: Request) {
  try {
    const origin = requestOrigin(req);
    const { condition } = await visibleScope();
    const rows = await db.select().from(qrCodes).where(condition).orderBy(sql`${qrCodes.createdAt} desc`);

    const ids = rows.map((r) => r.id);
    const scanStats = ids.length
      ? await db
          .select({
            total: sql<number>`count(*)::int`,
            last7: sql<number>`count(*) filter (where ${scans.createdAt} > now() - interval '7 days')::int`,
          })
          .from(scans)
          .where(inArray(scans.qrCodeId, ids))
      : [{ total: 0, last7: 0 }];

    return Response.json({
      codes: rows.map((row) => serializeCode(row, origin)),
      stats: {
        total: rows.length,
        dynamic: rows.filter((r) => r.isDynamic).length,
        scans: scanStats[0]?.total ?? 0,
        scans7d: scanStats[0]?.last7 ?? 0,
      },
    });
  } catch (error) {
    console.error("list codes failed", error);
    return jsonError("Could not load your QR codes.", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson<CreateBody>(req);
    const origin = requestOrigin(req);
    const [user, workspaceId] = await Promise.all([getCurrentUser(), getWorkspaceId()]);

    const kind = body.kind ?? "url";
    const fields = body.fields ?? {};
    const value = buildValue(kind, fields);
    if (!value) return jsonError("Fill in the required fields for this QR type.", 400);

    const isDynamic = body.isDynamic !== false;
    const slug = slugSeed(isDynamic ? "q" : "s");
    const destination = isDynamic ? body.destination?.trim() || value : null;
    const encoded = isDynamic ? shortLink(origin, slug) : value;

    const [created] = await db
      .insert(qrCodes)
      .values({
        userId: user?.id ?? null,
        workspaceId,
        name: (body.name ?? "").trim() || `${kind.toUpperCase()} QR code`,
        slug,
        kind,
        fields,
        value: encoded,
        isDynamic,
        destination,
        style: mergeStyle(body.style),
        status: "active",
      })
      .returning();

    return Response.json({ code: serializeCode(created, origin) }, { status: 201 });
  } catch (error) {
    console.error("create code failed", error);
    return jsonError("Could not create the QR code.", 500);
  }
}
