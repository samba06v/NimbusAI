import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cloudAccountsTable = pgTable("cloud_accounts", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  name: text("name").notNull(),
  accountId: text("account_id").notNull(),
  region: text("region").notNull(),
  status: text("status").notNull().default("active"),
  monthlyCost: real("monthly_cost").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCloudAccountSchema = createInsertSchema(cloudAccountsTable).omit({ id: true, createdAt: true });
export type InsertCloudAccount = z.infer<typeof insertCloudAccountSchema>;
export type CloudAccount = typeof cloudAccountsTable.$inferSelect;
