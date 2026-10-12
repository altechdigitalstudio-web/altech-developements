import { sql } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes, scans } from "@/db/schema";
import { ensureDemoUser } from "./seed";

export type PublicStats = { codes: number; scans: number; countries: number };

let seeded = false;

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const [codeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(qrCodes);
    if (!seeded && (codeRow?.count ?? 0) === 0) {
      seeded = true;
      await ensureDemoUser().catch(() => undefined);
    }

    const [codes, scanRow, countryRow] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(qrCodes),
      db.select({ count: sql<number>`count(*)::int` }).from(scans),
      db.select({ count: sql<number>`count(distinct ${scans.country})::int` }).from(scans),
    ]);

    return {
      codes: codes[0]?.count ?? 0,
      scans: scanRow[0]?.count ?? 0,
      countries: countryRow[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("stats failed", error);
    return { codes: 0, scans: 0, countries: 0 };
  }
}
