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

// Бір модельге қанша уақыт күтеміз, және барлығына жалпы уақыт (Vercel лимиті 60 с)
const PER_CALL_MS = 25_000;
const TOTAL_MS = 52_000;

// Чат үшін — жылдам/жеңіл модельдер алдымен
const FAST_MODELS = [
  process.env.GEMINI_FAST_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  ...MODELS.filter((m) => m !== process.env.GEMINI_MODEL),
].filter(Boolean);

// Жұмыс істеген модельді есте сақтаймыз (диагноз және чат үшін бөлек)
const preferred = { full: null, fast: null };
// Лимиті біткен модельдерді біраз уақыт айналып өтеміз
const coolDown = new Map(); // model -> уақыт (ms) дейін

// Кілтке қолжетімді модельдерді өзі табады (1 сағатқа есте сақтайды)
let discovered = { at: 0, list: [] };
async function discoverModels(apiKey) {
  if (Date.now() - discovered.at < 3_600_000) return discovered.list;
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
      headers: { "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(4_000),
    });
    if (r.ok) {
      const d = await r.json();
      const list = (d.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map((m) => String(m.name || "").replace(/^models\//, ""))
        .filter((n) => /flash/.test(n) && !/(image|tts|audio|live|embed|preview-0[0-9]|exp)/.test(n));
      discovered = { at: Date.now(), list };
    } else discovered = { at: Date.now() - 3_000_000, list: [] };
  } catch {
    discovered = { at: Date.now() - 3_000_000, list: [] };
  }
  return discovered.list;
}

export class GeminiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

// «Ойлану» уақытын азайтамыз — жауап жылдамырақ келеді
function thinkingFor(model, level = "low") {
  if (/2\.5/.test(model)) return { thinkingBudget: /lite/.test(model) || level === "minimal" ? 0 : 512 };
  return { thinkingLevel: level };
}

/**
 * contents — Gemini форматындағы хабарламалар
 * opts.schema — JSON схемасы (болса, жауап JSON болады)
 * opts.system — жүйелік нұсқаулық
 * Жауап: мәтін (string)
 */
export async function callGemini(
  contents,
  { schema, json = false, system, temperature = 0.2, fast = false, thinking = "low", mediaResolution, maxTokens } = {}
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("Серверде GEMINI_API_KEY бапталмаған / На сервере не настроен GEMINI_API_KEY", 500);
  }

  const started = Date.now();
  const kind = fast ? "fast" : "full";
  // Белгілі модельдер + кілтке қолжетімді басқа flash модельдер (лимит біткенде ауысу үшін)
  const extra = await discoverModels(apiKey);
  const lite = extra.filter((m) => /lite/.test(m));
  const full = extra.filter((m) => !/lite/.test(m));
  const base = [...new Set([...(fast ? FAST_MODELS : MODELS), ...(fast ? [...lite, ...full] : [...full, ...lite])])].slice(0, 9);
  const pref = preferred[kind];
  const now = Date.now();
  let order = pref ? [pref, ...base.filter((m) => m !== pref)] : base;
  // Лимиті жуырда біткен модельдерді соңына жылжытамыз
  order = [...order.filter((m) => !(coolDown.get(m) > now)), ...order.filter((m) => coolDown.get(m) > now)];
  let lastError = "";
  let allLimited = true;
  let anyLimited = false;
  let dailyHit = false;

  for (const model of order) {
    let useSchema = Boolean(schema);
    let useThinking = true;
    let useMedia = Boolean(mediaResolution);
    let level = thinking;

    // Бір модельге ең көбі 3 әрекет: қате параметрді алып тастап қайталаймыз
    for (let attempt = 0; attempt < 3; attempt++) {
      const left = TOTAL_MS - (Date.now() - started);
      if (left < 3_000) {
        throw new GeminiError(
          `ЖИ тым ұзақ ойланды, қайталап көріңіз / ИИ думал слишком долго, попробуйте ещё раз — ${lastError}`,
          504
        );
      }

      const generationConfig = { temperature };
      if (schema || json) generationConfig.responseMimeType = "application/json";
      if (useSchema) generationConfig.responseSchema = schema;
      if (useThinking) generationConfig.thinkingConfig = thinkingFor(model, level);
      // Суретті орташа сапада өңдеу — токен аз, жауап жылдам
      if (useMedia) generationConfig.mediaResolution = mediaResolution;
      if (maxTokens) generationConfig.maxOutputTokens = maxTokens;

      const body = { contents, generationConfig };
      if (system) body.systemInstruction = { parts: [{ text: system }] };

      const t0 = Date.now();
      let res;
      try {
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(Math.min(PER_CALL_MS, left - 2_000)),
          }
        );
      } catch (e) {
        lastError = `${model}: ${e.name === "TimeoutError" ? "timeout" : e.message}`;
        allLimited = false;
        console.error("Gemini fetch failed", lastError, `${Date.now() - t0}ms`);
        break; // келесі модель
      }

      if (res.ok) {
        const data = await res.json();
        const text = (data?.candidates?.[0]?.content?.parts || [])
          .filter((p) => !p.thought)
          .map((p) => p.text || "")
          .join("")
          .trim();
        console.log("Gemini ok", model, `${Date.now() - t0}ms`);
        if (text) {
          preferred[kind] = model;
          coolDown.delete(model);
          return text;
        }
        lastError = `${model}: empty response (${data?.candidates?.[0]?.finishReason || "?"})`;
        // Жауап лимитке жетіп кесілсе — сол модельмен лимитсіз қайталаймыз
        if (data?.candidates?.[0]?.finishReason === "MAX_TOKENS" && maxTokens) {
          maxTokens = undefined;
          continue;
        }
        break;
      }

      const errText = await res.text();
      let msg = errText;
      try {
        msg = JSON.parse(errText)?.error?.message || errText;
      } catch {}
      lastError = `${model} (${res.status}): ${msg}`.slice(0, 300);
      console.error("Gemini error", lastError);

      // Лимит бітті — бұл модельді 60 с айналып өтіп, келесі модельді көреміз (әр модельдің лимиті бөлек)
      if (res.status === 429) {
        anyLimited = true;
        if (/per.?day|daily|PerDay/i.test(msg)) dailyHit = true;
        // Күндік лимит біткен болса — бұл модельді ұзағырақ айналып өтеміз
        coolDown.set(model, Date.now() + (/per.?day|daily|PerDay/i.test(msg) ? 30 * 60_000 : 60_000));
        if (preferred[kind] === model) preferred[kind] = null;
        break;
      }
      // Модель жоқ/қолжетімсіз (404) — лимит сияқты есептеп, келесіге өтеміз
      if (res.status === 404 || /not found|not supported|is not available/i.test(msg)) {
        coolDown.set(model, Date.now() + 30 * 60_000);
        break;
      }
      allLimited = false;
      if (/API key not valid|API_KEY_INVALID/i.test(msg)) {
        throw new GeminiError("Gemini кілті жарамсыз / Ключ Gemini недействителен — проверьте GEMINI_API_KEY в Vercel");
      }
      if (res.status === 400 && useMedia && /media.?resolution/i.test(msg)) {
        useMedia = false;
        continue;
      }
      if (res.status === 400 && useThinking && /think/i.test(msg)) {
        // «minimal» қолдамаса — «low»-ға, ол да болмаса — ойлануды өшіреміз
        if (level === "minimal") level = "low";
        else useThinking = false;
        continue;
      }
      if (res.status === 400 && useSchema && /schema|enum/i.test(msg)) {
        useSchema = false;
        continue;
      }
      break; // басқа қате — келесі модель
    }
    if (preferred[kind] === model) preferred[kind] = null;
  }

  if (allLimited || (anyLimited && /429|quota/i.test(lastError))) {
    throw new GeminiError(
      dailyHit
        ? "Google Gemini тегін күндік лимиті бітті — ол күн сайын шамамен 13:00-де (Қазақстан уақыты) жаңарады / Дневной бесплатный лимит Google Gemini исчерпан — обновляется ежедневно около 13:00 по времени Казахстана"
        : "Google Gemini тегін лимиті уақытша бітті — 1 минуттан кейін қайталаңыз / Бесплатный лимит Google Gemini временно исчерпан — повторите через минуту",
      429
    );
  }
  throw new GeminiError(`ЖИ жауап бермеді / ИИ не ответил — ${lastError}`);
}

export const LANG_NAMES = { kk: "қазақ тілінде (Kazakh)", ru: "на русском языке (Russian)" };
