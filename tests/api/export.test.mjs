import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertSmartPathExport } from "./contract.mjs";

test("GET /api/export/cs-1332?format=smartpath returns valid SmartPathExport JSON", async () => {
  const res = await fetch(`${BASE_URL}/api/export/cs-1332?format=smartpath`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assertSmartPathExport(data, "smartpathExport");
  assert.equal(data.version, 1);
  assert.ok(data.course.includes("CS 1332"));
  assert.ok(data.nodes.length > 0, "Nodes should not be empty");
  assert.ok(data.edges.length > 0, "Edges should not be empty");
});

test("GET /api/export/cs-1332?format=ics returns iCalendar text starting with BEGIN:VCALENDAR", async () => {
  const res = await fetch(`${BASE_URL}/api/export/cs-1332?format=ics&examDate=2026-12-15&hoursPerDay=2`);
  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const text = (await res.text()).trim();
  assert.ok(text.startsWith("BEGIN:VCALENDAR"), `Expected to start with BEGIN:VCALENDAR, got: ${text.slice(0, 30)}`);
  assert.ok(text.endsWith("END:VCALENDAR"), `Expected to end with END:VCALENDAR, got: ${text.slice(-30)}`);
  assert.ok(text.includes("SUMMARY:"), "Expected calendar to contain events with SUMMARY");
});
