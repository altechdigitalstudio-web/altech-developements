import { eq } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes, scans, users } from "@/db/schema";
import { hashPassword, slugSeed } from "./auth";
import { buildValue } from "./content";
import { defaultStyle, type QRStyle } from "./types";
import { COUNTRY_META } from "./geo";

export const DEMO_EMAIL = "demo@altech.hub";
export const DEMO_PASSWORD = "demo1234";

const COUNTRIES = [
  { code: "US", w: 26 },
  { code: "GB", w: 12 },
  { code: "DE", w: 14 },
  { code: "IN", w: 11 },
  { code: "BR", w: 7 },
  { code: "JP", w: 6 },
  { code: "FR", w: 6 },
  { code: "NL", w: 5 },
  { code: "AU", w: 4 },
  { code: "SG", w: 4 },
  { code: "CA", w: 5 },
];

const DEVICES = [
  { type: "mobile", os: "iOS", browser: "Safari", w: 38 },
  { type: "mobile", os: "Android", browser: "Chrome", w: 34 },
  { type: "desktop", os: "Windows", browser: "Chrome", w: 10 },
  { type: "desktop", os: "macOS", browser: "Safari", w: 8 },
  { type: "tablet", os: "iPadOS", browser: "Safari", w: 6 },
  { type: "mobile", os: "Android", browser: "Samsung Internet", w: 4 },
];

const REFERRERS = ["Direct / camera", "Direct / camera", "Direct / camera", "instagram.com", "linktr.ee", "t.co"];

function weighted<T extends { w: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.w, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.w;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

const DEMO_CODES: {
  name: string;
  kind: string;
  fields: Record<string, string>;
  isDynamic: boolean;
  status?: string;
  style: Partial<QRStyle>;
  weight: number;
}[] = [
  {
    name: "Launch landing page",
    kind: "url",
    fields: { url: "https://altech.hub/launch" },
    isDynamic: true,
    weight: 46,
    style: {
      dotColor: "#0E1015",
      dotType: "extra-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      frame: { ...defaultStyle.frame, enabled: true, text: "SCAN ME", background: "#D8FF4F", color: "#0E1015" },
    },
  },
  {
    name: "Café table menu",
    kind: "menu",
    fields: { url: "https://altech.hub/menu.pdf" },
    isDynamic: true,
    weight: 22,
    style: {
      useGradient: true,
      dotColor: "#FF5F3C",
      gradientColor: "#FFC53D",
      gradientRotation: 30,
      cornerColor: "#FF5F3C",
      dotType: "rounded",
    },
  },
  {
    name: "Ada — business card",
    kind: "vcard",
    fields: {
      firstName: "Ada",
      lastName: "Lovelace",
      organization: "Altech Hub",
      title: "Founder",
      phone: "+15550100100",
      email: "ada@altech.hub",
      website: "altech.hub",
      address: "1 Signal Street, Berlin",
      note: "",
    },
    isDynamic: true,
    weight: 12,
    style: {
      dotColor: "#4C7DFF",
      useGradient: true,
      gradientColor: "#1B2C6B",
      gradientRotation: 120,
      cornerColor: "#4C7DFF",
      dotType: "classy-rounded",
    },
  },
  {
    name: "Office guest Wi-Fi",
    kind: "wifi",
    fields: { ssid: "Altech-Guest", encryption: "WPA", password: "welcome2026", hidden: "false" },
    isDynamic: false,
    weight: 6,
    style: { dotColor: "#12A870", cornerColor: "#0E1015", dotType: "dots", shape: "circle" },
  },
  {
    name: "Instagram @altechhub",
    kind: "instagram",
    fields: { handle: "altechhub" },
    isDynamic: true,
    weight: 9,
    style: {
      useGradient: true,
      dotColor: "#B026FF",
      gradientColor: "#FF5F3C",
      gradientRotation: 210,
      cornerColor: "#B026FF",
      dotType: "classy",
    },
  },
  {
    name: "Launch night invite",
    kind: "event",
    fields: {
      title: "Altech Hub Launch Night",
      location: "Berlin + livestream",
      start: "2026-03-14T18:00",
      end: "2026-03-14T23:00",
      description: "Doors at 18:00. Bring this code for entry.",
    },
    isDynamic: true,
    status: "paused",
    weight: 5,
    style: { dotColor: "#0E1015", backgroundColor: "#F4F6FA", dotType: "square", cornerSquareType: "square" },
  },
];

/** Creates the demo workspace (with realistic analytics) exactly once. */
export async function ensureDemoUser(): Promise<string> {
  const existing = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (existing[0]) return existing[0].id;

  const [user] = await db
    .insert(users)
    .values({
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      name: "Ada Lovelace",
      plan: "business",
      workspaceId: "ws-demo-altech",
    })
    .returning();

  const createdCodes = await db
    .insert(qrCodes)
    .values(
      DEMO_CODES.map((code) => {
        const slug = slugSeed("q");
        const value = buildValue(code.kind, code.fields);
        return {
          userId: user.id,
          workspaceId: "ws-demo-altech",
          name: code.name,
          slug,
          kind: code.kind,
          fields: code.fields,
          value,
          isDynamic: code.isDynamic,
          destination: code.isDynamic ? value : null,
          status: code.status ?? "active",
          style: { ...defaultStyle, ...code.style },
          createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 46),
          scans: 0,
        };
      }),
    )
    .returning();

  const scanRows: (typeof scans.$inferInsert)[] = [];
  const now = Date.now();

  createdCodes.forEach((code) => {
    const meta = DEMO_CODES.find((c) => c.name === code.name);
    const count = meta ? meta.weight * 6 : 12;
    for (let i = 0; i < count; i += 1) {
      // Recency-weighted: more scans in the last two weeks.
      const skew = Math.pow(Math.random(), 1.7);
      const daysAgo = skew * 44;
      const when = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
      when.setHours(Math.floor(7 + Math.random() * 15), Math.floor(Math.random() * 60));
      const country = weighted(COUNTRIES);
      const meta = COUNTRY_META[country.code];
      const cities = meta?.cities ?? ["Capital"];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const device = weighted(DEVICES);
      scanRows.push({
        qrCodeId: code.id,
        country: country.code,
        city,
        deviceType: device.type,
        os: device.os,
        browser: device.browser,
        language: "en-US",
        referrer: REFERRERS[Math.floor(Math.random() * REFERRERS.length)],
        createdAt: when,
      });
    }
  });

  if (scanRows.length) {
    await db.insert(scans).values(scanRows);
    for (const code of createdCodes) {
      const total = scanRows.filter((s) => s.qrCodeId === code.id).length;
      const latest = scanRows
        .filter((s) => s.qrCodeId === code.id)
        .reduce<Date | null>((acc, s) => {
          const d = s.createdAt as Date;
          return !acc || d > acc ? d : acc;
        }, null);
      await db
        .update(qrCodes)
        .set({ scans: total, lastScanAt: latest ?? new Date() })
        .where(eq(qrCodes.id, code.id));
    }
  }

  return user.id;
}
