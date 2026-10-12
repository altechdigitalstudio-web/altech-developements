import type { Metadata } from "next";
import { headers } from "next/headers";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getCurrentUser } from "@/lib/auth";
import { listVisibleCodes, serializeCode } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — your QR codes",
  description: "Manage, edit, pause and analyse every QR code in your Altech Hub workspace.",
};

export default async function DashboardPage() {
  const [user, rows, headerList] = await Promise.all([getCurrentUser(), listVisibleCodes(), headers()]);
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  const ids = rows.map((row) => row.id);
  const scanStats = ids.length
    ? await db
        .select({
          total: sql<number>`count(*)::int`,
          last7: sql<number>`count(*) filter (where ${scans.createdAt} > now() - interval '7 days')::int`,
        })
        .from(scans)
        .where(inArray(scans.qrCodeId, ids))
    : [{ total: 0, last7: 0 }];

  const codes = rows.map((row) => serializeCode(row, origin));

  return (
    <DashboardShell user={user ? { name: user.name, email: user.email } : null} plan={user?.plan}>
      <DashboardClient
        codes={codes}
        stats={{
          total: codes.length,
          dynamic: codes.filter((c) => c.isDynamic).length,
          scans: scanStats[0]?.total ?? 0,
          scans7d: scanStats[0]?.last7 ?? 0,
        }}
        signedIn={Boolean(user)}
      />
    </DashboardShell>
  );
}
