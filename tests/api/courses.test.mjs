import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertCourseSummary } from "./contract.mjs";

test("GET /api/courses returns array of CourseSummary items", async () => {
  const res = await fetch(`${BASE_URL}/api/courses`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert.ok(Array.isArray(data), "Expected response to be an array");
  assert.ok(data.length > 0, "Expected at least one course summary");

  for (const [i, item] of data.entries()) {
    assertCourseSummary(item, `courses[${i}]`);
  }

  const cs1332 = data.find((c) => c.code === "CS 1332");
  assert.ok(cs1332, "Expected CS 1332 to be in courses list");
  assert.equal(typeof cs1332.fearScore, "number");
  assert.ok(cs1332.fearScore >= 0 && cs1332.fearScore <= 100);
});
