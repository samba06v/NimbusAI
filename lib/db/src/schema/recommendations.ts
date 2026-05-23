import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  resourceName: text("resource_name").notNull(),
  provider: text("provider").notNull(),
  recommendationType: text("recommendation_type").notNull(),
  description: text("description").notNull(),
  estimatedMonthlySavings: real("estimated_monthly_savings").notNull().default(0),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true, createdAt: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
