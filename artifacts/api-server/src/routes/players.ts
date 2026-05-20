import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable } from "@workspace/db";
import { ilike, gte, and, eq } from "drizzle-orm";
import {
  ListPlayersQueryParams,
  ListTopRatedPlayersQueryParams,
  GetPlayerParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListPlayersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }
  const { search, position, minRating } = parsed.data;
  const conditions = [];
  if (search) conditions.push(ilike(playersTable.name, `%${search}%`));
  if (position) conditions.push(eq(playersTable.position, position));
  if (minRating !== undefined) conditions.push(gte(playersTable.rating, minRating));
  const players = await db
    .select()
    .from(playersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(playersTable.rating);
  return res.json(players);
});

router.get("/top-rated", async (req, res) => {
  const parsed = ListTopRatedPlayersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }
  const limit = parsed.data.limit ?? 10;
  const players = await db
    .select()
    .from(playersTable)
    .orderBy(playersTable.rating)
    .limit(limit);
  return res.json(players.reverse());
});

router.get("/:id", async (req, res) => {
  const parsed = GetPlayerParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, parsed.data.id));
  if (!player) return res.status(404).json({ error: "Player not found" });
  return res.json(player);
});

export default router;
