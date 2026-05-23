import { Router } from "express";
import { db } from "@workspace/db";
import { costAlertsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListAlertsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatAlert(a: typeof costAlertsTable.$inferSelect) {
  return { ...a, createdAt: a.createdAt.toISOString() };
}

router.get("/alerts", async (req, res) => {
  try {
    const params = ListAlertsQueryParams.parse(req.query);
    const conditions = [];
    if (params.severity != null) conditions.push(eq(costAlertsTable.severity, params.severity));
    if (params.resolved != null) conditions.push(eq(costAlertsTable.resolved, params.resolved === "true" as unknown as boolean));

    const alerts = await db.select().from(costAlertsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(costAlertsTable.createdAt);

    res.json(alerts.map(formatAlert));
  } catch (err) {
    req.log.error({ err }, "Failed to list alerts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/alerts/:id/resolve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [alert] = await db.update(costAlertsTable)
      .set({ resolved: true })
      .where(eq(costAlertsTable.id, id))
      .returning();
    if (!alert) return void res.status(404).json({ error: "Not found" });
    res.json(formatAlert(alert));
  } catch (err) {
    req.log.error({ err }, "Failed to resolve alert");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
