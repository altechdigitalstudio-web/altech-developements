import { createSession, getCurrentUser } from "@/lib/auth";
import { ensureDemoUser, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed";
import { jsonError } from "@/lib/api";

export async function POST() {
  try {
    const existing = await getCurrentUser();
    const userId = await ensureDemoUser();
    if (!existing || existing.id !== userId) await createSession(userId);
    return Response.json({ ok: true, email: DEMO_EMAIL, password: DEMO_PASSWORD });
  } catch (error) {
    console.error("demo login failed", error);
    return jsonError("Could not start the demo workspace.", 500);
  }
}
