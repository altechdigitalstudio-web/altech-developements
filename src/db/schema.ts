import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  plan: text("plan").notNull().default("free"),
  workspaceId: text("workspace_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const qrCodes = pgTable(
  "qr_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id"),
    name: text("name").notNull().default("Untitled QR"),
    slug: text("slug").notNull().unique(),
    kind: text("kind").notNull().default("url"),
    fields: jsonb("fields").notNull().default({}),
    value: text("value").notNull().default(""),
    isDynamic: boolean("is_dynamic").notNull().default(false),
    destination: text("destination"),
    style: jsonb("style").notNull().default({}),
    status: text("status").notNull().default("active"),
    scans: integer("scans").notNull().default(0),
    lastScanAt: timestamp("last_scan_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qr_codes_user_idx").on(table.userId),
    index("qr_codes_workspace_idx").on(table.workspaceId),
    index("qr_codes_slug_idx").on(table.slug),
  ],
);

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    qrCodeId: uuid("qr_code_id")
      .notNull()
      .references(() => qrCodes.id, { onDelete: "cascade" }),
    country: text("country").notNull().default("—"),
    city: text("city"),
    deviceType: text("device_type").notNull().default("desktop"),
    os: text("os").notNull().default("Unknown"),
    browser: text("browser").notNull().default("Unknown"),
    language: text("language"),
    referrer: text("referrer").notNull().default("direct"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("scans_code_idx").on(table.qrCodeId),
    index("scans_created_idx").on(table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
export type Scan = typeof scans.$inferSelect;
