import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

test("GET /api/courses responds in under 500ms", async () => {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}/api/courses`);
  const duration = performance.now() - start;
  assert.equal(res.status, 200);
  assert.ok(duration < 500, `Expected < 500ms, took ${duration.toFixed(1)}ms`);
});

test("GET /api/packs/cs-1332 responds in under 500ms", async () => {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}/api/packs/cs-1332`);
  const duration = performance.now() - start;
  assert.equal(res.status, 200);
  assert.ok(duration < 500, `Expected < 500ms, took ${duration.toFixed(1)}ms`);
});

test("POST /api/exam responds in under 15s", { timeout: 20000 }, async () => {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}/api/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode: "CS 1332", count: 6 }),
  });
  const duration = performance.now() - start;
  assert.equal(res.status, 200);
  assert.ok(duration < 15000, `Expected < 15000ms, took ${duration.toFixed(1)}ms`);
});
