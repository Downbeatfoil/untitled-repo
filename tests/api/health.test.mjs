import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

test("GET /api/health returns ok:true and grokConfigured boolean", async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert.equal(data.ok, true, "health ok should be true");
  assert.equal(typeof data.grokConfigured, "boolean", "grokConfigured should be boolean");
  if (data.provider !== undefined) {
    assert.ok(["grok", "gemini", "none"].includes(data.provider), `Invalid provider: ${data.provider}`);
  }
});
