// Өсімдіктер картасы: белгілерді оқу және қосу
// Карта растений: чтение и добавление отметок
import { listObservations, addObservation, countRecentObservations } from "../../../lib/db";

export const runtime = "nodejs";

// Қызыл кітаптағы түрлер — орны дөрекірек жасырылады (браконьерлерден қорғау)
const PROTECTED = [/^tulipa\b/i, /^malus sieversii/i, /^crocus\b/i, /^paeonia\b/i, /^iris\b/i];
const STATUSES = ["healthy", "needs_attention", "sick", "unknown"];
const DAILY_LIMIT = 30;

// Орынды дөңгелектеу: қалыпты ~500 м, қорғалатын түр ~5 км
function blur(v, step) {
  return Math.round(v / step) * step;
}
const clean = (x, n) => (typeof x === "string" ? x.trim().slice(0, n) : "");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lon = parseFloat(searchParams.get("lon"));
  const r = Math.min(1, Math.max(0.02, parseFloat(searchParams.get("r")) || 0.25));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const data = await listObservations({ lat, lon, r });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);
  const name = clean(body?.plant_name, 80);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !name) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const clientId = clean(body?.clientId, 64) || null;
  if (clientId && (await countRecentObservations(clientId)) >= DAILY_LIMIT) {
    return Response.json({ error: "Бүгінгі лимит бітті / Дневной лимит исчерпан" }, { status: 429 });
  }

  const latin = clean(body?.latin_name, 80);
  const isProtected = Boolean(body?.red_book) || PROTECTED.some((re) => re.test(latin));
  const step = isProtected ? 0.05 : 0.005;

  const row = await addObservation({
    client_id: clientId,
    lat: +blur(lat, step).toFixed(5),
    lon: +blur(lon, step).toFixed(5),
    plant_name: name,
    latin_name: latin || null,
    health_status: STATUSES.includes(body?.health_status) ? body.health_status : "unknown",
    diagnosis: clean(body?.diagnosis, 160) || null,
    protected: isProtected,
    lang: ["kk", "ru", "en"].includes(body?.lang) ? body.lang : "ru",
  });
  if (!row) {
    return Response.json(
      { error: "Картаға сақтау мүмкін болмады (база бапталмаған?) / Не удалось сохранить на карту" },
      { status: 503 }
    );
  }
  return Response.json({ ok: true, item: row });
}
