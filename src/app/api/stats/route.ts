import { getPublicStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getPublicStats();
  return Response.json(stats, { headers: { "cache-control": "no-store" } });
}
