import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

test("POST /lab-api/roast returns survivalOdds, verdict, and perCourse lines", async () => {
  const res = await fetch(`${BASE_URL}/lab-api/roast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codes: ["CS 1332", "CS 2110"] }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert.equal(typeof data.survivalOdds, "number");
  assert.equal(typeof data.verdict, "string");
  assert.ok(Array.isArray(data.perCourse));
  assert.equal(data.perCourse.length, 2);
});

test("POST /lab-api/versus returns comparison between two courses", async () => {
  const res = await fetch(`${BASE_URL}/lab-api/versus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a: "CS 1332", b: "CS 2110" }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert.ok(data.a && data.b, "Expected a and b in response");
  assert.equal(data.a.code, "CS 1332");
  assert.equal(data.b.code, "CS 2110");
  assert.equal(typeof data.a.fearScore, "number");
  assert.equal(typeof data.b.fearScore, "number");
});
