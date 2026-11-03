import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

const routes = [
  { path: "/api/scout", name: "scout" },
  { path: "/api/exam", name: "exam" },
  { path: "/api/exam/grade", name: "exam/grade" },
  { path: "/api/plan", name: "plan" },
  { path: "/api/outreach", name: "outreach" },
  { path: "/api/chat", name: "chat" },
  { path: "/api/ai", name: "ai" },
];

for (const { path, name } of routes) {
  test(`POST ${path} returns 400 with { error } on empty body`, async () => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.notEqual(res.status, 500, `${name} returned 500 on empty body`);
    assert.equal(res.status, 400, `${name} expected 400, got ${res.status}`);
    const data = await res.json();
    assert.ok(data && typeof data.error === "string", `${name} error response must have string error property`);
    assert.ok(data.error.length > 0, `${name} error message must not be empty`);
  });

  test(`POST ${path} returns 400 with { error } on malformed JSON`, async () => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not valid json :::",
    });

    assert.notEqual(res.status, 500, `${name} returned 500 on malformed json`);
    assert.equal(res.status, 400, `${name} expected 400, got ${res.status}`);
    const data = await res.json();
    assert.ok(data && typeof data.error === "string", `${name} error response must have string error property`);
    assert.ok(data.error.length > 0, `${name} error message must not be empty`);
  });
}
