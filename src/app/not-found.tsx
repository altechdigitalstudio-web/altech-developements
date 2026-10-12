import Link from "next/link";
import { LogoMark, IconArrowRight, IconQr } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 bg-page">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      <div className="relative w-full max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="text-left leading-none">
            <span className="block text-sm font-bold tracking-tight text-main">
              ALTECH<span className="text-blue-600 dark:text-volt-400">HUB</span>
            </span>
            <span className="mt-1 block text-xs text-muted">
              QR Studio
            </span>
          </span>
        </Link>

        <div className="relative mx-auto mt-8 w-[168px]">
          <div className="rounded-2xl border border-line bg-white p-3 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/qr?v=https%3A%2F%2Faltech.hub%2F404&size=280&fg=%230f172a&bg=%23ffffff&margin=1&ecl=H"
              alt="QR code pointing back to the studio"
              width={140}
              height={140}
              className="h-[140px] w-[140px]"
            />
          </div>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-rose-500 font-mono">
          404 · Page Not Found
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
          This pattern doesn&apos;t decode to anything.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          The link you visited might have been moved, renamed, or retired. Return to the QR Studio to generate or manage your codes.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/create" className="btn-volt group flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-md">
            <IconQr width={16} height={16} />
            Open QR Studio
          </Link>
          <Link href="/dashboard" className="btn-ghost flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm">
            Dashboard
            <IconArrowRight width={16} height={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
