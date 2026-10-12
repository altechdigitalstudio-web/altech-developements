import { and, eq, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes, type QrCode } from "@/db/schema";
import { getCurrentUser, getWorkspaceId } from "./auth";
import type { QRStyle, QrCodeRow } from "./types";
import { defaultStyle } from "./types";

export function requestOrigin(req: Request): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (forwardedHost) return `${proto}://${forwardedHost}`;
  try {
    return new URL(req.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function shortLink(origin: string, slug: string): string {
  return `${origin}/s/${slug}`;
}

export function mergeStyle(input: unknown): QRStyle {
  const raw = (input ?? {}) as Partial<QRStyle>;
  const frame = { ...defaultStyle.frame, ...(raw.frame ?? {}) };
  return { ...defaultStyle, ...raw, frame };
}

export function serializeCode(row: QrCode, origin: string): QrCodeRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    kind: row.kind,
    fields: (row.fields ?? {}) as Record<string, string>,
    value: row.isDynamic ? shortLink(origin, row.slug) : row.value,
    isDynamic: row.isDynamic,
    destination: row.destination,
    style: mergeStyle(row.style),
    status: row.status,
    scans: row.scans,
    lastScanAt: row.lastScanAt ? row.lastScanAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Codes visible to the current session: owned by the user, or by the guest workspace. */
export async function visibleScope() {
  const [user, workspaceId] = await Promise.all([getCurrentUser(), getWorkspaceId()]);
  const condition = user
    ? or(eq(qrCodes.userId, user.id), and(isNull(qrCodes.userId), eq(qrCodes.workspaceId, workspaceId)))
    : eq(qrCodes.workspaceId, workspaceId);
  return { user, workspaceId, condition };
}

export async function listVisibleCodes(): Promise<QrCode[]> {
  const { condition } = await visibleScope();
  return db.select().from(qrCodes).where(condition).orderBy(sql`${qrCodes.createdAt} desc`);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findVisibleCode(id: string): Promise<QrCode | null> {
  if (!UUID_RE.test(id ?? "")) return null;
  const { condition } = await visibleScope();
  const rows = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, id), condition))
    .limit(1);
  return rows[0] ?? null;
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function safeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "qr-code"
  );
}
