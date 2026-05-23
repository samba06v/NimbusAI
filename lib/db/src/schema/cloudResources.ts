import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cloudResourcesTable = pgTable("cloud_resources", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  provider: text("provider").notNull(),
  resourceType: text("resource_type").notNull(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  status: text("status").notNull().default("active"),
  monthlyCost: real("monthly_cost").notNull().default(0),
  cpuUtilization: real("cpu_utilization").notNull().default(0),
  memoryUtilization: real("memory_utilization").notNull().default(0),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  tags: text("tags").notNull().default("{}"),
});

export const insertCloudResourceSchema = createInsertSchema(cloudResourcesTable).omit({ id: true });
export type InsertCloudResource = z.infer<typeof insertCloudResourceSchema>;
export type CloudResource = typeof cloudResourcesTable.$inferSelect;
