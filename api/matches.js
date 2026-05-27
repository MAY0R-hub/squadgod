import pg from "pg";

let pool;
function getPool() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

function generatePrediction(homeTeam, awayTeam, homeRating, awayRating) {
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

async function getSquadRating(client, squadId) {
  if (!squadId) return 75;
  const { rows } = await client.query(
    `SELECT AVG(p.rating)::int AS avg_rating
     FROM squad_players sp
     INNER JOIN players p ON sp.player_id = p.id
     WHERE sp.squad_id = $1`,
    [squadId],
  );
  return rows[0]?.avg_rating ?? 75;
}

export default async function handler(req, res) {
  const client = getPool();

  if (req.method === "GET") {
    const { rows } = await client.query(
      `SELECT id, home_team AS "homeTeam", away_team AS "awayTeam",
              home_score AS "homeScore", away_score AS "awayScore",
              confidence, ai_analysis AS "aiAnalysis", created_at AS "createdAt"
       FROM match_predictions
       ORDER BY created_at DESC
       LIMIT 20`,
    );
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { homeTeam, awayTeam, homeSquadId, awaySquadId } = body;
    if (!homeTeam || !awayTeam || typeof homeTeam !== "string" || typeof awayTeam !== "string") {
      return res.status(400).json({ error: "homeTeam and awayTeam are required strings" });
    }
    const homeRating = await getSquadRating(client, homeSquadId);
    const awayRating = await getSquadRating(client, awaySquadId);
    const { homeScore, awayScore, confidence, aiAnalysis } = generatePrediction(homeTeam, awayTeam, homeRating, awayRating);
    const { rows } = await client.query(
      `INSERT INTO match_predictions (home_team, away_team, home_score, away_score, confidence, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, home_team AS "homeTeam", away_team AS "awayTeam",
                 home_score AS "homeScore", away_score AS "awayScore",
                 confidence, ai_analysis AS "aiAnalysis", created_at AS "createdAt"`,
      [homeTeam, awayTeam, homeScore, awayScore, confidence, aiAnalysis],
    );
    return res.status(201).json(rows[0]);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
