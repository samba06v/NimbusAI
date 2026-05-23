import { Router } from "express";
import { db } from "@workspace/db";
import { recommendationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListRecommendationsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatRec(r: typeof recommendationsTable.$inferSelect) {
  return { ...r, createdAt: r.createdAt.toISOString() };
}

router.get("/recommendations", async (req, res) => {
  try {
    const params = ListRecommendationsQueryParams.parse(req.query);
    const conditions = [];
    if (params.status != null) conditions.push(eq(recommendationsTable.status, params.status));
    if (params.priority != null) conditions.push(eq(recommendationsTable.priority, params.priority));

    const recs = await db.select().from(recommendationsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(recommendationsTable.estimatedMonthlySavings);

    res.json(recs.map(formatRec));
  } catch (err) {
    req.log.error({ err }, "Failed to list recommendations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/recommendations/:id/apply", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rec] = await db.update(recommendationsTable)
      .set({ status: "applied" })
      .where(eq(recommendationsTable.id, id))
      .returning();
    if (!rec) return void res.status(404).json({ error: "Not found" });
    res.json(formatRec(rec));
  } catch (err) {
    req.log.error({ err }, "Failed to apply recommendation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/recommendations/:id/dismiss", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rec] = await db.update(recommendationsTable)
      .set({ status: "dismissed" })
      .where(eq(recommendationsTable.id, id))
      .returning();
    if (!rec) return void res.status(404).json({ error: "Not found" });
    res.json(formatRec(rec));
  } catch (err) {
    req.log.error({ err }, "Failed to dismiss recommendation");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
