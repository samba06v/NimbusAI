import { Router } from "express";
import { db } from "@workspace/db";
import { cloudResourcesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListResourcesQueryParams, UpdateResourceBody } from "@workspace/api-zod";

const router = Router();

router.get("/resources", async (req, res) => {
  try {
    const params = ListResourcesQueryParams.parse(req.query);
    const conditions = [];
    if (params.accountId != null) conditions.push(eq(cloudResourcesTable.accountId, params.accountId));
    if (params.provider != null) conditions.push(eq(cloudResourcesTable.provider, params.provider));
    if (params.status != null) conditions.push(eq(cloudResourcesTable.status, params.status));
    if (params.resourceType != null) conditions.push(eq(cloudResourcesTable.resourceType, params.resourceType));

    const resources = await db.select().from(cloudResourcesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(cloudResourcesTable.monthlyCost);

    res.json(resources.map(r => ({
      ...r,
      lastActive: r.lastActive.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list resources");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/resources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [resource] = await db.select().from(cloudResourcesTable).where(eq(cloudResourcesTable.id, id));
    if (!resource) return void res.status(404).json({ error: "Not found" });
    res.json({ ...resource, lastActive: resource.lastActive.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get resource");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/resources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateResourceBody.parse(req.body);
    const updates: Record<string, unknown> = {};
    if (body.status != null) updates.status = body.status;
    if (body.tags != null) updates.tags = body.tags;

    const [resource] = await db.update(cloudResourcesTable)
      .set(updates)
      .where(eq(cloudResourcesTable.id, id))
      .returning();

    if (!resource) return void res.status(404).json({ error: "Not found" });
    res.json({ ...resource, lastActive: resource.lastActive.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update resource");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
