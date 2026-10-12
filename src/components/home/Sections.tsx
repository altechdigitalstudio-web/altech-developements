import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { contentTypes } from "@/lib/content";
import { buildValue } from "@/lib/content";
import {
  IconArrowRight,
  IconBolt,
  IconChart,
  IconCheck,
  IconDownload,
  IconInfinity,
  IconLayers,
  IconPalette,
  IconPrint,
  IconShield,
  IconSparkle,
  IconStar,
  kindIcon,
} from "@/components/icons";

export function Marquee() {
  const rowA = [
    "Digital Menus",
    "Product Packaging",
    "Conference Badges",
    "Posters & Billboards",
    "Business Cards",
    "Table Tents",
    "Event Tickets",
    "Wi-Fi Signs",
  ];
  const rowB = [
    "App Installs",
    "Donation Jars",
    "Direct Mail",
    "Loyalty Cards",
    "Storefront Windows",
    "Fleet Branding",
    "Packaging Inserts",
  ];

  return (
    <section className="relative border-y border-line bg-card-subtle py-5">
      <div className="mask-fade-x space-y-2.5 overflow-hidden">
        <div className="flex w-max animate-marquee gap-8">
          {[...rowA, ...rowA].map((word, i) => (
            <span key={`${word}-${i}`} className="flex items-center gap-8 text-sm font-semibold text-muted">
              {word}
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-volt-400" />
            </span>
          ))}
        </div>
        <div className="flex w-max animate-marquee-slow gap-8" style={{ animationDirection: "reverse" }}>
          {[...rowB, ...rowB].map((word, i) => (
            <span key={`${word}-${i}`} className="flex items-center gap-8 text-xs font-medium text-dim">
              {word}
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TypesShowcase() {
  const groups = ["core", "contact", "social", "utility", "commerce"] as const;

  return (
    <section id="types" className="relative mx-auto max-w-[1400px] px-5 py-24 lg:px-8">
      <Reveal className="max-w-2xl">
        <span className="eyebrow">20 QR Formats Included</span>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
          One studio for every payload a QR code can carry.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Unlike limited tools, every standard QR specification is supported out of the box — vCard business cards,
          Wi-Fi network auto-join, calendar events, crypto payments, location coordinates, and direct links.
        </p>
      </Reveal>

      <div className="mt-12 space-y-12">
        {groups.map((group, groupIndex) => {
          const items = contentTypes.filter((t) => t.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              <Reveal className="mb-4 flex items-center gap-3">
                <span className="text-xs font-bold text-blue-600 dark:text-volt-400 font-mono">
                  0{groupIndex + 1}
                </span>
                <span className="text-sm font-bold uppercase tracking-wider text-main">{group}</span>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs font-medium text-muted">{items.length} types</span>
              </Reveal>

              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((type, index) => {
                  const Icon = kindIcon[type.id] ?? kindIcon.url;
                  const sample = buildValue(type.id, type.defaults);
                  return (
                    <Reveal key={type.id} delay={index * 40}>
                      <Link
                        href={`/create?kind=${type.id}`}
                        className="card-lift group flex h-full flex-col rounded-2xl border border-line bg-card p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card-subtle text-blue-600 dark:text-volt-400 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-volt-400/10">
                            <Icon width={17} height={17} />
                          </span>
                          <span className="text-sm font-bold text-main">
                            {type.label}
                          </span>
                        </div>
                        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-muted">{type.blurb}</p>
                        <div className="mt-3 truncate rounded-lg border border-line bg-page px-2.5 py-1.5 font-mono text-[11px] text-dim group-hover:text-main transition-colors">
                          {sample.slice(0, 38)}
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-volt-400">
                          Create this type
                          <IconArrowRight width={13} height={13} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: IconInfinity,
    title: "Dynamic Retargeting",
    body: "Change your destination URL anytime without reprinting menus, stickers, packaging or marketing materials.",
    tag: "Essential",
    span: "lg:col-span-2",
  },
  {
    icon: IconChart,
    title: "Scanner Geolocation & Analytics",
    body: "Track country, city, device, OS, browser, referrer and hour-by-hour volume for every scan event in real time.",
    tag: "Intelligence",
    span: "lg:col-span-2",
  },
  {
    icon: IconPalette,
    title: "Visual Brand Customization",
    body: "Six dot styles, eye patterns, linear and radial color gradients, transparent backgrounds and custom logo embeds.",
    tag: "Design",
    span: "lg:col-span-2",
  },
  {
    icon: IconLayers,
    title: "Bulk CSV Generation",
    body: "Upload a CSV spreadsheet with up to 500 records. Instantly download a ZIP bundle of PNG files and a link manifest.",
    tag: "Productivity",
    span: "lg:col-span-2",
  },
  {
    icon: IconDownload,
    title: "Vector & Print Formats",
    body: "Export crisp vector SVG, high-resolution PNG up to 3000px, JPEG, WebP and print-ready A4 PDF sheets.",
    tag: "Export",
    span: "lg:col-span-2",
  },
  {
    icon: IconPrint,
    title: "Call-to-Action Frames",
    body: "Add customizable SCAN ME banners, pills and minimal text frames directly embedded into your exported graphics.",
    tag: "Print-Ready",
    span: "lg:col-span-1",
  },
  {
    icon: IconShield,
    title: "No Expirations or Scan Caps",
    body: "Your generated QR codes remain active and functional with unlimited scans across all tiers.",
    tag: "Reliability",
    span: "lg:col-span-1",
  },
  {
    icon: IconBolt,
    title: "Fast Global Edge Redirects",
    body: "Low-latency resolution powered by Postgres with crawler and bot filtering to keep analytics accurate.",
    tag: "Performance",
    span: "lg:col-span-1",
  },
  {
    icon: IconSparkle,
    title: "One-Click Presets",
    body: "Curated templates including Classic Slate, Royal Blue, Emerald Mint, Sunset Coral and Mono Minimal.",
    tag: "Speed",
    span: "lg:col-span-1",
  },
];

export function Features() {
  return (
    <section id="features" className="relative border-y border-line bg-card-subtle py-24">
      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">Enterprise Features</span>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
              Everything you need in a modern QR platform.
            </h2>
          </div>
          <Link
            href="/create"
            className="btn-ghost group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm"
          >
            Try Studio Now
            <IconArrowRight width={16} height={16} className="text-blue-600 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 35} className={feature.span}>
              <article className="card-lift group relative h-full rounded-2xl border border-line bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-subtle text-blue-600 dark:text-volt-400">
                    <feature.icon width={19} height={19} />
                  </span>
                  <span className="rounded-md border border-line bg-page px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-main">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{feature.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Select Content Type",
    body: "Choose from 20 formats including website links, contact cards, Wi-Fi networks, calendar invites and payments.",
  },
  {
    n: "02",
    title: "Customize & Brand",
    body: "Fine-tune dot styles, eye shapes, gradient colors, quiet zone margins, call-to-action text and logo embeds.",
  },
  {
    n: "03",
    title: "Export & Monitor",
    body: "Download vector SVG or high-resolution PNG files, then view live scan geography and device analytics.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1400px] px-5 py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <span className="eyebrow">Workflow</span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
            From design to print in under two minutes.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Create high-contrast QR codes ready for physical printing. If your campaign destination changes next
            month, update the URL in your dashboard without touching your physical artwork.
          </p>
          <div className="mt-8 rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-volt-400">
              Print Best Practices
            </h3>
            <ul className="mt-3 space-y-2.5">
              {[
                "Minimum 20 × 20 mm physical size for handheld reading",
                "Maintain at least 2–4 modules of white quiet zone margin",
                "High contrast ratio between foreground pattern and canvas",
                "Verify with iOS Camera and Google Lens before large print runs",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-xs text-muted leading-relaxed">
                  <IconCheck width={15} height={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="space-y-4">
          {STEPS.map((step, index) => (
            <Reveal key={step.n} delay={index * 80}>
              <div className="card-lift group flex gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card-subtle font-mono text-xs font-bold text-blue-600 dark:text-volt-400">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-base font-bold text-main">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const QUOTES = [
  {
    quote:
      "We updated 300 table QR codes to our new seasonal menu in two clicks. Zero reprints, zero downtime for our staff.",
    name: "Marta Kovač",
    role: "Operations Lead, Nordkaffe Roasters",
    stars: 5,
  },
  {
    quote:
      "The vector SVG export went straight to our packaging print team. Clean lines, zero raster blur on large-format banners.",
    name: "Idris Bello",
    role: "Brand Designer",
    stars: 5,
  },
  {
    quote:
      "Scan geolocation helped us understand which event venues had the highest engagement during our product tour.",
    name: "Sofia Lindqvist",
    role: "Growth Marketing",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-line bg-card-subtle py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Customer Feedback</span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
            Trusted by creators and businesses worldwide.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {QUOTES.map((item, index) => (
            <Reveal key={item.name} delay={index * 60}>
              <figure className="card-lift h-full rounded-2xl border border-line bg-card p-5 shadow-sm">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <IconStar key={i} width={14} height={14} />
                  ))}
                </div>
                <blockquote className="mt-3 text-xs leading-relaxed text-main">“{item.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-line pt-3">
                  <div className="text-xs font-bold text-main">{item.name}</div>
                  <div className="text-[11px] text-muted">{item.role}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-24 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-8 sm:p-14 text-center shadow-lg">
          <div className="relative max-w-2xl mx-auto">
            <span className="eyebrow">Get Started Today</span>
            <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold tracking-tight text-main">
              Create and manage your QR codes in seconds.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Start with our free tier for static codes, or launch dynamic campaigns with location analytics and bulk
              generation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/create" className="btn-volt group flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-md">
                Create a QR Code
                <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/pricing" className="btn-ghost rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm">
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
