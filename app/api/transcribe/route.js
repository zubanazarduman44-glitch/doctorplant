// Дауысты мәтінге айналдыру (қазақша / орысша) — Gemini арқылы
// Распознавание речи (казахский / русский) — через Gemini
import { callGemini, GeminiError } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { audio, lang = "kk" } = body || {};
  if (typeof audio !== "string" || !audio.startsWith("data:audio/")) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const [meta, base64] = audio.split(",");
  if (!base64 || base64.length > 4_000_000) {
    return Response.json({ error: "Жазба тым ұзын / Запись слишком длинная" }, { status: 413 });
  }
  const mime = meta.slice(5, meta.indexOf(";"));

  const prompt = `Transcribe this voice message exactly, word for word.
The speaker most likely talks in ${lang === "kk" ? "Kazakh (қазақ тілі)" : lang === "en" ? "English" : "Russian"}, but may use Kazakh, Russian, English or mix them — keep each word in the language it was spoken (Kazakh and Russian in Cyrillic, English in Latin letters).
The topic is usually plants, gardening, botany or ecology.
Return ONLY the transcript text, no quotes, no comments. If there is no speech, return an empty string.`;

  try {
    const text = await callGemini(
      [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }],
      { temperature: 0 }
    );
    return Response.json({ text: text.replace(/^["«]|["»]$/g, "").trim() });
  } catch (e) {
    // Бос жауап — сөз естілмеді
    if (/empty response/i.test(e.message)) return Response.json({ text: "" });
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }
}
