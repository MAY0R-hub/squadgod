import Anthropic from "@anthropic-ai/sdk";

const TACTICS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];

const TRASH_TALKS = [
  "Your squad couldn't find the net with GPS.",
  "My Gaffer runs on pure W energy. Yours runs on cope.",
  "4-3-3 and a prayer — that's all you've got.",
  "The receipts don't lie. The blockchain never forgets.",
  "Your formation is as weak as your conviction.",
  "We don't predict wins. We manifest them. Onchain.",
];

async function callAnthropic(client, params, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await client.messages.create(params, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { prompt, gafferName, nationName, formation } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }
  if (!formation || !TACTICS.includes(formation)) {
    return res.status(400).json({ error: `formation is required and must be one of: ${TACTICS.join(", ")}` });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await callAnthropic(client, {
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are ${gafferName}, an aggressive AI football manager for ${nationName}.

FORMATION RULE: You MUST use exactly the formation provided: ${formation}. Never substitute or override it. If the user selected ${formation} you output ${formation}. This is non-negotiable.

The user said: "${prompt}"

Respond ONLY with a JSON object, no markdown, no backticks:
{
  "tactic": "${formation}",
  "taunt": "one savage trash-talk line max 12 words, football culture",
  "stakeAmt": "a number between 10 and 80",
  "tacticReason": "one sentence why ${formation} fits this match plan"
}`,
        },
      ],
    }, 8000);

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.trim());
    parsed.tactic = formation;
    return res.status(200).json(parsed);
  } catch (err) {
    console.warn("Anthropic /gaffer failed, using fallback:", err?.message || err);
    return res.status(200).json({
      tactic: formation,
      taunt: TRASH_TALKS[Math.floor(Math.random() * TRASH_TALKS.length)],
      stakeAmt: String((Math.random() * 40 + 10).toFixed(1)),
      tacticReason: "Classic formation, maximum control.",
    });
  }
}
