import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

// Only quota counters are retained; no disclosures or raw IP addresses.
export const aiQuotas = pgTable("ai_quotas", {
  key: text().primaryKey(),
  count: integer().notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
