import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyCostsTable = pgTable("daily_costs", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  cost: real("cost").notNull(),
});

export const insertDailyCostSchema = createInsertSchema(dailyCostsTable).omit({ id: true });
export type InsertDailyCost = z.infer<typeof insertDailyCostSchema>;
export type DailyCost = typeof dailyCostsTable.$inferSelect;
