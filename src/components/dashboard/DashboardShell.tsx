"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeProvider";
import { IconChart, IconEye, IconGrid, IconLayers, IconPlus, IconQr, LogoMark } from "@/components/icons";

const NAV = [
  {
    href: "/dashboard",
    label: "All codes",
    icon: IconGrid,
    match: (p: string) => p.startsWith("/dashboard") && !p.includes("/bulk"),
  },
  { href: "/dashboard/bulk", label: "Bulk generator", icon: IconLayers, match: (p: string) => p.includes("/bulk") },
  { href: "/scan", label: "Scanner", icon: IconEye, match: (p: string) => p.startsWith("/scan") },
  { href: "/pricing", label: "Plans", icon: IconChart, match: (p: string) => p.startsWith("/pricing") },
  { href: "/create", label: "QR Studio", icon: IconQr, match: (p: string) => p.startsWith("/create") },
];

export function DashboardShell({
  user,
  plan,
  children,
}: {
  user: { name: string; email: string } | null;
  plan?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const initials = (user?.name || user?.email || "guest")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 z-40 hidden h-screen flex-col border-r border-line bg-ink-900/70 lg:flex">
        <Link href="/" className="flex items-center gap-3 border-b border-line px-5 py-4">
          <LogoMark className="h-8 w-8" />
          <span className="leading-none">
            <span className="block text-sm font-bold tracking-tight text-main">
              ALTECH<span className="text-blue-600 dark:text-volt-400">HUB</span>
            </span>
            <span className="mt-0.5 block text-[11px] text-muted">
              QR Dashboard
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all ${
                  active
                    ? "bg-volt-400/12 text-volt-300 shadow-[inset_0_0_0_1px_rgba(216,255,79,0.25)]"
                    : "text-mist hover:bg-ink-850 hover:text-chalk"
                }`}
              >
                <item.icon width={17} height={17} className={active ? "text-volt-400" : "text-mist-dim group-hover:text-mist"} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/create"
            className="btn-volt mt-4 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px]"
          >
            <IconPlus width={15} height={15} />
            New QR code
          </Link>

          <div className="mt-4 px-1 flex items-center justify-between border-t border-line/60 pt-3">
            <span className="text-[11px] font-semibold text-mist">Theme</span>
            <ThemeToggle />
          </div>
        </nav>

        <div className="border-t border-line p-3">
          <div className="rounded-xl border border-line bg-ink-850 p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-volt-400/10 text-xs font-bold text-blue-600 dark:text-volt-300">
                {initials || "AH"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-chalk">{user?.name || "Guest workspace"}</span>
                <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-mist-dim">
                  {user ? (plan ?? "free") : "local · unsigned"}
                </span>
              </span>
            </div>
            {user ? (
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="btn-ghost mt-3 w-full rounded-lg px-3 py-2 text-[12px] font-semibold disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            ) : (
              <div className="mt-3 space-y-2">
                <Link href="/register" className="btn-volt block rounded-lg px-3 py-2 text-center text-[12px]">
                  Create free account
                </Link>
                <Link href="/login" className="btn-ghost block rounded-lg px-3 py-2 text-center text-[12px] font-semibold">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-line bg-ink-950/92 px-4 py-2.5 backdrop-blur-xl lg:hidden">
          <Link href="/" className="mr-1">
            <LogoMark className="h-8 w-8" />
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors ${
                item.match(pathname) ? "bg-volt-400 text-ink-950" : "border border-line text-mist"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
