// Supabase-ке сақтау (REST арқылы, қосымша кітапхана керек емес).
// Сохранение в Supabase (через REST, без доп. библиотек).
// SUPABASE_URL және SUPABASE_SERVICE_ROLE_KEY бапталмаса — ештеңе сақталмайды, сайт бәрібір жұмыс істейді.

const TABLE = "plant_diagnoses";

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function saveDiagnosis({ lang, clientId, result }) {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...headers(cfg.key), Prefer: "return=representation" },
      body: JSON.stringify({
        lang,
        client_id: clientId || null,
        plant_name: result.plant_name || null,
        latin_name: result.latin_name || null,
        health_status: result.health_status || null,
        diagnosis: result.diagnosis || null,
        confidence: Number.isFinite(result.confidence) ? result.confidence : null,
        result,
      }),
    });
    if (!res.ok) {
      console.error("Supabase insert error", res.status, await res.text());
      return null;
    }
    const rows = await res.json();
    return rows?.[0]?.id || null;
  } catch (e) {
    console.error("Supabase insert failed", e.message);
    return null;
  }
}

export async function saveFeedback({ id, feedback, comment }) {
  const cfg = config();
  if (!cfg) return false;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: headers(cfg.key),
      body: JSON.stringify({ feedback, feedback_comment: comment || null, feedback_at: new Date().toISOString() }),
    });
    if (!res.ok) console.error("Supabase feedback error", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Supabase feedback failed", e.message);
    return false;
  }
}

export async function countChatMessage(id) {
  const cfg = config();
  if (!cfg || !id) return;
  try {
    await fetch(`${cfg.url}/rest/v1/rpc/plant_increment_chat`, {
      method: "POST",
      headers: headers(cfg.key),
      body: JSON.stringify({ diag_id: id }),
    });
  } catch {}
}
