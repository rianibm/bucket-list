import type { Context } from "@netlify/functions";
import { createHash } from "node:crypto";
import { drizzle } from "drizzle-orm/netlify-db";
import { lt, sql } from "drizzle-orm";
import { z } from "zod";
import { aiQuotas } from "../../db/schema.js";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
}
export async function readBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
  const origin = req.headers.get("Origin");
  if ((origin && origin !== new URL(req.url).origin) || req.headers.get("Sec-Fetch-Site") === "cross-site") {
    throw new HttpError(403, "Origin not allowed");
  }
  if (!req.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) throw new HttpError(415, "Expected JSON");
  // Count actual streamed bytes, including requests without Content-Length.
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "Missing request body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) { await reader.cancel(); throw new HttpError(413, "Request too large"); }
    chunks.push(value);
  }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "Invalid JSON"); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "Invalid request fields");
  return parsed.data;
}
export async function reserveInference(context: Context) {
  if (!context.ip) throw new HttpError(503, "AI temporarily unavailable");
  const now = Date.now();
  const day = Math.floor(now / 86400000);
  const minute = Math.floor(now / 60000);
  const visitor = createHash("sha256").update(`${context.site.id}:${day}:${context.ip}`).digest("hex");
  const db = drizzle();
  await db.transaction(async tx => {
    await tx.delete(aiQuotas).where(lt(aiQuotas.expiresAt, new Date(now)));
    // Atomic conditional increments, shared across all three endpoints and instances.
    // Throwing rolls back every reservation, including under concurrent requests.
    for (const [key, limit, expires] of [
      [`minute:${visitor}:${minute}`, 5, (minute + 2) * 60000],
      [`visitor:${visitor}:${day}`, 20, (day + 1) * 86400000],
      [`site:${day}`, 200, (day + 1) * 86400000],
    ] as const) {
      const rows = await tx.insert(aiQuotas).values({ key, count: 1, expiresAt: new Date(expires) })
        .onConflictDoUpdate({ target: aiQuotas.key, set: { count: sql`${aiQuotas.count} + 1` }, setWhere: lt(aiQuotas.count, limit) })
        .returning({ key: aiQuotas.key });
      if (!rows.length) throw new HttpError(429, "Batas penggunaan AI tercapai. Coba lagi nanti; dukungan dasar tetap tersedia.");
    }
  });
}
export function failure(error: unknown): Response {
  // Never log provider errors or user disclosures, or return their contents.
  return error instanceof HttpError ? json({ error: error.message }, error.status) : json({ error: "AI sementara tidak tersedia" }, 503);
}
