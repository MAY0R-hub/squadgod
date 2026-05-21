import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const TACTICS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];

const TRASH_TALKS = [
  "Your squad couldn't find the net with GPS.",
  "My Gaffer runs on pure W energy. Yours runs on cope.",
  "4-3-3 and a prayer — that's all you've got.",
  "The receipts don't lie. The blockchain never forgets.",
  "Your formation is as weak as your conviction.",
  "We don't predict wins. We manifest them. Onchain.",
];

const NATION_STARS: Record<string, [string, string, string]> = {
  Brazil:    ["Vinicius", "Rodrygo", "Endrick"],
  Argentina: ["Messi", "Julián Álvarez", "Mac Allister"],
  France:    ["Mbappé", "Camavinga", "Tchouaméni"],
  Germany:   ["Wirtz", "Musiala", "Kimmich"],
  Spain:     ["Yamal", "Pedri", "Morata"],
  England:   ["Bellingham", "Saka", "Palmer"],
  Portugal:  ["Cristiano", "Bruno", "Rúben Dias"],
  Nigeria:   ["Osimhen", "Lookman", "Iwobi"],
  Japan:     ["Kubo", "Mitoma", "Ueda"],
  Mexico:    ["Lozano", "Lainez", "Rafa Márquez"],
  USA:       ["Pulisic", "Reyna", "Adams"],
  Morocco:   ["Hakimi", "En-Nesyri", "Ounahi"],
};

function buildFallbackCommentary(
  nationName: string,
  tactic: string,
  gafferName: string,
  won: boolean
): Array<{ minute: number; type: string; text: string }> {
  const stars = NATION_STARS[nationName] ?? ["the captain", "the striker", "the winger"];
  const [s1, s2, s3] = stars;

  return [
    { minute: 1,  type: "kickoff",  text: `Kick off! ${gafferName}'s ${nationName} set up in ${tactic}.` },
    { minute: 14, type: "pressure", text: `${nationName}'s ${tactic} suffocating the midfield — high press is working.` },
    { minute: 31, type: "chance",   text: `${s1} drives forward. ${gafferName}'s instructions paying off!` },
    { minute: 45, type: "whistle",  text: `Half time. ${nationName} ${won ? "in control" : "hanging on"}. The gaffer paces the tunnel.` },
    { minute: 57, type: "pressure", text: `${s2} pressing relentlessly second half. No let-up from ${nationName}.` },
    { minute: 76, type: "chance",   text: `${s3} finds space! ${nationName} ${won ? "pushing for the winner" : "chasing the equaliser"}.` },
    { minute: 90, type: "final",    text: `FULL TIME. ${nationName} ${won ? "WIN" : "LOSE"}. Receipts onchain forever.` },
  ];
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post("/", async (req, res) => {
  const { prompt, gafferName, nationName } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are ${gafferName}, an aggressive AI football manager for ${nationName}.

The user said: "${prompt}"

Respond ONLY with a JSON object, no markdown, no backticks:
{
  "tactic": "one of: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2, 3-4-3",
  "taunt": "one savage trash-talk line max 12 words, football culture",
  "stakeAmt": "a number between 10 and 80",
  "tacticReason": "one sentence why this formation fits"
}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text.trim());

    if (!TACTICS.includes(parsed.tactic)) {
      parsed.tactic = TACTICS[Math.floor(Math.random() * TACTICS.length)];
    }

    return res.json(parsed);
  } catch (err) {
    req.log.warn({ err }, "Anthropic /gaffer failed, using fallback");
    return res.json({
      tactic: TACTICS[Math.floor(Math.random() * TACTICS.length)],
      taunt: TRASH_TALKS[Math.floor(Math.random() * TRASH_TALKS.length)],
      stakeAmt: String((Math.random() * 40 + 10).toFixed(1)),
      tacticReason: "Classic formation, maximum control.",
    });
  }
});

router.get("/commentary", async (req, res) => {
  const { gafferName = "The Gaffer", nationName = "the nation", tactic = "4-3-3", won = "false" } =
    req.query as Record<string, string>;
  const didWin = won === "true";
  const stars = (NATION_STARS[nationName] ?? ["the captain", "the striker", "the winger"]).join(", ");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  let events: Array<{ minute: number; type: string; text: string }> = [];

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Generate live match commentary for ${gafferName} managing ${nationName} in a ${tactic} formation.
Key players to reference: ${stars}.
The match result is a ${didWin ? "WIN" : "LOSS"}.

Return ONLY a JSON array of exactly 7 match events. No markdown, no backticks. Each event:
{"minute": number, "type": "kickoff"|"pressure"|"chance"|"goal"|"tackle"|"whistle"|"final", "text": "commentary line max 15 words — reference the nation, formation or a player by name. Dramatic football style."}

Build tension toward the ${didWin ? "winning" : "losing"} result. Last event must be minute 90, type "final".`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    events = JSON.parse(raw);
  } catch {
    events = buildFallbackCommentary(nationName, tactic, gafferName, didWin);
  }

  for (const event of events) {
    await delay(2200);
    send(event);
  }

  await delay(1500);
  send({ done: true });
  res.end();
});

export default router;
