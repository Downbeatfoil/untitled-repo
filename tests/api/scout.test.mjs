import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, AGENT_NAMES, assertSource, assertCoursePack } from "./contract.mjs";

test("POST /api/scout for CS 1332 streams valid SSE events ending in done within 60s", { timeout: 60000 }, async () => {
  const startTime = Date.now();
  const res = await fetch(`${BASE_URL}/api/scout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode: "CS 1332" }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  assert.ok(contentType.includes("text/event-stream"), `Expected text/event-stream, got ${contentType}`);
  assert.ok(res.body, "Response body should be readable stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const chunk = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (chunk.startsWith("data:")) {
        const rawJson = chunk.slice(5).trim();
        try {
          events.push(JSON.parse(rawJson));
        } catch (err) {
          assert.fail(`Failed to parse SSE event JSON: ${rawJson}`);
        }
      }
    }
  }

  const elapsed = Date.now() - startTime;
  assert.ok(elapsed < 60000, `Stream took too long: ${elapsed}ms`);
  assert.ok(events.length > 0, "Expected at least one SSE event");

  // 1. Assert: >= 1 agent event per agent
  const agentEvents = events.filter((e) => e.type === "agent");
  assert.ok(agentEvents.length > 0, "Expected agent events");
  for (const agentName of AGENT_NAMES) {
    const matching = agentEvents.filter((e) => e.agent === agentName);
    assert.ok(
      matching.length >= 1,
      `Expected >= 1 agent event for agent '${agentName}', found ${matching.length}`
    );
  }

  // 2. Assert: >= 5 source events
  const sourceEvents = events.filter((e) => e.type === "source");
  assert.ok(
    sourceEvents.length >= 5,
    `Expected >= 5 source events, found ${sourceEvents.length}`
  );
  for (const [i, se] of sourceEvents.entries()) {
    assertSource(se.source, `sourceEvents[${i}].source`);
  }

  // 3. Assert: exactly one pack event
  const packEvents = events.filter((e) => e.type === "pack");
  assert.equal(packEvents.length, 1, `Expected exactly 1 pack event, got ${packEvents.length}`);
  assertCoursePack(packEvents[0].pack, "scout.pack");
  assert.equal(packEvents[0].pack.course.code, "CS 1332");

  // 4. Assert: ends with done
  const lastEvent = events[events.length - 1];
  assert.equal(lastEvent.type, "done", `Expected last event to be 'done', got '${lastEvent.type}'`);
});
