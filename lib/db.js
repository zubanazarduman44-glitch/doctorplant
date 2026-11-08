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
  const h = { apikey: key, "Content-Type": "application/json" };
  // Ескі JWT кілттері (eyJ...) Authorization-ға да керек; жаңа sb_secret_... кілттері — тек apikey
  if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`;
  return h;
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

/* ───────── Өсімдіктер картасы / Карта растений ───────── */
const OBS = "plant_observations";

export function dbConfigured() {
  return Boolean(config());
}

export async function listObservations({ lat, lon, r = 0.25, limit = 500 }) {
  const cfg = config();
  if (!cfg) return { configured: false, items: [] };
  const since = new Date(Date.now() - 365 * 86_400_000).toISOString();
  const q = new URLSearchParams();
  q.append("select", "id,created_at,lat,lon,plant_name,latin_name,health_status,diagnosis,protected");
  q.append("lat", `gte.${(lat - r).toFixed(5)}`);
  q.append("lat", `lte.${(lat + r).toFixed(5)}`);
  q.append("lon", `gte.${(lon - r * 1.6).toFixed(5)}`);
  q.append("lon", `lte.${(lon + r * 1.6).toFixed(5)}`);
  q.append("created_at", `gte.${since}`);
  q.append("order", "created_at.desc");
  q.append("limit", String(limit));
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${OBS}?${q}`, { headers: headers(cfg.key), cache: "no-store" });
    if (!res.ok) {
      console.error("Supabase obs list error", res.status, await res.text());
      return { configured: true, items: [] };
    }
    return { configured: true, items: await res.json() };
  } catch (e) {
    console.error("Supabase obs list failed", e.message);
    return { configured: true, items: [] };
  }
}

export async function countRecentObservations(clientId) {
  const cfg = config();
  if (!cfg || !clientId) return 0;
  const since = new Date(Date.now() - 86_400_000).toISOString();
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/${OBS}?select=id&client_id=eq.${encodeURIComponent(clientId)}&created_at=gte.${since}`,
      { headers: { ...headers(cfg.key), Prefer: "count=exact", Range: "0-0" } }
    );
    const range = res.headers.get("content-range") || "";
    return parseInt(range.split("/")[1] || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export async function addObservation(row) {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${OBS}`, {
      method: "POST",
      headers: { ...headers(cfg.key), Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.error("Supabase obs insert error", res.status, await res.text());
      return null;
    }
    return (await res.json())?.[0] || null;
  } catch (e) {
    console.error("Supabase obs insert failed", e.message);
    return null;
  }
}

// Пайдаланушы тек өзі қойған белгіні өшіре алады (client_id сәйкес болса)
export async function deleteObservation(id, clientId) {
  const cfg = config();
  if (!cfg || !id || !clientId) return 0;
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/${OBS}?id=eq.${encodeURIComponent(id)}&client_id=eq.${encodeURIComponent(clientId)}`,
      { method: "DELETE", headers: { ...headers(cfg.key), Prefer: "return=representation" } }
    );
    if (!res.ok) {
      console.error("Supabase obs delete error", res.status, await res.text());
      return -1;
    }
    return ((await res.json()) || []).length;
  } catch (e) {
    console.error("Supabase obs delete failed", e.message);
    return -1;
  }
}
