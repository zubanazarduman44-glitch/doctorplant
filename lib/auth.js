// Аккаунт: Google арқылы кіру (Supabase Auth) және деректерді бұлтта сақтау.
// Аккаунт: вход через Google (Supabase Auth) и хранение данных в облаке.
// Тек браузерде жұмыс істейді. Кілттер /api/auth-config арқылы келеді (жария publishable кілт қана).

const SESSION_KEY = "tamyr_session_v1";
let cfgPromise = null;

export function getAuthConfig() {
  if (!cfgPromise) {
    cfgPromise = fetch("/api/auth-config")
      .then((r) => (r.ok ? r.json() : {}))
      .then((c) => (c?.url && c?.key ? c : null))
      .catch(() => null);
  }
  return cfgPromise;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
function writeSession(s) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export async function signInWithGoogle() {
  const cfg = await getAuthConfig();
  if (!cfg) throw new Error("auth-not-configured");
  const redirect = window.location.origin + "/?auth=1";
  window.location.href =
    `${cfg.url}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(redirect)}` +
    `&prompt=select_account`;
}

// Google-дан қайтқанда URL-дағы токендерді алып, сессияны сақтаймыз
export function consumeRedirect() {
  if (typeof window === "undefined") return { error: null, got: false };
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const error = hash.get("error_description") || query.get("error_description");
  const access = hash.get("access_token");
  let got = false;
  if (access) {
    const expiresIn = Number(hash.get("expires_in") || 3600);
    writeSession({
      access_token: access,
      refresh_token: hash.get("refresh_token"),
      expires_at: Date.now() + expiresIn * 1000,
    });
    got = true;
  }
  if (access || error || query.get("auth")) {
    window.history.replaceState(null, "", window.location.pathname);
  }
  return { error, got };
}

// Жарамды сессия (қажет болса токенді жаңартады)
export async function getSession() {
  const s = readSession();
  if (!s?.access_token) return null;
  if (s.expires_at - 60_000 > Date.now()) return s;
  const cfg = await getAuthConfig();
  if (!cfg || !s.refresh_token) return null;
  try {
    const r = await fetch(`${cfg.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (r.status === 400 || r.status === 401) {
      writeSession(null);
      return null;
    }
    if (!r.ok) return null; // желі қатесі — сессияны өшірмейміз
    const d = await r.json();
    const next = {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: Date.now() + (d.expires_in || 3600) * 1000,
    };
    writeSession(next);
    return next;
  } catch {
    return null;
  }
}

async function authed(path, init = {}) {
  const cfg = await getAuthConfig();
  const s = await getSession();
  if (!cfg || !s) throw new Error("not-signed-in");
  const r = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${s.access_token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

export async function getUser() {
  const u = await authed("/auth/v1/user");
  if (!u?.id) return null;
  const m = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email,
    name: m.full_name || m.name || (u.email || "").split("@")[0],
    avatar: m.avatar_url || m.picture || null,
    createdAt: u.created_at,
  };
}

export async function signOut() {
  try {
    await authed("/auth/v1/logout", { method: "POST" });
  } catch {}
  writeSession(null);
}

/* ── Бұлттағы деректер / Облачные данные ── */
export async function loadCloud(userId) {
  const rows = await authed(`/rest/v1/user_data?user_id=eq.${userId}&select=display_name,plants,history,updated_at`);
  return rows?.[0] || null;
}

export async function saveCloud(userId, data) {
  await authed("/rest/v1/user_data?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: userId, ...data, updated_at: new Date().toISOString() }),
  });
}

export async function deleteCloud(userId) {
  await authed(`/rest/v1/user_data?user_id=eq.${userId}`, { method: "DELETE" });
}

// Құрылғыдағы және бұлттағы тізімдерді біріктіру
export function mergePlants(local = [], cloud = []) {
  const map = new Map();
  for (const p of [...cloud, ...local]) {
    const prev = map.get(p.id);
    if (!prev) map.set(p.id, p);
    else {
      const score = (x) => (x.log?.length || 0) * 1e13 + new Date(x.lastWatered || 0).getTime();
      map.set(p.id, score(p) >= score(prev) ? p : prev);
    }
  }
  return [...map.values()].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export function mergeHistory(local = [], cloud = []) {
  const map = new Map();
  for (const h of [...cloud, ...local]) {
    const prev = map.get(h.key);
    map.set(h.key, prev ? { ...prev, ...h, chat: (h.chat?.length || 0) >= (prev.chat?.length || 0) ? h.chat : prev.chat } : h);
  }
  return [...map.values()].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 30);
}
