import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertChatResponse } from "./contract.mjs";

test("POST /api/chat returns grounded reply and cited source IDs", async () => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      messages: [{ role: "user", content: "What is the hardest topic on the exam?" }],
    }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const chat = await res.json();
  assertChatResponse(chat, "chatResponse");
  assert.ok(chat.reply.length > 10, "Expected a substantive reply");
  assert.ok(Array.isArray(chat.citedSourceIds), "citedSourceIds must be an array");
});
