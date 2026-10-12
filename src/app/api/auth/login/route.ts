import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { claimWorkspaceCodes, createSession, getWorkspaceId, verifyPassword } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  try {
    const body = await readJson<{ email?: string; password?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!EMAIL_RE.test(email) || !password) return jsonError("Enter your email and password.", 400);

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return jsonError("Email or password is incorrect.", 401);
    }

    const workspaceId = await getWorkspaceId();
    await claimWorkspaceCodes(user.id, workspaceId);
    await createSession(user.id);
    return Response.json({ ok: true, user: { name: user.name, email: user.email, plan: user.plan } });
  } catch (error) {
    console.error("login failed", error);
    return jsonError("Could not sign in. Please try again.", 500);
  }
}
