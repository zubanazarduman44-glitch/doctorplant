// PlantVision: өсімдік тұрған ортаны суреттен бағалау
// PlantVision: оценка условий, где стоит растение, по фото
import { callGemini, GeminiError, LANG_NAMES } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    plant_seen: { type: "STRING", description: "Plant visible in the photo (common name), or empty" },
    score: { type: "INTEGER", description: "0-100, how suitable the spot is for this plant" },
    light_level: { type: "STRING", enum: ["dark", "low", "medium", "bright", "direct_sun"] },
    light_ok: { type: "BOOLEAN" },
    light_note: { type: "STRING" },
    window_close: { type: "STRING", enum: ["too_close", "ok", "too_far", "unknown"] },
    window_note: { type: "STRING" },
    leaf_changes: { type: "BOOLEAN" },
    leaf_note: { type: "STRING" },
    risks: { type: "ARRAY", items: { type: "STRING" }, description: "Visible risks: heater/radiator, AC or draft, cold glass, direct midday sun, crowding, small pot, no drainage" },
    tips: { type: "ARRAY", items: { type: "STRING" } },
    summary: { type: "STRING" },
  },
  required: ["score", "light_level", "light_ok", "window_close", "leaf_changes", "summary", "tips"],
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { image, lang = "kk", plant, light } = body || {};
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return Response.json({ error: "Сурет табылмады / Фото не найдено" }, { status: 400 });
  }
  const [meta, base64] = image.split(",");
  if (!base64 || base64.length > 6_000_000) return Response.json({ error: "Сурет тым үлкен / Фото слишком большое" }, { status: 413 });

  const s = (x, n = 80) => String(x ?? "").replace(/[\n\r]+/g, " ").slice(0, n);
  const lines = [];
  if (plant?.name) lines.push(`The owner says this is: ${s(plant.name, 40)}${plant.latin ? ` (${s(plant.latin, 60)})` : ""}.`);
  if (plant?.lightNeed) lines.push(`Known light need of this species: ${["", "shade / low light", "bright indirect light", "full sun"][plant.lightNeed] || "?"}.`);
  if (light?.level) lines.push(`Phone camera light meter (approximate, auto-exposure may affect it): ${s(light.level, 20)}, relative brightness ${Number(light.value) || 0}/100.`);

  const prompt = `You are a plant care expert. The photo shows where a plant stands (room, windowsill, balcony or garden).
Evaluate the ENVIRONMENT for this plant. Answer ONLY ${LANG_NAMES[lang] || LANG_NAMES.ru}; Latin names may stay Latin.
${lines.join("\n")}
Judge from visible clues: window position and orientation hints, sunlight patches and shadows, distance to the glass, curtains, radiators/heaters, air conditioners, other plants, pot size and drainage, and the condition of the leaves (yellowing, brown tips, stretching toward light, sunburn, leaning).
- light_ok: is the light right for THIS plant's needs (not just bright).
- window_close: too_close if leaves touch cold glass or burn in direct sun; too_far if the plant is deep in the room for a light-loving species.
- leaf_changes: true only if you SEE changes; describe them briefly in leaf_note.
- tips: 2-4 short, concrete actions (e.g. "move 1 m from the window", "add a sheer curtain", "rotate the pot weekly").
- If the photo is unclear, say what to retake in summary and lower the score.
Keep every text field to one short sentence.`;

  try {
    const text = await callGemini(
      [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: meta.slice(5, meta.indexOf(";")), data: base64 } }] }],
      { schema: SCHEMA, thinking: "minimal", mediaResolution: "MEDIA_RESOLUTION_MEDIUM", maxTokens: 1500 }
    );
    const r = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    r.score = Math.max(0, Math.min(100, Math.round(Number(r.score) || 0)));
    r.tips = (Array.isArray(r.tips) ? r.tips : []).slice(0, 4).map((x) => s(x, 160));
    r.risks = (Array.isArray(r.risks) ? r.risks : []).slice(0, 4).map((x) => s(x, 120));
    return Response.json(r);
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 502;
    return Response.json({ error: e.message }, { status });
  }
}
