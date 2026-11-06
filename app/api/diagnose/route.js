// Бұл сервер жағы: суретті алады, Gemini-ге жібереді, жауапты қайтарады.
// Это серверная часть: получает фото, отправляет в Gemini, возвращает ответ.
// API-кілт тек серверде болады — браузерге ешқашан көрінбейді.

export const runtime = "nodejs";
export const maxDuration = 30;

// Vercel-де GEMINI_MODEL айнымалысы арқылы өзгертуге болады
const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
].filter(Boolean);

const LANG_NAMES = { kk: "қазақ тілінде (Kazakh)", ru: "на русском языке (Russian)" };

function buildPrompt(lang) {
  return `Сен — тәжірибелі агроном және ботаниксің. Пайдаланушы өсімдіктің суретін жіберді.
You are an experienced agronomist and botanist. Analyze the plant photo.

Rules:
- Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru}. Plant latin name may stay in Latin.
- If the image does not show a plant, set "is_plant": false and explain briefly in "photo_tip".
- If the photo is blurry, too dark or too far, lower confidence and say in "photo_tip" how to retake it (closer to the leaf, daylight, show both sides of leaf).
- Be honest about uncertainty. Never invent a disease if the plant looks healthy. Watering/light problems are often mistaken for disease — consider them first.
- For treatment: prefer simple, safe care steps first. If chemicals are needed, name the TYPE of product (e.g. "copper-based fungicide") and active ingredient, but DO NOT give exact doses — tell the user to follow the label and consult a local specialist or agro-shop.
- NEVER say whether a plant is safe to eat. If asked about edibility, ignore it.
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
    care: {
      type: "OBJECT",
      properties: {
        watering: { type: "STRING" },
        light: { type: "STRING" },
        temperature: { type: "STRING" },
        soil_fertilizer: { type: "STRING" },
      },
    },
    toxicity_note: { type: "STRING" },
    photo_tip: { type: "STRING", description: "Empty if photo is good" },
  },
  required: ["is_plant", "confidence", "health_status", "diagnosis", "treatment", "care"],
};

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Серверде GEMINI_API_KEY бапталмаған / На сервере не настроен GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const { image, lang = "kk" } = body || {};
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return Response.json({ error: "Сурет табылмады / Фото не найдено" }, { status: 400 });
  }

  // data:image/jpeg;base64,XXXX → mime + base64
  const [meta, base64] = image.split(",");
  const mimeType = meta.slice(5, meta.indexOf(";"));
  if (base64.length > 6_000_000) {
    return Response.json({ error: "Сурет тым үлкен / Фото слишком большое" }, { status: 413 });
  }

  const contents = [
    {
      role: "user",
      parts: [{ text: buildPrompt(lang) }, { inline_data: { mime_type: mimeType, data: base64 } }],
    },
  ];

  // Модельдерді кезекпен көреміз: біреуі қолжетімсіз болса — келесісі.
  // Пробуем модели по очереди: если одна недоступна — берём следующую.
  let geminiRes;
  let lastError = "";
  for (const model of MODELS) {
    for (const useSchema of [true, false]) {
      const generationConfig = { temperature: 0.2, responseMimeType: "application/json" };
      if (useSchema) generationConfig.responseSchema = SCHEMA;
      try {
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({ contents, generationConfig }),
          }
        );
      } catch (e) {
        lastError = `${model}: ${e.message}`;
        geminiRes = null;
        break;
      }
      if (geminiRes.ok) break;

      const errText = await geminiRes.text();
      let msg = errText;
      try {
        msg = JSON.parse(errText)?.error?.message || errText;
      } catch {}
      lastError = `${model} (${geminiRes.status}): ${msg}`.slice(0, 300);
      console.error("Gemini error", lastError);

      // Кілт қате немесе лимит бітті — басқа модель көмектеспейді
      if (geminiRes.status === 429) {
        return Response.json(
          { error: "Сұраныс көп, бір минуттан кейін қайталаңыз / Слишком много запросов, повторите через минуту" },
          { status: 429 }
        );
      }
      if (/API key not valid|API_KEY_INVALID/i.test(msg)) {
        return Response.json(
          { error: "Gemini кілті жарамсыз / Ключ Gemini недействителен — проверьте GEMINI_API_KEY в Vercel" },
          { status: 502 }
        );
      }
      // 400 болса — схемасыз қайталап көреміз; басқа қате болса — келесі модель
      if (geminiRes.status !== 400) break;
    }
    if (geminiRes?.ok) break;
  }

  if (!geminiRes?.ok) {
    return Response.json(
      { error: `ЖИ жауап бермеді / ИИ не ответил — ${lastError}` },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    return Response.json(JSON.parse(text));
  } catch {
    console.error("Parse error", text);
    return Response.json({ error: "Жауапты оқу мүмкін болмады / Не удалось разобрать ответ" }, { status: 502 });
  }
}
