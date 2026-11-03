import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertStudyPlan } from "./contract.mjs";

test("POST /api/plan returns valid StudyPlan", async () => {
  const res = await fetch(`${BASE_URL}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      examDate: "2026-12-15",
      hoursPerDay: 2,
    }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const plan = await res.json();
  assertStudyPlan(plan, "plan");
  assert.equal(plan.courseCode, "CS 1332");
  assert.ok(plan.days.length > 0, "Expected at least one day in plan");

  for (const day of plan.days) {
    assert.equal(typeof day.date, "string");
    assert.ok(day.conceptIds.length > 0, "Day should have conceptIds");
    assert.ok(day.tasks.length > 0, "Day should have tasks");
    assert.ok(day.minutes > 0, "Day minutes should be positive");
  }
});
