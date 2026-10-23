import type { Config, Context } from "@netlify/functions";
import { answersSchema, daresSchema } from "../../shared/contracts.js";
import { needsImmediateHelp } from "../../shared/safety.js";
import { failure, json, readBody, reserveInference } from "../lib/guard.js";
import { infer } from "../lib/inference.js";

export default async (req: Request, context: Context) => {
  try {
    const body = await readBody(req, answersSchema);
    if (needsImmediateHelp(body.intention)) return json({ source: "crisis" });
    await reserveInference(context);
    const dares = await infer('Buat 6 tantangan mikro yang sesuai fokus, batas keberanian, energi, dan preferensi ruang pengguna. gentle: tanpa tekanan; quiet: hemat energi. JSON array: [{"id":"ai-1","title":"aksi singkat","focus":"salah satu fokus yang dipilih pengguna","note":"pengingat hangat","whyHelpMentalHealth":"alasan sederhana tanpa klaim ilmiah pasti","microStep":"langkah kurang dari 2 menit","mindfulTip":"grounding opsional"}]. Gunakan ID unik.', body, daresSchema);
    return json({ dares: dares.map(d => ({ ...d, isAiGenerated: true })), source: "ai" });
  } catch (error) { return failure(error); }
};
export const config: Config = { path: "/api/generate-dares" };
