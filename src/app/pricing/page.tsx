import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Pricing } from "@/components/home/Pricing";
import { Faq } from "@/components/home/Faq";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { IconCheck, IconClose } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Free static QR codes forever. Pro and Business tiers add dynamic volume, analytics depth, bulk runs and team tooling.",
};

const MATRIX: { feature: string; free: string | boolean; pro: string | boolean; business: string | boolean }[] = [
  { feature: "Static QR codes", free: "Unlimited", pro: "Unlimited", business: "Unlimited" },
  { feature: "Dynamic QR codes", free: "3", pro: "250", business: "Unlimited" },
  { feature: "Content formats", free: "All 20", pro: "All 20", business: "All 20" },
  { feature: "Export formats", free: "PNG, JPEG, SVG, WebP, PDF", pro: "PNG, JPEG, SVG, WebP, PDF", business: "+ Print bundles" },
  { feature: "Max export resolution", free: "1000px", pro: "3000px", business: "4000px" },
  { feature: "Logo embed + auto ECC-H", free: true, pro: true, business: true },
  { feature: "Gradients, dots & eyes", free: true, pro: true, business: true },
  { feature: "Brand CTA frames", free: true, pro: true, business: true },
  { feature: "Editable destinations", free: false, pro: true, business: true },
  { feature: "Pause / resume switch", free: false, pro: true, business: true },
  { feature: "Scanner location map & analytics", free: "Last 7 days", pro: "365 days + Map + CSV", business: "365 days + Webhooks" },
  { feature: "Bulk CSV generation", free: false, pro: "500 rows", business: "500 rows per run" },
  { feature: "Custom short-link slugs", free: false, pro: true, business: true },
  { feature: "Folders, tags & search", free: false, pro: false, business: true },
  { feature: "Seats", free: "1", pro: "1", business: "5" },
  { feature: "Custom vanity root domain", free: false, pro: false, business: "Enterprise" },
  { feature: "Support", free: "Documentation", pro: "Email (24h)", business: "Priority support (12h)" },
];

const cell = (value: string | boolean) =>
  typeof value === "boolean" ? (
    value ? (
      <IconCheck width={16} height={16} className="mx-auto text-emerald-500" />
    ) : (
      <IconClose width={15} height={15} className="mx-auto text-dim" />
    )
  ) : (
    <span className="text-xs font-semibold text-muted">{value}</span>
  );

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-line pt-16 pb-12">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="relative mx-auto max-w-[1400px] px-5 text-center lg:px-8">
            <Reveal>
              <span className="eyebrow">Plans & Pricing</span>
              <h1 className="mx-auto mt-3 max-w-3xl text-[clamp(2.2rem,4.8vw,3.6rem)] font-extrabold tracking-tight text-main">
                Transparent plans for individuals and teams.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">
                The free tier is completely functional with unlimited static codes, 20 content formats, vector SVG
                exports, logo embeds, and brand frames.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/create" className="btn-volt rounded-xl px-5 py-3 text-sm font-semibold shadow-md">
                  Create a Free Code
                </Link>
                <Link href="/register" className="btn-ghost rounded-xl px-5 py-3 text-sm font-semibold shadow-sm">
                  Create Workspace
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <Pricing />

        <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Full Feature Matrix</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-main">
              Side-by-side feature comparison.
            </h2>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-card-subtle">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      Feature
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold text-main">Free</th>
                    <th className="bg-blue-50/50 dark:bg-volt-400/[0.07] px-5 py-3.5 text-center text-xs font-bold text-blue-700 dark:text-volt-300">
                      Pro
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold text-main">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row) => (
                    <tr key={row.feature} className="border-b border-line/60 last:border-0 hover:bg-card-subtle/60 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-semibold text-main">{row.feature}</td>
                      <td className="px-5 py-3.5 text-center">{cell(row.free)}</td>
                      <td className="bg-blue-50/30 dark:bg-volt-400/[0.04] px-5 py-3.5 text-center">{cell(row.pro)}</td>
                      <td className="px-5 py-3.5 text-center">{cell(row.business)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
