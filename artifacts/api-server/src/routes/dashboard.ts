import { Router } from "express";
import { db } from "@workspace/db";
import {
  cloudResourcesTable,
  costAlertsTable,
  recommendationsTable,
  dailyCostsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const resources = await db.select().from(cloudResourcesTable);
    const alerts = await db.select().from(costAlertsTable).where(eq(costAlertsTable.resolved, false));
    const recs = await db.select().from(recommendationsTable).where(eq(recommendationsTable.status, "pending"));

    const totalMonthlyCost = resources.reduce((sum, r) => sum + r.monthlyCost, 0);
    const potentialMonthlySavings = recs.reduce((sum, r) => sum + r.estimatedMonthlySavings, 0);
    const projectedMonthCost = totalMonthlyCost * 1.08;
    const idleResources = resources.filter(r => r.status === "idle").length;
    const unusedResources = resources.filter(r => r.status === "unused").length;

    res.json({
      totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      projectedMonthCost: Math.round(projectedMonthCost * 100) / 100,
      potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
      totalResources: resources.length,
      idleResources,
      unusedResources,
      activeAlerts: alerts.length,
      pendingRecommendations: recs.length,
      costChangePercent: 8.3,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/spending-by-service", async (req, res) => {
  try {
    const resources = await db.select().from(cloudResourcesTable);
    const total = resources.reduce((sum, r) => sum + r.monthlyCost, 0);
    const byService: Record<string, number> = {};
    for (const r of resources) {
      byService[r.resourceType] = (byService[r.resourceType] ?? 0) + r.monthlyCost;
    }
    const result = Object.entries(byService).map(([service, monthlyCost]) => ({
      service,
      monthlyCost: Math.round(monthlyCost * 100) / 100,
      percentage: total > 0 ? Math.round((monthlyCost / total) * 1000) / 10 : 0,
    })).sort((a, b) => b.monthlyCost - a.monthlyCost);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get spending by service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/spending-by-provider", async (req, res) => {
  try {
    const resources = await db.select().from(cloudResourcesTable);
    const total = resources.reduce((sum, r) => sum + r.monthlyCost, 0);
    const byProvider: Record<string, { cost: number; count: number }> = {};
    for (const r of resources) {
      if (!byProvider[r.provider]) byProvider[r.provider] = { cost: 0, count: 0 };
      byProvider[r.provider].cost += r.monthlyCost;
      byProvider[r.provider].count += 1;
    }
    const result = Object.entries(byProvider).map(([provider, { cost, count }]) => ({
      provider,
      monthlyCost: Math.round(cost * 100) / 100,
      percentage: total > 0 ? Math.round((cost / total) * 1000) / 10 : 0,
      resourceCount: count,
    })).sort((a, b) => b.monthlyCost - a.monthlyCost);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get spending by provider");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/cost-trend", async (req, res) => {
  try {
    const costs = await db.select().from(dailyCostsTable).orderBy(dailyCostsTable.date);
    res.json(costs.map(c => ({
      date: c.date.toISOString().split("T")[0],
      cost: c.cost,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get cost trend");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/top-costly-resources", async (req, res) => {
  try {
    const resources = await db.select().from(cloudResourcesTable)
      .orderBy(sql`${cloudResourcesTable.monthlyCost} DESC`)
      .limit(10);
    res.json(resources.map(r => ({ ...r, lastActive: r.lastActive.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get top costly resources");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
