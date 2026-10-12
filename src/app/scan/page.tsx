import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScanClient } from "@/components/ScanClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QR scanner & decoder",
  description:
    "Decode any QR code from an image or your camera — Wi-Fi, vCard, events, geo, crypto and links parsed into fields, entirely in your browser.",
};

export default async function ScanPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
      <main className="relative min-h-screen px-5 pb-16 pt-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_65%)]" />
        <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-signal-500/10 blur-[120px]" />
        <div className="relative">
          <ScanClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
