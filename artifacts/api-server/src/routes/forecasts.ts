import { Router } from "express";
import { db } from "@workspace/db";
import { costForecastsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListForecastsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/forecasts", async (req, res) => {
  try {
    const params = ListForecastsQueryParams.parse(req.query);
    const conditions = [];
    if (params.accountId != null) conditions.push(eq(costForecastsTable.accountId, params.accountId));

    const forecasts = await db.select().from(costForecastsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(costForecastsTable.forecastDate);

    res.json(forecasts.map(f => ({
      ...f,
      forecastDate: f.forecastDate.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list forecasts");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
