// 👍/👎 пікірін сақтау / Сохранение отзыва 👍/👎
import { saveFeedback } from "../../../lib/db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { id, feedback, comment } = body || {};
  if (!id || !UUID.test(id) || !["up", "down"].includes(feedback)) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const ok = await saveFeedback({
    id,
    feedback,
    comment: typeof comment === "string" ? comment.slice(0, 500) : null,
  });
  return Response.json({ ok });
}
