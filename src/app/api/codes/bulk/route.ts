import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { buildValue, contentTypeMap } from "@/lib/content";
import { getCurrentUser, getWorkspaceId, slugSeed } from "@/lib/auth";
import { jsonError, mergeStyle, readJson, requestOrigin, serializeCode, shortLink } from "@/lib/api";

export const dynamic = "force-dynamic";

type BulkRow = {
  name?: string;
  kind?: string;
  fields?: Record<string, string>;
  destination?: string;
};

type BulkBody = {
  rows?: BulkRow[];
  isDynamic?: boolean;
  style?: unknown;
};

export async function POST(req: Request) {
  try {
    const body = await readJson<BulkBody>(req);
    const rows = (body.rows ?? []).slice(0, 500);
    if (!rows.length) return jsonError("No rows to import.", 400);

    const origin = requestOrigin(req);
    const [user, workspaceId] = await Promise.all([getCurrentUser(), getWorkspaceId()]);
    const style = mergeStyle(body.style);
    const isDynamic = body.isDynamic !== false;

    const values = rows.flatMap((row, index) => {
      const kind = row.kind && contentTypeMap[row.kind] ? row.kind : "url";
      const fields = row.fields ?? {};
      const payload = buildValue(kind, fields);
      if (!payload) return [];
      const slug = slugSeed("b");
      return [
        {
          userId: user?.id ?? null,
          workspaceId,
          name: (row.name ?? "").trim() || `${contentTypeMap[kind].label} #${index + 1}`,
          slug,
          kind,
          fields,
          value: isDynamic ? shortLink(origin, slug) : payload,
          isDynamic,
          destination: isDynamic ? row.destination?.trim() || payload : null,
          style,
          status: "active",
        },
      ];
    });

    if (!values.length) return jsonError("Every row was empty — check your CSV columns.", 400);

    const created = await db.insert(qrCodes).values(values).returning();
    return Response.json({
      created: created.length,
      codes: created.map((row) => serializeCode(row, origin)),
    });
  } catch (error) {
    console.error("bulk create failed", error);
    return jsonError("Bulk generation failed.", 500);
  }
}
