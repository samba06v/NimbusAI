import { pgTable, text, serial, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const costAlertsTable = pgTable("cost_alerts", {
  id: serial("id").primaryKey(),
  severity: text("severity").notNull().default("info"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  estimatedImpact: real("estimated_impact").notNull().default(0),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCostAlertSchema = createInsertSchema(costAlertsTable).omit({ id: true, createdAt: true });
export type InsertCostAlert = z.infer<typeof insertCostAlertSchema>;
export type CostAlert = typeof costAlertsTable.$inferSelect;
