// Диагноздан кейінгі чат: пайдаланушы өсімдігі туралы сұрақ қояды.
// Чат после диагноза: пользователь задаёт вопросы о своём растении.

import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";
import { countChatMessage } from "../../../lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_LEN = 1000;

function systemPrompt(lang, diagnosis) {
  return `You are "Өсімдік дәрігері" (Plant Doctor), a friendly agronomist assistant for users in Kazakhstan.
Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru}. Be short and practical (max ~120 words), use simple words.

${
    diagnosis
      ? `The user already received this diagnosis of their plant (JSON):\n${JSON.stringify(diagnosis).slice(0, 4000)}`
      : "The user has no diagnosis yet. If they describe a sick plant, help with questions and suggest uploading a photo in the Diagnosis tab for a precise answer."
  }

Rules:
- Answer questions about plants, their care, the disease, treatment, prevention, repotting, buying products in Kazakhstan.
- If the question is unrelated to plants or gardening, politely say you only help with plants.
- If unsure, say so and suggest sending a clearer photo or asking a local agronomist.
- NEVER give exact chemical doses — tell the user to follow the product label.
- NEVER say whether a plant or mushroom is safe to eat.
- Don't use markdown headings; short paragraphs or short lists are fine.`;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const { messages, diagnosis, lang = "kk", diagnosisId } = body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const contents = messages
    .slice(-MAX_MESSAGES)
    .filter((m) => typeof m?.text === "string" && m.text.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text.slice(0, MAX_LEN) }],
    }));

  if (!contents.length || contents[contents.length - 1].role !== "user") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const reply = await callGemini(contents, {
      system: systemPrompt(lang, diagnosis),
      temperature: 0.4,
      fast: true,
    });
    countChatMessage(diagnosisId);
    return Response.json({ reply });
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }
}
