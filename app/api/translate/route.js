// ЖИ нәтижесін басқа тілге аудару (тіл ауыстырғанда)
// Перевод результата ИИ на другой язык (при смене языка интерфейса)
import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

// Аударылатын өрістер (сандар, координаттар, латын атаулары өзгермейді)
const TEXT_KEYS = [
  "plant_name", "diagnosis", "symptoms", "causes", "treatment", "products", "care",
  "toxicity_note", "photo_tip", "severity_note", "differential", "treatment_plan",
  "followup_questions", "spots",
];

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { data, to } = body || {};
  if (!data || typeof data !== "object" || !LANG_NAMES[to]) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const src = {};
  for (const k of TEXT_KEYS) if (data[k] !== undefined && data[k] !== null && data[k] !== "") src[k] = data[k];
  const raw = JSON.stringify(src);
  if (raw.length > 20000) return Response.json({ error: "Too large" }, { status: 413 });
  if (raw === "{}") return Response.json({ result: {} });

  const prompt = `Translate every human-readable text value in this JSON into ${LANG_NAMES[to]}.
Rules: keep exactly the same JSON structure, keys, array lengths and order; do NOT change numbers, booleans, "box" coordinates, "i" indexes, Latin scientific names, brand/product names or "search_query" values. Plant common names must be the usual names in the target language. Return ONLY the JSON.

${raw}`;
  try {
    const text = await callGemini([{ role: "user", parts: [{ text: prompt }] }], {
      json: true,
      fast: true,
      thinking: "minimal",
      temperature: 0,
    });
    const out = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    // Тек белгілі өрістерді қайтарамыз
    const result = {};
    for (const k of TEXT_KEYS) if (out[k] !== undefined) result[k] = out[k];
    // Координаттарды түпнұсқадан сақтаймыз
    if (Array.isArray(result.spots) && Array.isArray(data.spots)) {
      result.spots = data.spots.map((sp, k) => ({ ...sp, label: String(result.spots[k]?.label || sp.label) }));
    }
    return Response.json({ result });
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }
}
