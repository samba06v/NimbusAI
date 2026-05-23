import { Router } from "express";
import { db } from "@workspace/db";
import { cloudAccountsTable, insertCloudAccountSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateAccountBody } from "@workspace/api-zod";

const router = Router();

router.get("/accounts", async (req, res) => {
  try {
    const accounts = await db.select().from(cloudAccountsTable).orderBy(cloudAccountsTable.id);
    res.json(accounts.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list accounts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/accounts", async (req, res) => {
  try {
    const body = CreateAccountBody.parse(req.body);
    const [account] = await db.insert(cloudAccountsTable).values({
      provider: body.provider,
      name: body.name,
      accountId: body.accountId,
      region: body.region,
      status: "active",
      monthlyCost: 0,
    }).returning();
    res.status(201).json({ ...account, createdAt: account.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create account");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/accounts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [account] = await db.select().from(cloudAccountsTable).where(eq(cloudAccountsTable.id, id));
    if (!account) return void res.status(404).json({ error: "Not found" });
    res.json({ ...account, createdAt: account.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get account");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/accounts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(cloudAccountsTable).where(eq(cloudAccountsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete account");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
