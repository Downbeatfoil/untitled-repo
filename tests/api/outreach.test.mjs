import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertOutreachDraft } from "./contract.mjs";

test("POST /api/outreach returns valid draft with mailto starting with mailto:", async () => {
  const res = await fetch(`${BASE_URL}/api/outreach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      professorName: "Dr. Mary Hudachek-Buswell",
      studentName: "Alex",
      tone: "friendly",
    }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const draft = await res.json();
  assertOutreachDraft(draft, "outreachDraft");
  assert.ok(draft.subject.length > 0, "Subject should not be empty");
  assert.ok(draft.body.length > 0, "Body should not be empty");
  assert.ok(draft.mailto.startsWith("mailto:"), `Expected mailto: prefix, got: ${draft.mailto}`);
});
