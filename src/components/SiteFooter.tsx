import Link from "next/link";
import { ThemeToggle } from "./ThemeProvider";
import { LogoMark, IconArrowRight } from "./icons";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "QR Studio", href: "/create" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Bulk generator", href: "/dashboard/bulk" },
      { label: "QR scanner", href: "/scan" },
      { label: "Analytics", href: "/#analytics" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "QR types",
    links: [
      { label: "Dynamic URL", href: "/create?kind=url" },
      { label: "Wi-Fi", href: "/create?kind=wifi" },
      { label: "vCard contact", href: "/create?kind=vcard" },
      { label: "Calendar event", href: "/create?kind=event" },
      { label: "Crypto payment", href: "/create?kind=crypto" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Getting started", href: "/#how" },
      { label: "Print guidelines", href: "/#how" },
      { label: "Scan API", href: "/#analytics" },
      { label: "Status", href: "/#status" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "altech hub.site", href: "https://altech.hub" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Terms", href: "/legal" },
      { label: "Privacy", href: "/legal" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-ink-900">
      <div className="pointer-events-none absolute inset-0 dot-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-volt-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.6fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-9 w-9" />
              <div>
                <div className="text-base font-bold tracking-tight text-main">
                  ALTECH<span className="text-blue-600 dark:text-volt-400">HUB</span>
                </div>
                <div className="text-xs text-muted">QR Studio</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">
              A side project from <span className="text-chalk">altech hub.site</span> — every premium QR feature, no
              paywall theatre. Static codes are free forever; dynamic codes come with editable destinations and
              full-funnel scan analytics.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-ink-850 px-3 py-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-volt-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-volt-400" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist">
                all systems operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt-400">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-[13.5px] text-mist transition-colors hover:text-chalk"
                      >
                        {link.label}
                        <IconArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ALTECH HUB · qr.altech.hub</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-dim">PostgreSQL + Drizzle</span>
            <span className="hidden sm:inline text-dim">·</span>
            <span className="text-dim">No user tracking</span>
            <ThemeToggle className="ml-2" />
          </div>
        </div>
      </div>
    </footer>
  );
}
