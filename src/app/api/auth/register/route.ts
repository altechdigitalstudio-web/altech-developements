import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  claimWorkspaceCodes,
  createSession,
  getWorkspaceId,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { jsonError, readJson } from "@/lib/api";

type Body = { email?: string; password?: string; name?: string; mode?: "login" | "register" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function handle(req: Request, mode: "login" | "register") {
  const body = await readJson<Body>(req);
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!EMAIL_RE.test(email)) return jsonError("Enter a valid email address.", 400);
  if (password.length < 6) return jsonError("Password must be at least 6 characters.", 400);

  const workspaceId = await getWorkspaceId();
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (mode === "register") {
    if (existing[0]) return jsonError("An account with that email already exists.", 409);
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashPassword(password),
        name: (body.name ?? email.split("@")[0]).trim(),
        plan: "pro",
        workspaceId,
      })
      .returning();
    await claimWorkspaceCodes(created.id, workspaceId);
    await createSession(created.id);
    return Response.json({
      ok: true,
      user: { name: created.name, email: created.email, plan: created.plan },
    });
  }

  const user = existing[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return jsonError("Email or password is incorrect.", 401);
  }
  await claimWorkspaceCodes(user.id, workspaceId);
  await createSession(user.id);
  return Response.json({ ok: true, user: { name: user.name, email: user.email, plan: user.plan } });
}

export async function POST(req: Request) {
  try {
    return await handle(req, "register");
  } catch (error) {
    console.error("register failed", error);
    return jsonError("Could not create the account. Please try again.", 500);
  }
}
