"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { IconCheck, IconClose, IconSparkle } from "@/components/icons";

type Plan = {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  tagline: string;
  featured?: boolean;
  cta: string;
  href: string;
  features: { label: string; included: boolean }[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "Essential QR code tools for individuals.",
    cta: "Start Free",
    href: "/create",
    features: [
      { label: "Unlimited static QR codes", included: true },
      { label: "All 20 content formats", included: true },
      { label: "PNG, JPEG, SVG & PDF exports", included: true },
      { label: "Colors, gradients, dots & eye styles", included: true },
      { label: "Logo embed with auto ECC-H", included: true },
      { label: "3 dynamic codes", included: true },
      { label: "Scan location analytics", included: false },
      { label: "Bulk CSV generator", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 9,
    yearly: 7,
    tagline: "Ideal for small businesses, restaurants & creators.",
    featured: true,
    cta: "Start Pro Plan",
    href: "/register",
    features: [
      { label: "Everything in Free", included: true },
      { label: "250 dynamic QR codes", included: true },
      { label: "Live scanner location analytics + map", included: true },
      { label: "Editable destinations & pause switch", included: true },
      { label: "Call-to-action brand frames", included: true },
      { label: "Bulk CSV up to 500 records", included: true },
      { label: "Custom short-link slugs", included: true },
      { label: "Multi-seat workspace", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    monthly: 29,
    yearly: 23,
    tagline: "High-volume campaigns for marketing teams.",
    cta: "Start Business",
    href: "/register",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Unlimited dynamic codes", included: true },
      { label: "Location heatmaps & city drilldowns", included: true },
      { label: "5 team seats with permissions", included: true },
      { label: "Retargeting pixels & webhooks", included: true },
      { label: "Print-supplier ZIP asset bundles", included: true },
      { label: "99.9% redirect uptime guarantee", included: true },
      { label: "Priority email & chat support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: -1,
    yearly: -1,
    tagline: "Custom domains, dedicated SLA & API access.",
    cta: "Contact Sales",
    href: "/register",
    features: [
      { label: "Everything in Business", included: true },
      { label: "Custom vanity root domain", included: true },
      { label: "SSO / SAML authentication", included: true },
      { label: "Unlimited team seats", included: true },
      { label: "Print fulfilment REST API", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Custom contract & SLA", included: true },
      { label: "Volume batch generation", included: true },
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative border-y border-line bg-card-subtle py-24">
      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Plans & Pricing</span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-main">
            Transparent pricing without hidden limits.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Static codes are completely free forever. Upgrade anytime for dynamic redirects, geographic scanner
            analytics, bulk CSV processing, and team features.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-line bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                !yearly
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "text-muted hover:text-main"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                yearly
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "text-muted hover:text-main"
              }`}
            >
              Annual Billing
              <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                Save 22%
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {PLANS.map((plan, index) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <Reveal key={plan.id} delay={index * 60}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-200 ${
                    plan.featured
                      ? "border-blue-600 dark:border-volt-400 bg-card shadow-lg ring-1 ring-blue-600/20 lg:-translate-y-2"
                      : "border-line bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-blue-600 dark:bg-volt-400 text-white dark:text-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      <IconSparkle width={12} height={12} />
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-main">{plan.name}</h3>
                  <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-muted">{plan.tagline}</p>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    {price < 0 ? (
                      <span className="text-3xl font-extrabold tracking-tight text-main">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold tracking-tight text-main font-mono">${price}</span>
                        <span className="text-xs text-muted">/ month{yearly ? " (billed yearly)" : ""}</span>
                      </>
                    )}
                  </div>

                  <Link
                    href={plan.href}
                    className={`mt-6 rounded-xl px-4 py-3 text-center text-xs font-bold transition-all ${
                      plan.featured ? "btn-volt shadow-md" : "btn-ghost shadow-sm"
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <ul className="mt-6 space-y-2.5 border-t border-line pt-6">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 shrink-0 ${feature.included ? "text-emerald-500" : "text-dim"}`}>
                          {feature.included ? (
                            <IconCheck width={14} height={14} />
                          ) : (
                            <IconClose width={14} height={14} />
                          )}
                        </span>
                        <span
                          className={`text-xs leading-relaxed ${
                            feature.included ? "text-muted" : "text-dim line-through decoration-slate-300"
                          }`}
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
