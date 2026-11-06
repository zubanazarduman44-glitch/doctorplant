// Gemini-мен жұмыс: диагноз да, чат та осы функцияны қолданады.
// Работа с Gemini: и диагноз, и чат используют эту функцию.

// Vercel-де GEMINI_MODEL айнымалысы арқылы өзгертуге болады
const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
].filter(Boolean);

export class GeminiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

/**
 * contents — Gemini форматындағы хабарламалар
 * opts.schema — JSON схемасы (болса, жауап JSON болады)
 * opts.system — жүйелік нұсқаулық
 * Жауап: мәтін (string)
 */
export async function callGemini(contents, { schema, system, temperature = 0.2 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("Серверде GEMINI_API_KEY бапталмаған / На сервере не настроен GEMINI_API_KEY", 500);
  }

  let lastError = "";
  for (const model of MODELS) {
    for (const useSchema of schema ? [true, false] : [false]) {
      const generationConfig = { temperature };
      if (schema) generationConfig.responseMimeType = "application/json";
      if (useSchema) generationConfig.responseSchema = schema;

      const body = { contents, generationConfig };
      if (system) body.systemInstruction = { parts: [{ text: system }] };

      let res;
      try {
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify(body),
          }
        );
      } catch (e) {
        lastError = `${model}: ${e.message}`;
        break;
      }

      if (res.ok) {
        const data = await res.json();
        const text = (data?.candidates?.[0]?.content?.parts || [])
          .map((p) => p.text || "")
          .join("")
          .trim();
        if (text) return text;
        lastError = `${model}: empty response`;
        break;
      }

      const errText = await res.text();
      let msg = errText;
      try {
        msg = JSON.parse(errText)?.error?.message || errText;
      } catch {}
      lastError = `${model} (${res.status}): ${msg}`.slice(0, 300);
      console.error("Gemini error", lastError);

      if (res.status === 429) {
        throw new GeminiError(
          "Сұраныс көп, бір минуттан кейін қайталаңыз / Слишком много запросов, повторите через минуту",
          429
        );
      }
      if (/API key not valid|API_KEY_INVALID/i.test(msg)) {
        throw new GeminiError("Gemini кілті жарамсыз / Ключ Gemini недействителен — проверьте GEMINI_API_KEY в Vercel");
      }
      // Схемаға қатысты 400 болса ғана схемасыз қайталаймыз; әйтпесе — келесі модель
      if (!(res.status === 400 && /schema|response_?schema|enum/i.test(msg))) break;
    }
  }

  throw new GeminiError(`ЖИ жауап бермеді / ИИ не ответил — ${lastError}`);
}

export const LANG_NAMES = { kk: "қазақ тілінде (Kazakh)", ru: "на русском языке (Russian)" };
