"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeProvider";
import { IconArrowRight, IconBolt, IconCheck, IconLock, IconSparkle, LogoMark } from "@/components/icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = (await res.json()) as { error?: string; user?: { name: string } };
      if (!res.ok) throw new Error(payload.error ?? "Something went wrong");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const demo = async () => {
    setDemoBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (!res.ok) throw new Error("Demo workspace unavailable");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo workspace unavailable");
      setDemoBusy(false);
    }
  };

  const perks = [
    "20 QR types — vCard, Wi-Fi, events, crypto and more",
    "Dynamic codes with editable destinations",
    "Country, device and referrer analytics",
    "PNG, JPEG, SVG, WebP and A4 PDF exports",
    "Bulk CSV runs with ZIP + manifest",
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-line bg-card lg:block">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <LogoMark className="h-9 w-9" />
              <span className="text-sm font-bold tracking-tight text-main">
                ALTECH<span className="text-blue-600 dark:text-volt-400">HUB</span> QR STUDIO
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-main">
              Your codes, your analytics, your print assets.
            </h2>
            <ul className="mt-6 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-xs text-muted leading-relaxed">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-emerald-500">
                    <IconCheck width={12} height={12} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-dim">
            Free forever tier · No credit card required · Unlimited scans
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-14 sm:px-10 bg-page">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <LogoMark className="h-8 w-8" />
              <span className="text-sm font-bold text-main">
                ALTECH<span className="text-blue-600 dark:text-volt-400">HUB</span>
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <span className="eyebrow">{mode === "login" ? "Account Access" : "Create Account"}</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-main">
            {mode === "login" ? "Sign in to your QR workspace" : "Get started with your QR workspace"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {mode === "login"
              ? "Access your dynamic QR codes, destination URLs and real-time scan analytics."
              : "Any codes you created as a guest in this browser are automatically transferred into your account."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[11.5px] font-semibold text-mist">
                  Name
                </label>
                <input
                  id="name"
                  className="input-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[11.5px] font-semibold text-mist">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-base font-mono text-[13px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11.5px] font-semibold text-mist">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input-base font-mono text-[13px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-xl border border-coral-500/40 bg-coral-500/10 px-3 py-2.5 text-[12.5px] text-coral-400">
                <IconBolt width={14} height={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-volt flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[14px] disabled:opacity-60">
              {busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
              {!busy && <IconArrowRight width={16} height={16} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-mist-dim">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={demo}
            disabled={demoBusy}
            className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[13.5px] font-semibold disabled:opacity-60"
          >
            <IconSparkle width={16} height={16} className="text-volt-400" />
            {demoBusy ? "Loading demo workspace…" : "Explore the demo workspace"}
          </button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-mist-dim">
            <IconLock width={11} height={11} />
            demo@altech.hub · demo1234
          </p>

          <p className="mt-8 text-center text-[13px] text-mist">
            {mode === "login" ? (
              <>
                No account yet?{" "}
                <Link href="/register" className="font-semibold text-volt-400 underline underline-offset-4">
                  Create one free
                </Link>
              </>
            ) : (
              <>
                Already registered?{" "}
                <Link href="/login" className="font-semibold text-volt-400 underline underline-offset-4">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
