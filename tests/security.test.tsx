import { test } from "node:test";
import assert from "node:assert/strict";
import type { Context } from "@netlify/functions";
import { answersSchema, coachRequestSchema, daresSchema, feedbackSchema } from "../shared/contracts";
import { needsImmediateHelp } from "../shared/safety";
import { readBody, HttpError, failure } from "../netlify/lib/guard";
import coach from "../netlify/functions/mental-coach.mts";
import generate from "../netlify/functions/generate-dares.mts";
import reflect from "../netlify/functions/reflect-dare.mts";
import { createDareList, fetchAiDares, fetchMentalCoach, fetchAiReflection, CrisisError } from "../src/dare-generator";

const answers = { focus: ["calm", "compassion"], courage: "gentle", energy: "quiet", setting: "solo", intention: "" } as const;
const input = { ...answers, focus: [...answers.focus] };
function request(body: unknown, headers = {}) {
  return new Request("https://example.com/api/mental-coach", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
}

test("rejects invalid, oversized, and cross-origin requests before inference", async () => {
  await assert.rejects(readBody(request({ userMessage: 42 }), coachRequestSchema), (e: HttpError) => e.status === 400);
  await assert.rejects(readBody(request({ userMessage: "x".repeat(2001) }), coachRequestSchema), (e: HttpError) => e.status === 400);
  await assert.rejects(readBody(request({ userMessage: "x".repeat(17000) }), coachRequestSchema), (e: HttpError) => e.status === 413);
  await assert.rejects(readBody(request({ userMessage: "hello" }, { Origin: "https://attacker.example" }), coachRequestSchema), (e: HttpError) => e.status === 403);
  await assert.rejects(readBody(new Request("https://example.com", { method: "GET" }), coachRequestSchema), (e: HttpError) => e.status === 405);
  await assert.rejects(readBody(new Request("https://example.com", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{broken" }), coachRequestSchema), (e: HttpError) => e.status === 400);
  assert.equal(answersSchema.safeParse({ ...input, focus: ["invalid"] }).success, false);
  assert.equal(failure(new Error("private upstream details")).status, 503);
  assert.equal(await failure(new Error("private upstream details")).text(), '{"error":"AI sementara tidak tersedia"}');
});

test("server crisis branches bypass database and provider in all endpoints", async () => {
  const ctx = {} as Context; // No database configuration or AI credentials required for safety.
  const results = await Promise.all([
    coach(request({ userMessage: "Aku ingin bunuh diri" }), ctx),
    generate(request({ ...input, intention: "I want to hurt myself" }), ctx),
    reflect(request({ dareTitle: "test", reflectionText: "Aku ingin mengakhiri hidup" }), ctx),
  ]);
  for (const result of results) {
    assert.equal(result.status, 200);
    assert.equal((await result.json()).source, "crisis");
    assert.equal(result.headers.get("Cache-Control"), "no-store");
    assert.equal(result.headers.get("Access-Control-Allow-Origin"), null);
  }
});

test("valid JSON with unsafe shapes and duplicate IDs fails schema checks", () => {
  const valid = { id: "ai-1", title: "Pause", focus: "calm", note: "Rest" };
  assert.equal(daresSchema.safeParse([{ ...valid, title: { object: true } }]).success, false);
  assert.equal(daresSchema.safeParse([valid, valid]).success, false);
  assert.equal(daresSchema.safeParse([{ ...valid, focus: "not-a-focus" }]).success, false);
  assert.equal(feedbackSchema.safeParse({ validation: {} }).success, false);
});

test("fallback always respects courage, energy and solo constraints", () => {
  for (let i = 0; i < 100; i++) {
    const dares = createDareList(input);
    assert.ok(dares.length);
    assert.ok(dares.every(d => ["calm-1", "calm-2", "comp-1"].includes(d.id)));
  }
  assert.equal(createDareList({ ...input, focus: ["connection"], setting: "together", courage: "gentle" }).length, 0);
});

test("client handles invalid output, offline provenance, and crisis without a network", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => { calls++; return Response.json({ dares: [{ id: "ai-1", title: { unexpected: true } }], response: { empathy: {} }, feedback: {} }); };
    assert.equal((await fetchAiDares(input)).source, "fallback");
    assert.equal((await fetchMentalCoach("Feeling tired")).source, "fallback");
    assert.equal((await fetchAiReflection({ dareTitle: "Pause", reflectionText: "I tried" })).source, "fallback");
    calls = 0;
    await assert.rejects(fetchMentalCoach("I want to kill myself"), CrisisError);
    await assert.rejects(fetchAiDares({ ...input, intention: "Aku mau mati" }), CrisisError);
    await assert.rejects(fetchAiReflection({ dareTitle: "Pause", reflectionText: "Aku ingin menyakiti diri" }), CrisisError);
    assert.equal(calls, 0);
    globalThis.fetch = async () => { throw new Error("offline"); };
    const result = await fetchMentalCoach("Not sure what to do");
    assert.equal(result.source, "fallback");
    assert.equal(result.response.recommendedDare, undefined);
    assert.equal(needsImmediateHelp("I'm in immediate danger"), true);
  } finally { globalThis.fetch = original; }
});
