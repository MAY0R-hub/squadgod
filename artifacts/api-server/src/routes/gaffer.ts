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

const FALLBACK_COMMENTARY = [
  { minute: 1,  type: "kickoff",  text: "Kick off! The gaffer's orders are ringing in their ears." },
  { minute: 14, type: "pressure", text: "High press engaged — the midfield is suffocating possession." },
  { minute: 31, type: "chance",   text: "Great chance! The striker is clean through on goal..." },
  { minute: 45, type: "whistle",  text: "Half time. Adjustments made. The gaffer paces the tunnel." },
  { minute: 57, type: "pressure", text: "Second half intensity. Every touch feels decisive now." },
  { minute: 76, type: "chance",   text: "Another chance — the crowd is on its feet." },
  { minute: 90, type: "final",    text: "Full time whistle. The blockchain never forgets." },
];

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
    req.log.warn({ err }, "Anthropic call failed, using fallback");
    return res.json({
      tactic: TACTICS[Math.floor(Math.random() * TACTICS.length)],
      taunt: TRASH_TALKS[Math.floor(Math.random() * TRASH_TALKS.length)],
      stakeAmt: String((Math.random() * 40 + 10).toFixed(1)),
      tacticReason: "Classic formation, maximum control.",
    });
  }
});

router.get("/commentary", async (req, res) => {
  const { gafferName, nationName, tactic, won } = req.query as Record<string, string>;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  let events: { minute: number; type: string; text: string }[] = [];

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Generate live match commentary for ${gafferName || "The Gaffer"} managing ${nationName || "their nation"} playing ${tactic || "4-3-3"}.
The match result is a ${won === "true" ? "WIN" : "LOSS"}.

Return ONLY a JSON array of exactly 7 match events. No markdown, no backticks. Each event:
{"minute": number, "type": "kickoff"|"pressure"|"chance"|"goal"|"tackle"|"whistle"|"final", "text": "commentary line, max 15 words, dramatic football style"}

Build tension toward the ${won === "true" ? "winning" : "losing"} result. Keep it intense.`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    events = JSON.parse(raw);
  } catch {
    events = FALLBACK_COMMENTARY;
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
