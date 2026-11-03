import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

test("GET /api/warm pre-warms CS 1332 and MATH 1554 into cache", async () => {
  const res = await fetch(`${BASE_URL}/api/warm`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(Array.isArray(data.warmed), "warmed must be array");
  assert.ok(data.warmed.includes("CS 1332"), "CS 1332 should be warmed");
  assert.ok(data.warmed.includes("MATH 1554"), "MATH 1554 should be warmed");
  assert.equal(typeof data.totalCached, "number");
});
