import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, qrCodes, type User } from "@/db/schema";

export const SESSION_COOKIE = "altech_session";
export const WORKSPACE_COOKIE = "altech_ws";
const SESSION_DAYS = 30;

const secret = () => process.env.SESSION_SECRET || "altech-hub-dev-secret";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function signToken(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex").slice(0, 24);
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Guest workspace identifier. The cookie itself is minted in middleware (it is
 * the only place that can write cookies on a plain document request); here we
 * just read it, with a safe fallback for non-HTTP callers.
 */
export async function getWorkspaceId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(WORKSPACE_COOKIE)?.value;
  if (existing && existing.length >= 8) return existing;
  const fresh = `ws_${randomBytes(12).toString("hex")}`;
  try {
    jar.set(WORKSPACE_COOKIE, fresh, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    /* read-only context (Server Component) — middleware will set it */
  }
  return fresh;
}

export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const rows = await db
      .select({ user: users, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.token, token))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await db.delete(sessions).where(eq(sessions.token, token));
      return null;
    }
    return row.user;
  } catch {
    return null;
  }
}

/** Attach any guest (workspace-only) codes to a freshly authenticated account. */
export async function claimWorkspaceCodes(userId: string, workspaceId: string | null): Promise<void> {
  if (!workspaceId) return;
  try {
    await db
      .update(qrCodes)
      .set({ userId, updatedAt: new Date() })
      .where(eq(qrCodes.workspaceId, workspaceId));
  } catch {
    /* non-fatal */
  }
}

export function slugSeed(prefix = "qr"): string {
  const words = ["signal", "pulse", "vector", "orbit", "beacon", "flux", "atlas", "nova", "quanta", "relay"];
  const word = words[Math.floor(Math.random() * words.length)];
  return `${prefix}-${word}-${randomBytes(3).toString("hex")}`;
}
