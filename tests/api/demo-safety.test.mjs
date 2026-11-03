import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL } from "./contract.mjs";

test("Demo Safety: all core routes succeed with mocked: true when no live API key", async () => {
  // 1. Health shows grokConfigured = false (in offline/demo mode)
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.ok, true);

  // 2. Courses return data
  const coursesRes = await fetch(`${BASE_URL}/api/courses`);
  assert.equal(coursesRes.status, 200);
  const courses = await coursesRes.json();
  assert.ok(courses.length >= 6, "Expected at least 6 seeded courses");

  // 3. Packs return mocked: true
  const packRes = await fetch(`${BASE_URL}/api/packs/cs-1332`);
  assert.equal(packRes.status, 200);
  const pack = await packRes.json();
  assert.equal(pack.mocked, true, "CS 1332 seed pack should have mocked: true");

  // 4. Exam returns mocked: true
  const examRes = await fetch(`${BASE_URL}/api/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode: "CS 1332", count: 4 }),
  });
  assert.equal(examRes.status, 200);
  const exam = await examRes.json();
  assert.equal(exam.mocked, true, "Practice exam should have mocked: true");

  // 5. Grade returns mocked: true
  const gradeRes = await fetch(`${BASE_URL}/api/exam/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      question: exam.questions[0],
      userAnswer: exam.questions[0].answer,
    }),
  });
  assert.equal(gradeRes.status, 200);
  const grade = await gradeRes.json();
  assert.equal(grade.mocked, true, "Grade response should have mocked: true");

  // 6. Plan returns mocked: true
  const planRes = await fetch(`${BASE_URL}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      examDate: "2026-12-15",
      hoursPerDay: 2,
    }),
  });
  assert.equal(planRes.status, 200);
  const plan = await planRes.json();
  assert.equal(plan.mocked, true, "Study plan should have mocked: true");

  // 7. Outreach returns mocked: true
  const outreachRes = await fetch(`${BASE_URL}/api/outreach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      professorName: "Dr. Mary Hudachek-Buswell",
      tone: "friendly",
    }),
  });
  assert.equal(outreachRes.status, 200);
  const draft = await outreachRes.json();
  assert.equal(draft.mocked, true, "Outreach draft should have mocked: true");

  // 8. Chat returns mocked: true
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      messages: [{ role: "user", content: "What is an AVL Tree?" }],
    }),
  });
  assert.equal(chatRes.status, 200);
  const chat = await chatRes.json();
  assert.equal(chat.mocked, true, "Course chat should have mocked: true");
});
