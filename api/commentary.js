import Anthropic from "@anthropic-ai/sdk";

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
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { gafferName = "The Gaffer", nationName = "the nation", tactic = "4-3-3", won = "false" } = req.query || {};
  const didWin = won === "true";
  const stars = (NATION_STARS[nationName] ?? ["the captain", "the striker", "the winger"]).join(", ");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  res.write(": connected\n\n");

  let events = [];
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
    }, 5000);

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    events = Array.isArray(parsed) && parsed.length >= 5 ? parsed : buildFallbackCommentary(nationName, tactic, gafferName, didWin);
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
}
