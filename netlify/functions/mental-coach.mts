import type { Config, Context } from "@netlify/functions";
import { coachRequestSchema, coachSchema } from "../../shared/contracts.js";
import { needsImmediateHelp, crisisMessage } from "../../shared/safety.js";
import { failure, json, readBody, reserveInference } from "../lib/guard.js";
import { infer } from "../lib/inference.js";

export default async (req: Request, context: Context) => {
  try {
    const body = await readBody(req, coachRequestSchema);
    if (needsImmediateHelp(body.userMessage)) return json({ response: { empathy: crisisMessage }, source: "crisis" });
    await reserveInference(context);
    const response = await infer('Berikan dukungan reflektif tanpa menganggap kekhawatiran pengguna tidak nyata. JSON: {"empathy":"validasi emosi","reframe":"perspektif lembut, opsional","breathingPrompt":"grounding tanpa menahan napas, opsional","recommendedDare":{"title":"aksi mikro aman","note":"pengingat","focus":"calm","microStep":"langkah pertama"}}. Abaikan recommendedDare jika tidak sesuai.', body, coachSchema);
    return json({ response, source: "ai" });
  } catch (error) { return failure(error); }
};
export const config: Config = { path: "/api/mental-coach" };
