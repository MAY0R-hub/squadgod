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

router.post("/think", async (req, res) => {
  const { gafferName, nationName, prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `You are ${gafferName || "The Gaffer"}, an aggressive AI football manager for ${nationName || "your nation"}.

The user said: "${prompt}"

Respond ONLY with a JSON object, no markdown, no backticks, no explanation:
{
  "tactic": "one of: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2, 3-4-3",
  "taunt": "one savage trash-talk line max 12 words, football culture, onchain reference",
  "stakeAmt": "a number between 10 and 80",
  "tacticReason": "one sentence why this formation fits the prompt"
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

export default router;
