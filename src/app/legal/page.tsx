import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Privacy",
  description: "Terms and privacy policies for the Altech Hub QR Studio application.",
};

const SECTIONS = [
  {
    title: "Platform Overview",
    body: [
      "Altech Hub QR Studio is an independent QR generation and analytics platform published under altech hub.site. It provides static QR code encoding, dynamic link redirection, scan geolocation tracking, and batch CSV processing.",
      "The service is built on Next.js, PostgreSQL and Drizzle ORM. All QR encoding, redirection, and scanner location aggregation logic is hosted and managed within this fullstack application.",
    ],
  },
  {
    title: "Content & Intellectual Property",
    body: [
      "You retain full intellectual property ownership of all content, URLs, logos, and materials you encode into QR patterns. All generated codes can be used freely for commercial purposes, including product packaging, restaurant menus, conference badges, and marketing campaigns.",
      "No watermarks, copyright badges, or mandatory attributions are added to your exported PNG, SVG, PDF, or JPEG assets across any tier.",
    ],
  },
  {
    title: "Dynamic vs. Static Code Persistence",
    body: [
      "Dynamic QR codes resolve through individual short links stored in the database. They remain active indefinitely without trial expirations, artificial scan caps, or automated link disabling.",
      "Static QR codes embed data directly into the pixel pattern. They operate fully offline and will continue to scan as long as the printed medium exists.",
    ],
  },
  {
    title: "Scan Geolocation & Privacy",
    body: [
      "When a scanner scans a dynamic QR code, the platform resolves approximate location data (country, city) via Edge IP headers. Device type, operating system, browser, language, and referring application are logged strictly for aggregate campaign intelligence.",
      "No raw personal IP addresses are stored or cross-referenced, and no third-party tracking pixels or advertising cookies are embedded on redirect pages.",
    ],
  },
];

export default async function LegalPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-line py-16">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="relative mx-auto max-w-[840px] px-5 lg:px-8">
            <span className="eyebrow">Terms & Privacy</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-main">
              Privacy and Usage Policies
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Clear, transparent guidelines regarding your QR codes, scan analytics, and data privacy.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[840px] px-5 py-12 lg:px-8">
          <div className="space-y-10">
            {SECTIONS.map((section, index) => (
              <article key={section.title}>
                <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-main">
                  <span className="font-mono text-xs text-blue-600 dark:text-volt-400">
                    0{index + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-3 space-y-2.5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-sm leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-line bg-card p-6 shadow-sm">
            <p className="text-xs leading-relaxed text-muted">
              Have questions regarding payload formats, vector exports, or print resolutions?{" "}
              <Link href="/create" className="font-semibold text-blue-600 dark:text-volt-400 underline underline-offset-4">
                Open the QR Studio
              </Link>{" "}
              to test scan any format live on your device.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
