import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BulkClient } from "@/components/dashboard/BulkClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulk QR generator",
  description: "Turn a CSV of rows into hundreds of branded QR codes with a ZIP of PNGs and a link manifest.",
};

export default async function BulkPage() {
  const user = await getCurrentUser();
  return (
    <DashboardShell user={user ? { name: user.name, email: user.email } : null} plan={user?.plan}>
      <BulkClient signedIn={Boolean(user)} />
    </DashboardShell>
  );
}
