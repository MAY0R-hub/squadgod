import { Router } from "express";
import { db } from "@workspace/db";
import {
  squadsTable,
  squadPlayersTable,
  playersTable,
} from "@workspace/db";
import { eq, count, avg, sql } from "drizzle-orm";
import {
  CreateSquadBody,
  UpdateSquadBody,
  UpdateSquadParams,
  GetSquadParams,
  DeleteSquadParams,
  AddPlayerToSquadParams,
  AddPlayerToSquadBody,
  RemovePlayerFromSquadParams,
  GetSquadAnalysisParams,
} from "@workspace/api-zod";

const router = Router();

async function buildSquadWithPlayers(squadId: number) {
  const [squad] = await db.select().from(squadsTable).where(eq(squadsTable.id, squadId));
  if (!squad) return null;

  const members = await db
    .select({
      id: squadPlayersTable.id,
      playerId: squadPlayersTable.playerId,
      positionSlot: squadPlayersTable.positionSlot,
      player: {
        id: playersTable.id,
        name: playersTable.name,
        position: playersTable.position,
        rating: playersTable.rating,
        pace: playersTable.pace,
        shooting: playersTable.shooting,
        passing: playersTable.passing,
        dribbling: playersTable.dribbling,
        defending: playersTable.defending,
        physical: playersTable.physical,
        nationality: playersTable.nationality,
        club: playersTable.club,
        imageUrl: playersTable.imageUrl,
      },
    })
    .from(squadPlayersTable)
    .innerJoin(playersTable, eq(squadPlayersTable.playerId, playersTable.id))
    .where(eq(squadPlayersTable.squadId, squadId));

  const overallRating =
    members.length > 0
      ? Math.round(members.reduce((s, m) => s + m.player.rating, 0) / members.length)
      : 0;

  return {
    ...squad,
    overallRating,
    players: members,
    createdAt: squad.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const squads = await db.select().from(squadsTable);
  const results = await Promise.all(squads.map((s) => buildSquadWithPlayers(s.id)));
  return res.json(results.filter(Boolean));
});

router.get("/overview", async (req, res) => {
  const [{ totalSquads }] = await db.select({ totalSquads: count() }).from(squadsTable);
  const [{ totalPlayers }] = await db.select({ totalPlayers: count() }).from(squadPlayersTable);
  const [{ avgRating }] = await db
    .select({ avgRating: avg(playersTable.rating) })
    .from(playersTable);

  const formationRows = await db
    .select({ formation: squadsTable.formation, cnt: count() })
    .from(squadsTable)
    .groupBy(squadsTable.formation)
    .orderBy(sql`count(*) desc`)
    .limit(1);

  return res.json({
    totalSquads,
    totalPlayers,
    avgOverallRating: parseFloat(avgRating ?? "0"),
    topFormation: formationRows[0]?.formation ?? "4-3-3",
  });
});

router.post("/", async (req, res) => {
  const parsed = CreateSquadBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [squad] = await db.insert(squadsTable).values(parsed.data).returning();
  const result = await buildSquadWithPlayers(squad.id);
  return res.status(201).json(result);
});

router.get("/:id/analysis", async (req, res) => {
  const parsed = GetSquadAnalysisParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const squad = await buildSquadWithPlayers(parsed.data.id);
  if (!squad) return res.status(404).json({ error: "Squad not found" });

  const players = squad.players.map((m) => m.player);
  const avgPace = players.length ? Math.round(players.reduce((s, p) => s + p.pace, 0) / players.length) : 0;
  const avgShooting = players.length ? Math.round(players.reduce((s, p) => s + p.shooting, 0) / players.length) : 0;
  const avgPassing = players.length ? Math.round(players.reduce((s, p) => s + p.passing, 0) / players.length) : 0;
  const avgDefending = players.length ? Math.round(players.reduce((s, p) => s + p.defending, 0) / players.length) : 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (avgPace >= 75) strengths.push("Elite pace across the squad — dangerous in transition");
  else weaknesses.push("Below-average pace — vulnerable to fast counter-attacks");
  if (avgShooting >= 72) strengths.push("Clinical in front of goal — high conversion probability");
  else weaknesses.push("Lacks goal threat — finishing needs reinforcement");
  if (avgPassing >= 73) strengths.push("Exceptional passing network — fluid build-up play");
  else weaknesses.push("Short passing range limits creative options in midfield");
  if (avgDefending >= 70) strengths.push("Solid defensive block — opponents will struggle to break through");
  else weaknesses.push("Defensive line exposed — high risk against direct play");

  const suggestions: string[] = [
    "Consider adding a deep-lying playmaker to improve defensive transitions",
    "A box-to-box midfielder would increase press resistance",
    "Target a pacey winger to stretch opposition defenses",
  ];

  const total = squad.overallRating;
  const grade =
    total >= 88 ? "S" : total >= 82 ? "A" : total >= 75 ? "B" : total >= 68 ? "C" : "D";

  return res.json({ squadId: squad.id, strengths, weaknesses, suggestions, overallGrade: grade });
});

router.get("/:id", async (req, res) => {
  const parsed = GetSquadParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  const result = await buildSquadWithPlayers(parsed.data.id);
  if (!result) return res.status(404).json({ error: "Not found" });
  return res.json(result);
});

router.patch("/:id", async (req, res) => {
  const paramsParsed = UpdateSquadParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateSquadBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) return res.status(400).json({ error: "Invalid input" });
  await db.update(squadsTable).set(bodyParsed.data).where(eq(squadsTable.id, paramsParsed.data.id));
  const result = await buildSquadWithPlayers(paramsParsed.data.id);
  if (!result) return res.status(404).json({ error: "Not found" });
  return res.json(result);
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteSquadParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(squadsTable).where(eq(squadsTable.id, parsed.data.id));
  return res.status(204).send();
});

router.post("/:id/players", async (req, res) => {
  const paramsParsed = AddPlayerToSquadParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = AddPlayerToSquadBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) return res.status(400).json({ error: "Invalid input" });
  await db.insert(squadPlayersTable).values({
    squadId: paramsParsed.data.id,
    playerId: bodyParsed.data.playerId,
    positionSlot: bodyParsed.data.positionSlot,
  });
  const result = await buildSquadWithPlayers(paramsParsed.data.id);
  return res.status(201).json(result);
});

router.delete("/:id/players/:playerId", async (req, res) => {
  const parsed = RemovePlayerFromSquadParams.safeParse({
    id: Number(req.params.id),
    playerId: Number(req.params.playerId),
  });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  await db
    .delete(squadPlayersTable)
    .where(
      sql`${squadPlayersTable.squadId} = ${parsed.data.id} AND ${squadPlayersTable.playerId} = ${parsed.data.playerId}`
    );
  const result = await buildSquadWithPlayers(parsed.data.id);
  return res.json(result);
});

export default router;
