"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeProvider";
import { IconClose, IconMenu, LogoMark } from "./icons";

const NAV = [
  { href: "/#studio", label: "Studio" },
  { href: "/#types", label: "QR types" },
  { href: "/#analytics", label: "Analytics" },
  { href: "/scan", label: "Scanner" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader({ user }: { user: { name: string; email: string } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line/80 bg-ink-950/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative">
            <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[-6deg]" />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-bold tracking-tight text-main">
              ALTECH<span className="text-blue-600 dark:text-volt-400">HUB</span>
            </span>
            <span className="mt-0.5 block text-[11px] text-muted">
              QR Studio
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-lg px-3 py-2 text-[13.5px] font-medium text-mist transition-colors hover:text-chalk"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-[13.5px] font-semibold text-mist transition-colors hover:text-chalk"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            href="/create"
            className="btn-volt flex items-center gap-2 rounded-xl px-4 py-2 text-[13.5px] font-semibold"
          >
            Create QR code
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-lg border border-line p-2 text-chalk transition-colors hover:border-volt-400/50 md:hidden"
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-ink-900/98 px-5 pb-6 pt-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line/60 py-3 text-sm font-medium text-mist transition-colors hover:text-volt-400"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
            <span className="text-xs font-semibold text-mist">Theme</span>
            <ThemeToggle />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/dashboard" className="btn-ghost rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <Link href="/create" className="btn-volt rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
              Create QR
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
