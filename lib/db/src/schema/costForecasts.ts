import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const costForecastsTable = pgTable("cost_forecasts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id"),
  forecastDate: timestamp("forecast_date").notNull(),
  predictedCost: real("predicted_cost").notNull(),
  confidenceLow: real("confidence_low").notNull(),
  confidenceHigh: real("confidence_high").notNull(),
});

export const insertCostForecastSchema = createInsertSchema(costForecastsTable).omit({ id: true });
export type InsertCostForecast = z.infer<typeof insertCostForecastSchema>;
export type CostForecast = typeof costForecastsTable.$inferSelect;
