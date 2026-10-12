"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { IconChevron } from "@/components/icons";

const FAQS = [
  {
    q: "What is the difference between dynamic and static QR codes?",
    a: "A dynamic code encodes a short redirect link (e.g., qr.altech.hub/s/xyz). You can change where it points anytime, pause it, and view real-time scan location analytics without reprinting your packaging or stickers. A static code encodes data directly into the pattern — it has no redirect or analytics, but works offline and never expires.",
  },
  {
    q: "Do generated QR codes expire or get blocked?",
    a: "No. Static codes are mathematical patterns that never expire. Dynamic codes stay active with no trial timers or scan caps. If you pause a code, scanners receive a clear notice page instead of a broken error.",
  },
  {
    q: "What scanner location data is captured in analytics?",
    a: "When a scanner opens a dynamic code, the server aggregates the country, city (resolved via Edge IP headers), device type (iOS, Android, Desktop), operating system, browser, language, and referring application. No personal identifying information or raw IPs are stored.",
  },
  {
    q: "Can I add our company logo to the center of the code?",
    a: "Yes. When you upload a custom logo, the studio automatically switches error correction to Level H (tolerating up to 30% visual obstruction) and clears pattern dots behind the logo for high scanning reliability.",
  },
  {
    q: "Which file formats can I download for professional printing?",
    a: "You can export infinite-resolution vector SVG (for billboards and professional print packaging), high-res PNG up to 3000px, JPEG, WebP, and an A4 printable sheet PDF with your destination clearly labeled.",
  },
  {
    q: "How does bulk generation from CSV work?",
    a: "Upload any CSV spreadsheet with column headers (name, url, or specific fields like wifi SSID/password or vCard names). The studio generates all QR codes with your chosen styling, then gives you a ZIP of PNG files and a manifest CSV.",
  },
  {
    q: "Can I use these QR codes for commercial projects?",
    a: "Yes, 100%. All exported QR codes are yours to use on restaurant menus, physical products, event badges, client deliverables, and commercial packaging without watermarks or attribution requirements.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-[1400px] px-5 py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <span className="eyebrow">Frequently Asked Questions</span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
            Clear answers to common questions.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Have questions about QR formats, printing standards, or scan privacy? Everything is transparent and open.
          </p>
          <div className="mt-8 rounded-2xl border border-line bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-volt-400">
              Need Help?
            </p>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Open the QR Studio to see live previews of any format as you type, and test scans directly on your phone.
            </p>
          </div>
        </Reveal>

        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <Reveal key={item.q} delay={index * 30}>
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-card-subtle"
                  >
                    <span className="mt-0.5 text-xs font-mono font-bold text-blue-600 dark:text-volt-400">
                      0{index + 1}
                    </span>
                    <span
                      className={`flex-1 text-sm font-semibold transition-colors ${
                        isOpen ? "text-blue-600 dark:text-volt-300" : "text-main"
                      }`}
                    >
                      {item.q}
                    </span>
                    <IconChevron
                      width={16}
                      height={16}
                      className={`mt-0.5 shrink-0 text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600 dark:text-volt-400" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 pl-12 text-xs leading-relaxed text-muted">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
