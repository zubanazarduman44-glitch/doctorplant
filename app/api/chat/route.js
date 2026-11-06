// Диагноздан кейінгі чат: пайдаланушы өсімдігі туралы сұрақ қояды.
// Чат после диагноза: пользователь задаёт вопросы о своём растении.

import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";
import { countChatMessage } from "../../../lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_LEN = 1000;

function systemPrompt(lang, diagnosis) {
  return `You are "Өсімдік дәрігері" (Plant Doctor), a friendly expert in botany, plant biology, ecology and gardening for users in Kazakhstan.
Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru}.
Length: practical care questions — short (up to ~120 words). Explanations of science (biology, ecology) — clear and structured, up to ~250 words, with a simple example. Use simple words; explain terms the first time you use them.

${
    diagnosis
      ? `The user already received this diagnosis of their plant (JSON):\n${JSON.stringify(diagnosis).slice(0, 4000)}`
      : "The user has no diagnosis yet. If they describe a sick plant, help with questions and suggest uploading a photo in the Diagnosis tab for a precise answer."
  }

Rules:
- Your topics (answer all of them fully):
  • care of houseplants, flowers, garden and vegetable crops, trees; diseases, pests, treatment, prevention, repotting, buying products in Kazakhstan;
  • flowers and floristics: species, varieties, symbolism, bouquets, how to keep cut flowers fresh;
  • botany and plant biology: plant structure, photosynthesis, respiration, water and nutrient transport, growth and hormones, flowering, pollination, seeds, reproduction, genetics and breeding, classification and Latin names, evolution of plants;
  • ecology: ecosystems, food chains, the role of plants and pollinators, soil, climate and plants, biodiversity, invasive species, desertification, protected and Red Book plants of Kazakhstan, environmental protection, composting, urban greening;
  • flora of Kazakhstan and Central Asia (steppe, desert, mountains, wild tulips, apples of Almaty, saxaul, etc.).
- You can help students: explain school/university biology and ecology topics about plants step by step. Do not just write homework for them — explain so they understand.
- If a question is completely unrelated to plants, nature, biology or ecology, politely say what you can help with.
- Be accurate. If something is debated or you are not sure, say so honestly. Do not invent facts, statistics or sources.
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
