import test from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, assertPracticeExam, assertGradeResponse } from "./contract.mjs";

test("POST /api/exam returns valid practice exam with N questions", async () => {
  const count = 6;
  const res = await fetch(`${BASE_URL}/api/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode: "CS 1332", count }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const exam = await res.json();
  assertPracticeExam(exam, "exam");
  assert.equal(exam.courseCode, "CS 1332");
  assert.equal(exam.questions.length, count, `Expected ${count} questions, got ${exam.questions.length}`);
});

test("POST /api/exam/grade grades correct answer properly", async () => {
  const examRes = await fetch(`${BASE_URL}/api/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode: "CS 1332", count: 2 }),
  });
  const exam = await examRes.json();
  const q = exam.questions.find((x) => x.type === "mcq") || exam.questions[0];

  const gradeRes = await fetch(`${BASE_URL}/api/exam/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      question: q,
      userAnswer: q.answer,
    }),
  });

  assert.equal(gradeRes.status, 200, `Expected 200, got ${gradeRes.status}`);
  const grade = await gradeRes.json();
  assertGradeResponse(grade, "gradeResult");
  assert.equal(grade.correct, true, "Expected correct to be true");
  assert.equal(grade.score, 1, "Expected score to be 1 for exact answer");
  assert.ok(grade.feedback.length > 0, "Expected non-empty feedback");
});

test("POST /api/exam/grade grades incorrect answer properly", async () => {
  const examRes = await fetch(`${BASE_URL}/api/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseCode: "CS 1332", count: 2 }),
  });
  const exam = await examRes.json();
  const q = exam.questions.find((x) => x.type === "mcq") || exam.questions[0];

  const gradeRes = await fetch(`${BASE_URL}/api/exam/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseCode: "CS 1332",
      question: q,
      userAnswer: "COMPLETELY_WRONG_ANSWER_12345",
    }),
  });

  assert.equal(gradeRes.status, 200, `Expected 200, got ${gradeRes.status}`);
  const grade = await gradeRes.json();
  assertGradeResponse(grade, "gradeResult");
  assert.equal(grade.correct, false, "Expected correct to be false");
  assert.ok(grade.score < 1, "Expected score < 1 for wrong answer");
  assert.ok(grade.feedback.length > 0, "Expected non-empty feedback");
});
