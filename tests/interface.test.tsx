import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import App from "../src/App";

test("legacy disclosures are removed, footer breathing advances, and clear resets session data", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://example.com" });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.setItem("little-yes-personalized-v2", JSON.stringify({ dares: [{ title: { malformed: true } }], reflections: { private: "old disclosure" } }));
  const root = createRoot(document.getElementById("root")!);
  await act(async () => { root.render(<App />); });
  assert.equal(localStorage.getItem("little-yes-personalized-v2"), null);
  assert.ok(document.body.textContent?.includes("Hapus semua data pribadi"));
  const footerBreathing = [...document.querySelectorAll("footer button")].find(b => b.textContent === "Latihan Napas")!;
  await act(async () => { (footerBreathing as HTMLButtonElement).click(); });
  assert.equal(document.querySelector(".phase-timer")?.textContent, "4s");
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1100)); });
  assert.equal(document.querySelector(".phase-timer")?.textContent, "3s");
  const clear = [...document.querySelectorAll("button")].find(b => b.textContent === "Hapus semua data pribadi")!;
  await act(async () => { (clear as HTMLButtonElement).click(); });
  assert.equal(document.querySelector(".modal-breathing"), null);
  assert.equal(localStorage.length, 0);
  await act(async () => { (footerBreathing as HTMLButtonElement).click(); });
  assert.equal(document.querySelector(".phase-timer")?.textContent, "4s");
  await act(async () => { (clear as HTMLButtonElement).click(); });
  const originalFetch = globalThis.fetch;
  let finish!: (value: Response) => void;
  globalThis.fetch = () => new Promise<Response>(resolve => { finish = resolve; });
  try {
    const openCoach = [...document.querySelectorAll("footer button")].find(b => b.textContent === "Ruang Teduh AI")!;
    await act(async () => { (openCoach as HTMLButtonElement).click(); });
    await act(async () => { (document.querySelector(".topic-chip") as HTMLButtonElement).click(); });
    await act(async () => { (clear as HTMLButtonElement).click(); });
    await act(async () => { finish(Response.json({ response: { empathy: "Stale private response" }, source: "ai" })); });
    await act(async () => { (openCoach as HTMLButtonElement).click(); });
    assert.equal(document.querySelector(".coach-response-box"), null);
    assert.ok(!document.body.textContent?.includes("Stale private response"));
  } finally { globalThis.fetch = originalFetch; }
  await act(async () => { root.unmount(); });
  dom.window.close();
});
