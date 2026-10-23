import type { Config, Context } from "@netlify/functions";
import { reflectionRequestSchema, feedbackSchema } from "../../shared/contracts.js";
import { needsImmediateHelp } from "../../shared/safety.js";
import { failure, json, readBody, reserveInference } from "../lib/guard.js";
import { infer } from "../lib/inference.js";

export default async (req: Request, context: Context) => {
  try {
    const body = await readBody(req, reflectionRequestSchema);
    if (needsImmediateHelp(`${body.reflectionText} ${body.dareTitle} ${body.emotionalFeeling || ""}`)) return json({ source: "crisis" });
    await reserveInference(context);
    const feedback = await infer('Tanggapi refleksi tanpa menganggap tantangan sudah selesai atau memberi klaim klinis pasti. JSON: {"validation":"validasi emosi","therapeuticInsight":"wawasan self-care sederhana","affirmation":"afirmasi lembut","nextGentleStep":"saran ringan opsional"}.', body, feedbackSchema);
    return json({ feedback, source: "ai" });
  } catch (error) { return failure(error); }
};
export const config: Config = { path: "/api/reflect-dare" };
