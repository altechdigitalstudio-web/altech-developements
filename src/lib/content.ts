import type { ContentTypeDef } from "./types";

const clean = (v: string | undefined) => (v ?? "").trim();
const digits = (v: string | undefined) => clean(v).replace(/[^\d+]/g, "");
const url = (v: string | undefined) => {
  const raw = clean(v);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};
const dt = (v: string | undefined) => clean(v).replace(/[-:]/g, "").replace(/\.\d{3}$/, "");

export const contentTypes: ContentTypeDef[] = [
  {
    id: "url",
    label: "Website link",
    group: "core",
    blurb: "Send scanners to any landing page, menu or campaign URL.",
    previewHint: "https://altech.hub/launch",
    fields: [
      { id: "url", label: "Destination URL", type: "url", placeholder: "https://your-site.com", required: true },
    ],
    defaults: { url: "https://altech.hub" },
    build: (v) => url(v.url) || "https://",
  },
  {
    id: "text",
    label: "Plain text",
    group: "core",
    blurb: "Encode any copy — serials, IDs, Wi-Fi passwords, secret notes.",
    previewHint: "Hello from Altech Hub",
    fields: [
      { id: "text", label: "Text", type: "textarea", placeholder: "Type anything…", required: true },
    ],
    defaults: { text: "Made with Altech Hub QR Studio" },
    build: (v) => clean(v.text),
  },
  {
    id: "email",
    label: "Email",
    group: "core",
    blurb: "Pre-fill recipient, subject and body in one tap.",
    previewHint: "team@altech.hub",
    fields: [
      { id: "email", label: "Email address", type: "email", placeholder: "hello@company.com", required: true },
      { id: "subject", label: "Subject", type: "text", placeholder: "Let's talk" },
      { id: "body", label: "Message", type: "textarea", placeholder: "Write a message…" },
    ],
    defaults: { email: "hello@altech.hub", subject: "Hello", body: "" },
    build: (v) => {
      const params = new URLSearchParams();
      if (clean(v.subject)) params.set("subject", clean(v.subject));
      if (clean(v.body)) params.set("body", clean(v.body));
      const qs = params.toString();
      return `mailto:${clean(v.email)}${qs ? `?${qs}` : ""}`;
    },
  },
  {
    id: "phone",
    label: "Phone call",
    group: "core",
    blurb: "Opens the dialer with your number ready to call.",
    previewHint: "+1 555 0100",
    fields: [{ id: "phone", label: "Phone number", type: "tel", placeholder: "+1 555 010 0100", required: true }],
    defaults: { phone: "+15550100100" },
    build: (v) => `tel:${digits(v.phone)}`,
  },
  {
    id: "sms",
    label: "SMS",
    group: "core",
    blurb: "Text message with a pre-written body.",
    previewHint: "+1 555 0100",
    fields: [
      { id: "phone", label: "Phone number", type: "tel", placeholder: "+1 555 010 0100", required: true },
      { id: "message", label: "Message", type: "textarea", placeholder: "Hi! I'd like to know more…" },
    ],
    defaults: { phone: "+15550100100", message: "" },
    build: (v) => `SMSTO:${digits(v.phone)}:${clean(v.message)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    group: "social",
    blurb: "Start a WhatsApp chat instantly — great for support desks.",
    previewHint: "+1 555 0100",
    fields: [
      { id: "phone", label: "WhatsApp number", type: "tel", placeholder: "+1 555 010 0100", required: true },
      { id: "message", label: "Pre-filled message", type: "textarea", placeholder: "Hi! I scanned your QR…" },
    ],
    defaults: { phone: "15550100100", message: "Hi! I just scanned your QR code." },
    build: (v) =>
      `https://wa.me/${digits(v.phone).replace(/^\+/, "")}${
        clean(v.message) ? `?text=${encodeURIComponent(clean(v.message))}` : ""
      }`,
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    group: "utility",
    blurb: "Guests join your network without typing a single character.",
    previewHint: "Altech-Guest",
    fields: [
      { id: "ssid", label: "Network name (SSID)", type: "text", placeholder: "Altech Guest", required: true },
      {
        id: "encryption",
        label: "Security",
        type: "select",
        options: [
          { label: "WPA / WPA2 / WPA3", value: "WPA" },
          { label: "WEP", value: "WEP" },
          { label: "No password", value: "nopass" },
        ],
      },
      { id: "password", label: "Password", type: "text", placeholder: "••••••••" },
      {
        id: "hidden",
        label: "Hidden network",
        type: "select",
        options: [
          { label: "No", value: "false" },
          { label: "Yes", value: "true" },
        ],
      },
    ],
    defaults: { ssid: "Altech-Guest", encryption: "WPA", password: "welcome2026", hidden: "false" },
    build: (v) =>
      `WIFI:T:${clean(v.encryption) || "WPA"};S:${clean(v.ssid)};P:${clean(v.password)};H:${
        clean(v.hidden) || "false"
      };;`,
  },
  {
    id: "vcard",
    label: "vCard contact",
    group: "contact",
    blurb: "A full digital business card saved straight to Contacts.",
    previewHint: "Ada Lovelace",
    fields: [
      { id: "firstName", label: "First name", type: "text", placeholder: "Ada", half: true, required: true },
      { id: "lastName", label: "Last name", type: "text", placeholder: "Lovelace", half: true },
      { id: "organization", label: "Company", type: "text", placeholder: "Altech Hub", half: true },
      { id: "title", label: "Job title", type: "text", placeholder: "Founder", half: true },
      { id: "phone", label: "Phone", type: "tel", placeholder: "+1 555 010 0100", half: true },
      { id: "email", label: "Email", type: "email", placeholder: "ada@altech.hub", half: true },
      { id: "website", label: "Website", type: "url", placeholder: "altech.hub", half: true },
      { id: "address", label: "Address", type: "text", placeholder: "1 Signal Street, Berlin", half: true },
      { id: "note", label: "Note", type: "textarea", placeholder: "Nice to meet you." },
    ],
    defaults: {
      firstName: "Ada",
      lastName: "Lovelace",
      organization: "Altech Hub",
      title: "Founder",
      phone: "+15550100100",
      email: "ada@altech.hub",
      website: "altech.hub",
      address: "",
      note: "",
    },
    build: (v) =>
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${clean(v.lastName)};${clean(v.firstName)}`,
        `FN:${clean(`${v.firstName} ${v.lastName}`)}`,
        clean(v.organization) ? `ORG:${clean(v.organization)}` : "",
        clean(v.title) ? `TITLE:${clean(v.title)}` : "",
        clean(v.phone) ? `TEL;TYPE=CELL:${digits(v.phone)}` : "",
        clean(v.email) ? `EMAIL:${clean(v.email)}` : "",
        clean(v.website) ? `URL:${url(v.website)}` : "",
        clean(v.address) ? `ADR;TYPE=WORK:;;${clean(v.address)};;;;` : "",
        clean(v.note) ? `NOTE:${clean(v.note)}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n"),
  },
  {
    id: "event",
    label: "Calendar event",
    group: "utility",
    blurb: "Add-to-calendar in one scan. Dates, place, agenda included.",
    previewHint: "Product launch",
    fields: [
      { id: "title", label: "Event title", type: "text", placeholder: "Altech Hub Launch Night", required: true },
      { id: "location", label: "Location", type: "text", placeholder: "Berlin + livestream" },
      { id: "start", label: "Starts", type: "datetime-local", half: true },
      { id: "end", label: "Ends", type: "datetime-local", half: true },
      { id: "description", label: "Description", type: "textarea", placeholder: "Doors at 18:00." },
    ],
    defaults: { title: "Altech Hub Launch Night", location: "Berlin", start: "", end: "", description: "" },
    build: (v) =>
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${clean(v.title)}`,
        dt(v.start) ? `DTSTART:${dt(v.start)}` : "",
        dt(v.end) ? `DTEND:${dt(v.end)}` : "",
        clean(v.location) ? `LOCATION:${clean(v.location)}` : "",
        clean(v.description) ? `DESCRIPTION:${clean(v.description)}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
      ]
        .filter(Boolean)
        .join("\n"),
  },
  {
    id: "location",
    label: "GPS location",
    group: "utility",
    blurb: "Drop a pin on the map — storefronts, booths, pickup points.",
    previewHint: "52.5200, 13.4050",
    fields: [
      { id: "lat", label: "Latitude", type: "text", placeholder: "52.5200", half: true, required: true },
      { id: "lng", label: "Longitude", type: "text", placeholder: "13.4050", half: true, required: true },
    ],
    defaults: { lat: "52.5200", lng: "13.4050" },
    build: (v) => `geo:${clean(v.lat)},${clean(v.lng)}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    group: "social",
    blurb: "Profile, post or a full follow link with your handle.",
    previewHint: "@altechhub",
    fields: [{ id: "handle", label: "Instagram handle", type: "text", placeholder: "altechhub", required: true }],
    defaults: { handle: "altechhub" },
    build: (v) => `https://instagram.com/${clean(v.handle).replace(/^@/, "")}`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    group: "social",
    blurb: "Grow followers from packaging, posters and stickers.",
    previewHint: "@altechhub",
    fields: [{ id: "handle", label: "TikTok handle", type: "text", placeholder: "altechhub", required: true }],
    defaults: { handle: "altechhub" },
    build: (v) => `https://tiktok.com/@${clean(v.handle).replace(/^@/, "")}`,
  },
  {
    id: "youtube",
    label: "YouTube",
    group: "social",
    blurb: "Link a channel or jump straight into a video.",
    previewHint: "@altechhub",
    fields: [
      { id: "channel", label: "Channel or video URL", type: "url", placeholder: "youtube.com/@altechhub", required: true },
    ],
    defaults: { channel: "youtube.com/@altechhub" },
    build: (v) => url(v.channel),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    group: "social",
    blurb: "Perfect for conference badges and recruiter handouts.",
    previewHint: "in/adalovelace",
    fields: [{ id: "profile", label: "Profile URL or slug", type: "text", placeholder: "in/adalovelace", required: true }],
    defaults: { profile: "in/adalovelace" },
    build: (v) =>
      clean(v.profile).startsWith("http") ? clean(v.profile) : `https://linkedin.com/${clean(v.profile)}`,
  },
  {
    id: "x",
    label: "X / Twitter",
    group: "social",
    blurb: "Point scanners to your X profile or a specific post.",
    previewHint: "@altechhub",
    fields: [{ id: "handle", label: "X handle", type: "text", placeholder: "altechhub", required: true }],
    defaults: { handle: "altechhub" },
    build: (v) => `https://x.com/${clean(v.handle).replace(/^@/, "")}`,
  },
  {
    id: "social",
    label: "Social profile hub",
    group: "social",
    blurb: "One code that fans out to every network you run.",
    previewHint: "altech.hub",
    fields: [{ id: "url", label: "Link-in-bio URL", type: "url", placeholder: "https://altech.hub/me", required: true }],
    defaults: { url: "https://altech.hub/me" },
    build: (v) => url(v.url),
  },
  {
    id: "crypto",
    label: "Crypto payment",
    group: "commerce",
    blurb: "Accept BTC / ETH / USDT with a pre-filled amount.",
    previewHint: "bc1q…",
    fields: [
      {
        id: "coin",
        label: "Network",
        type: "select",
        options: [
          { label: "Bitcoin", value: "bitcoin" },
          { label: "Ethereum", value: "ethereum" },
          { label: "Litecoin", value: "litecoin" },
          { label: "USDT (TRC20 → tron)", value: "tron" },
        ],
      },
      { id: "address", label: "Wallet address", type: "text", placeholder: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", required: true },
      { id: "amount", label: "Amount (optional)", type: "number", placeholder: "0.0021" },
      { id: "label", label: "Label", type: "text", placeholder: "Invoice #1042" },
    ],
    defaults: { coin: "bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", amount: "", label: "" },
    build: (v) => {
      const params = new URLSearchParams();
      if (clean(v.amount)) params.set("amount", clean(v.amount));
      if (clean(v.label)) params.set("label", clean(v.label));
      const qs = params.toString();
      return `${clean(v.coin) || "bitcoin"}:${clean(v.address)}${qs ? `?${qs}` : ""}`;
    },
  },
  {
    id: "payment",
    label: "Payment link",
    group: "commerce",
    blurb: "Stripe, PayPal, UPI or your own checkout — anything that takes money.",
    previewHint: "pay.stripe.com/…",
    fields: [
      { id: "url", label: "Checkout URL", type: "url", placeholder: "https://buy.stripe.com/…", required: true },
      { id: "amount", label: "Amount label (optional)", type: "text", placeholder: "$24.00 — Flat white kit" },
    ],
    defaults: { url: "https://buy.stripe.com/altech", amount: "" },
    build: (v) => url(v.url),
  },
  {
    id: "app",
    label: "App store",
    group: "commerce",
    blurb: "Auto-route iOS and Android scanners to the right store.",
    previewHint: "Altech Hub app",
    fields: [
      { id: "ios", label: "App Store URL", type: "url", placeholder: "https://apps.apple.com/app/…", required: true },
      { id: "android", label: "Play Store URL", type: "url", placeholder: "https://play.google.com/store/apps/…" },
    ],
    defaults: { ios: "https://apps.apple.com/app/altech-hub", android: "" },
    build: (v) => url(v.ios) || url(v.android),
  },
  {
    id: "menu",
    label: "Digital menu / PDF",
    group: "commerce",
    blurb: "Table-top menus, price lists and brochures without reprints.",
    previewHint: "menu.pdf",
    fields: [{ id: "url", label: "Menu or file URL", type: "url", placeholder: "https://altech.hub/menu.pdf", required: true }],
    defaults: { url: "https://altech.hub/menu.pdf" },
    build: (v) => url(v.url),
  },
];

export const contentTypeMap: Record<string, ContentTypeDef> = Object.fromEntries(
  contentTypes.map((t) => [t.id, t]),
);

export function buildValue(kind: string, values: Record<string, string>): string {
  const def = contentTypeMap[kind] ?? contentTypeMap.url;
  try {
    return def.build(values) || "";
  } catch {
    return "";
  }
}

export function getKindLabel(kind: string): string {
  return contentTypeMap[kind]?.label ?? "QR code";
}
