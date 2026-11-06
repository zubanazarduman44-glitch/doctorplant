// Энциклопедия: кез келген өсімдік туралы карточка жасау
// Энциклопедия: карточка о любом растении
import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    found: { type: "BOOLEAN", description: "false if this is not a real plant name" },
    name: { type: "STRING", description: "Common name in the answer language" },
    latin: { type: "STRING" },
    family: { type: "STRING", description: "Botanical family in Latin" },
    type: { type: "STRING", description: "Short type, e.g. 'Houseplant', 'Vegetable', 'Tree'" },
    light: { type: "INTEGER", description: "1 shade, 2 bright indirect, 3 full sun" },
    water_min: { type: "INTEGER", description: "Min days between waterings" },
    water_max: { type: "INTEGER", description: "Max days between waterings" },
    temp_min: { type: "INTEGER", description: "Comfortable min °C" },
    temp_max: { type: "INTEGER", description: "Comfortable max °C" },
    difficulty: { type: "INTEGER", description: "1 easy, 2 medium, 3 hard" },
    tip: { type: "STRING", description: "Most important care tip, 1-2 sentences" },
    fact: { type: "STRING", description: "One interesting, well-established fact" },
    toxic: { type: "STRING", description: "Toxicity to people/pets if well known, else empty" },
    kz: { type: "STRING", description: "Relation to Kazakhstan (grows wild, Red Book, popular crop) if well known, else empty" },
  },
  required: ["found", "name", "latin", "family", "type", "light", "water_min", "water_max", "temp_min", "temp_max", "difficulty", "tip", "fact"],
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { query, lang = "kk" } = body || {};
  const q = typeof query === "string" ? query.trim().slice(0, 80) : "";
  if (!q) return Response.json({ error: "Bad request" }, { status: 400 });

  const prompt = `You are a careful botanist writing a short encyclopedia card for users in Kazakhstan.
Plant requested by the user: "${q.replace(/"/g, "'")}"
Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru} (Latin names stay in Latin).
Only state well-established facts. If unsure about a field (toxicity, Kazakhstan), leave it empty instead of guessing.
If the text is not a plant, set found=false.`;

  try {
    const text = await callGemini([{ role: "user", parts: [{ text: prompt }] }], { schema: SCHEMA, temperature: 0.2 });
    return Response.json(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")));
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }
}
