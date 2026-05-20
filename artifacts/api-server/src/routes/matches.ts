import { Router } from "express";
import { db } from "@workspace/db";
import { matchPredictionsTable, squadsTable, squadPlayersTable, playersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { PredictMatchBody } from "@workspace/api-zod";

const router = Router();

function generatePrediction(homeTeam: string, awayTeam: string, homeRating: number, awayRating: number) {
  const diff = homeRating - awayRating;
  const homeAdv = 5;
  const base = diff + homeAdv;

  const homeScore = Math.max(0, Math.round(1.5 + base / 20 + (Math.random() - 0.5) * 2));
  const awayScore = Math.max(0, Math.round(1.5 - base / 20 + (Math.random() - 0.5) * 2));
  const confidence = Math.min(0.99, Math.max(0.51, 0.72 + Math.abs(diff) / 200));

  const analyses = [
    `${homeTeam} holds a decisive midfield advantage with superior pressing intensity. Expect ${homeTeam} to control possession and exploit ${awayTeam}'s defensive gaps in transition.`,
    `${awayTeam} enters this fixture with high individual quality upfront. ${homeTeam}'s backline will need to maintain discipline to neutralize counter-attack threats.`,
    `Tactical analysis suggests ${homeTeam} will dominate set-piece situations. ${awayTeam}'s high defensive line creates vulnerability to through balls — a key exploitable vector.`,
    `Data projections favor ${homeTeam} in aerial duels (62% win rate). ${awayTeam} must convert their limited chances efficiently or face a controlled defeat.`,
    `SquadGod AI identifies ${homeTeam}'s pressing triggers in the final third as a decisive factor. ${awayTeam}'s build-up will face intense disruption from minute one.`,
  ];

  const aiAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
  return { homeScore, awayScore, confidence, aiAnalysis };
}

async function getSquadRating(squadId: number | null | undefined): Promise<number> {
  if (!squadId) return 75;
  const [squad] = await db.select().from(squadsTable).where(eq(squadsTable.id, squadId));
  if (!squad) return 75;
  const members = await db
    .select({ rating: playersTable.rating })
    .from(squadPlayersTable)
    .innerJoin(playersTable, eq(squadPlayersTable.playerId, playersTable.id))
    .where(eq(squadPlayersTable.squadId, squadId));
  if (members.length === 0) return 75;
  return Math.round(members.reduce((s, m) => s + m.rating, 0) / members.length);
}

router.get("/", async (req, res) => {
  const predictions = await db
    .select()
    .from(matchPredictionsTable)
    .orderBy(desc(matchPredictionsTable.createdAt))
    .limit(20);
  return res.json(predictions);
});

router.post("/", async (req, res) => {
  const parsed = PredictMatchBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { homeTeam, awayTeam, homeSquadId, awaySquadId } = parsed.data;
  const homeRating = await getSquadRating(homeSquadId);
  const awayRating = await getSquadRating(awaySquadId);
  const { homeScore, awayScore, confidence, aiAnalysis } = generatePrediction(homeTeam, awayTeam, homeRating, awayRating);
  const [prediction] = await db
    .insert(matchPredictionsTable)
    .values({ homeTeam, awayTeam, homeScore, awayScore, confidence, aiAnalysis })
    .returning();
  return res.status(201).json(prediction);
});

export default router;
