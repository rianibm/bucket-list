import { z } from "zod";

export const focusSchema = z.enum(["calm", "compassion", "boundaries", "connection", "confidence", "burnout", "creative", "career"]);
const text = z.string().trim().min(1).max(2000);
export const answersSchema = z.object({
  focus: z.array(focusSchema).min(1).max(3),
  courage: z.enum(["gentle", "stretch", "bold"]),
  energy: z.enum(["quiet", "some", "open"]),
  setting: z.enum(["solo", "together", "either"]),
  intention: z.string().trim().max(1000).default(""),
  emotionalState: z.enum(["overwhelmed", "exhausted", "isolated", "self_critical", "ready_to_grow"]).default("overwhelmed"),
});
export const dareSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
  title: text, focus: focusSchema, note: text,
  whyHelpMentalHealth: text.optional(), microStep: text.optional(), mindfulTip: text.optional(),
  isAiGenerated: z.boolean().optional(),
});
export const daresSchema = z.array(dareSchema).min(1).max(8).refine(items => new Set(items.map(d => d.id)).size === items.length, "Duplicate IDs");
export const reflectionRequestSchema = z.object({
  dareTitle: text, dareFocus: focusSchema.optional(), reflectionText: text,
  emotionalFeeling: z.string().trim().min(1).max(100).optional(),
});
export const coachRequestSchema = z.object({
  userMessage: text,
  topic: z.enum(["overthinking", "boundary", "burnout", "imposter", "social_anxiety", "general"]).optional(),
});
export const feedbackSchema = z.object({
  validation: text, therapeuticInsight: text, affirmation: text, nextGentleStep: text.optional(),
});
export const coachSchema = z.object({
  empathy: text, reframe: text.optional(), breathingPrompt: text.optional(),
  recommendedDare: dareSchema.omit({ id: true, isAiGenerated: true }).optional(),
});
export type Feedback = z.infer<typeof feedbackSchema>;
export type CoachResponse = z.infer<typeof coachSchema>;
export type Source = "ai" | "fallback" | "crisis";
