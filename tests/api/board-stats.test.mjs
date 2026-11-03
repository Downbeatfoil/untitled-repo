import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

test("GET /api/board-stats returns valid BoardStats schema", async () => {
  const res = await fetch(`${BASE_URL}/api/board-stats`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();

  assert.ok(data && typeof data === "object", "Expected object response");
  assert.equal(typeof data.posts, "number", "posts must be number");
  assert.equal(typeof data.commits, "number", "commits must be number");
  assert.ok(Array.isArray(data.lanes), "lanes must be array");
  assert.ok(Array.isArray(data.recent), "recent must be array");

  for (const lane of data.lanes) {
    assert.equal(typeof lane.lane, "string");
    assert.equal(typeof lane.posts, "number");
    assert.equal(typeof lane.commits, "number");
  }

  for (const item of data.recent) {
    assert.equal(typeof item.lane, "string");
    assert.equal(typeof item.type, "string");
    assert.equal(typeof item.message, "string");
    assert.equal(typeof item.at, "string");
  }
});
