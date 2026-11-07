// Браузерге тек жария мәліметтер: Supabase мекенжайы және publishable (жария) кілт.
// Service-role кілт ЕШҚАШАН мұнда берілмейді.
export const dynamic = "force-dynamic";

// Қате жасырын кілт қойылса — браузерге бермейміз
function isSecret(key) {
  if (key.startsWith("sb_secret_")) return true;
  if (key.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString());
      return payload.role !== "anon";
    } catch {
      return true;
    }
  }
  return false;
}

export function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || isSecret(key)) {
    return Response.json({ url: null, key: null });
  }
  return Response.json({ url: url.replace(/\/$/, ""), key });
}
