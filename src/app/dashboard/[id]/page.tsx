import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";
import { getCurrentUser } from "@/lib/auth";
import { findVisibleCode, serializeCode } from "@/lib/api";
import { getAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QR analytics",
  description: "Scan-level analytics for a single QR code: timeline, devices, countries, referrers and controls.",
};

export default async function CodeAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user, headerList] = await Promise.all([params, getCurrentUser(), headers()]);
  const row = await findVisibleCode(id);
  if (!row) notFound();

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const [analytics] = await Promise.all([getAnalytics(row, 30)]);

  return (
    <DashboardShell user={user ? { name: user.name, email: user.email } : null} plan={user?.plan}>
      <AnalyticsClient code={serializeCode(row, `${proto}://${host}`)} analytics={analytics} />
    </DashboardShell>
  );
}
