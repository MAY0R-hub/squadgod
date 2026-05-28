import Anthropic from "@anthropic-ai/sdk";

export const config = { maxDuration: 30 };

const NATION_STARS = {
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

function buildFallbackCommentary(nationName, tactic, gafferName, won) {
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
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const src = req.method === "GET"
    ? (req.query || {})
    : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {});
  const { gafferName = "The Gaffer", nationName = "the nation", tactic = "4-3-3", won = "false" } = src;
  const didWin = won === true || won === "true";
  const stars = (NATION_STARS[nationName] ?? ["the captain", "the striker", "the winger"]).join(", ");

  res.setHeader("Cache-Control", "no-store");

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json({ events: buildFallbackCommentary(nationName, tactic, gafferName, didWin), source: "fallback" });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await callAnthropic(client, {
      model: "claude-sonnet-4-5",
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
    }, 20000);

    const raw = message.content?.[0]?.type === "text" ? message.content[0].text.trim() : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    if (Array.isArray(parsed) && parsed.length >= 5) {
      return res.status(200).json({ events: parsed, source: "ai" });
    }
    return res.status(200).json({ events: buildFallbackCommentary(nationName, tactic, gafferName, didWin), source: "fallback" });
  } catch (err) {
    console.warn("Anthropic /commentary failed, using fallback:", err?.message || err);
    return res.status(200).json({ events: buildFallbackCommentary(nationName, tactic, gafferName, didWin), source: "fallback" });
  }
}
