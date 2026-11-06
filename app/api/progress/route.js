// Емдеу барысын бағалау: бастапқы диагноз + жаңа сурет → жақсарды ма?
// Оценка хода лечения: исходный диагноз + новое фото → стало ли лучше?
import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: { type: "STRING", enum: ["improved", "same", "worse", "unclear"] },
    summary: { type: "STRING", description: "1-2 sentences: what changed compared with the original diagnosis" },
    next_steps: { type: "ARRAY", items: { type: "STRING" }, description: "2-4 short next actions" },
  },
  required: ["verdict", "summary", "next_steps"],
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { image, diagnosis, days = 0, lang = "kk" } = body || {};
  if (typeof image !== "string" || !image.startsWith("data:image/") || !diagnosis) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const [meta, base64] = image.split(",");
  if (!base64 || base64.length > 6_000_000) {
    return Response.json({ error: "Сурет тым үлкен / Фото слишком большое" }, { status: 413 });
  }

  const prompt = `You are an experienced agronomist. ${Number(days) || 0} days ago this plant was diagnosed (JSON):
${JSON.stringify({
    plant: diagnosis.plant_name,
    latin: diagnosis.latin_name,
    status: diagnosis.health_status,
    diagnosis: diagnosis.diagnosis,
    symptoms: diagnosis.symptoms,
    treatment: diagnosis.treatment,
  }).slice(0, 3000)}

The user now sends a NEW photo of the same plant during treatment.
Compare the current state with the original symptoms and say if it improved, stayed the same or got worse.
If the photo is unclear or shows a different plant, use "unclear" and say what to retake.
Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru}. Be short, honest and practical. Never give exact chemical doses.`;

  try {
    const text = await callGemini(
      [
        {
          role: "user",
          parts: [{ text: prompt }, { inline_data: { mime_type: meta.slice(5, meta.indexOf(";")), data: base64 } }],
        },
      ],
      { schema: SCHEMA }
    );
    return Response.json(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")));
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }
}
