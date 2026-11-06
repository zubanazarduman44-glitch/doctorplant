// Бұл сервер жағы: суретті алады, Gemini-ге жібереді, жауапты қайтарады.
// Это серверная часть: получает фото, отправляет в Gemini, возвращает ответ.
// API-кілт тек серверде болады — браузерге ешқашан көрінбейді.

import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";
import { saveDiagnosis } from "../../../lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

function buildPrompt(lang, count = 1) {
  return `Сен — Қазақстанда жұмыс істейтін тәжірибелі агроном және ботаниксің. Пайдаланушы өсімдіктің суретін жіберді.
You are an experienced agronomist and botanist working in Kazakhstan. Analyze the plant photo.

${count > 1 ? `The user sent ${count} photos of the SAME plant (e.g. whole plant, leaf top, leaf underside). Use all of them together for one diagnosis.\n` : ""}
Rules:
- Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru}. Plant latin name and product brand names may stay in Latin/original.
- If the image does not show a plant, set "is_plant": false and explain briefly in "photo_tip".
- If the photo is blurry, too dark or too far, lower confidence and say in "photo_tip" how to retake it (closer to the leaf, daylight, show both sides of leaf).
- Be honest about uncertainty. Never invent a disease if the plant looks healthy. Watering/light problems are often mistaken for disease — consider them first.
- For treatment: prefer simple, safe care steps first.
- "products": fill ONLY if a fungicide/insecticide/fertilizer or biological product is really needed (otherwise empty array). For each product give: product_type (e.g. "copper-based fungicide"), active_ingredient (international name, e.g. "copper oxychloride"), search_query (short Russian query to search this product in a Kazakhstan online shop, e.g. "хлорокись меди фунгицид"), example_brands (1-3 brand names commonly sold in Kazakhstan/CIS garden shops, if you are not sure — leave empty), safety (one short safety note). NEVER give exact doses — the user must follow the label.
- NEVER say whether a plant is safe to eat.
- Mention if the plant is toxic to pets or children (only if well known).
- Keep each text field short and practical, suitable for a mobile screen.`;
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    is_plant: { type: "BOOLEAN" },
    plant_name: { type: "STRING", description: "Common name in the answer language" },
    latin_name: { type: "STRING" },
    confidence: { type: "INTEGER", description: "0-100, how sure about species" },
    health_status: { type: "STRING", enum: ["healthy", "needs_attention", "sick", "unknown"] },
    diagnosis: { type: "STRING", description: "Main problem or 'healthy'" },
    symptoms: { type: "ARRAY", items: { type: "STRING" } },
    causes: { type: "ARRAY", items: { type: "STRING" } },
    treatment: { type: "ARRAY", items: { type: "STRING" }, description: "Step-by-step actions" },
    products: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          product_type: { type: "STRING" },
          active_ingredient: { type: "STRING" },
          search_query: { type: "STRING" },
          example_brands: { type: "ARRAY", items: { type: "STRING" } },
          safety: { type: "STRING" },
        },
        required: ["product_type", "search_query"],
      },
    },
    care: {
      type: "OBJECT",
      properties: {
        watering: { type: "STRING" },
        light: { type: "STRING" },
        temperature: { type: "STRING" },
        soil_fertilizer: { type: "STRING" },
      },
    },
    watering_interval_days: {
      type: "INTEGER",
      description: "Typical number of days between waterings for this plant now (1-30). For a houseplant assume indoor conditions.",
    },
    fertilize_interval_days: {
      type: "INTEGER",
      description: "Typical days between feedings in the growing season (7-90), or 0 if not needed now.",
    },
    toxicity_note: { type: "STRING" },
    photo_tip: { type: "STRING", description: "Empty if photo is good" },
  },
  required: ["is_plant", "confidence", "health_status", "diagnosis", "treatment", "care"],
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const { image, images, lang = "kk", clientId } = body || {};
  // Бір немесе бірнеше сурет (ең көбі 3)
  const list = (Array.isArray(images) ? images : [image]).filter(
    (x) => typeof x === "string" && x.startsWith("data:image/")
  );
  if (!list.length) {
    return Response.json({ error: "Сурет табылмады / Фото не найдено" }, { status: 400 });
  }
  const parts = [{ text: buildPrompt(lang, Math.min(list.length, 3)) }];
  let total = 0;
  for (const img of list.slice(0, 3)) {
    const [meta, base64] = img.split(",");
    total += base64?.length || 0;
    if (!base64 || total > 9_000_000) {
      return Response.json({ error: "Сурет тым үлкен / Фото слишком большое" }, { status: 413 });
    }
    parts.push({ inline_data: { mime_type: meta.slice(5, meta.indexOf(";")), data: base64 } });
  }
  const contents = [{ role: "user", parts }];

  let text;
  try {
    text = await callGemini(contents, { schema: SCHEMA });
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }

  let result;
  try {
    result = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    console.error("Parse error", text?.slice(0, 500));
    return Response.json({ error: "Жауапты оқу мүмкін болмады / Не удалось разобрать ответ" }, { status: 502 });
  }

  // Базаға сақтаймыз (сурет сақталмайды — тек нәтиже)
  const id = await saveDiagnosis({ lang, clientId, result });
  return Response.json({ ...result, id });
}
