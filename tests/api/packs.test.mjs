import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertCoursePack } from "./contract.mjs";

test("GET /api/packs/cs-1332 returns valid CoursePack", async () => {
  const res = await fetch(`${BASE_URL}/api/packs/cs-1332`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const pack = await res.json();
  assertCoursePack(pack, "pack");
  assert.equal(pack.course.code, "CS 1332");
  assert.equal(pack.course.school, "Georgia Tech");
  assert.ok(pack.concepts.length >= 8, `Expected at least 8 concepts, got ${pack.concepts.length}`);
});

test("GET /api/packs/unknown-9999 returns clean 404 or valid CoursePack, never 500", async () => {
  const res = await fetch(`${BASE_URL}/api/packs/unknown-9999`);
  assert.notEqual(res.status, 500, "Should never return 500 for unknown pack");
  if (res.status === 404) {
    const err = await res.json();
    assert.ok(err && typeof err.error === "string", "404 should return { error: string }");
  } else {
    assert.equal(res.status, 200);
    const pack = await res.json();
    assertCoursePack(pack, "fallbackPack");
  }
});
