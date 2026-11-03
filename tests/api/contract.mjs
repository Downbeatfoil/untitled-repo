import assert from "node:assert/strict";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const AGENT_NAMES = ["exam-hunter", "syllabus-scout", "student-pulse", "concept-mapper"];
export const SOURCE_KINDS = ["exam", "practice", "syllabus", "course-page", "notes", "reddit", "x", "other"];

export function assertSource(source, prefix = "source") {
  assert.ok(source && typeof source === "object", `${prefix} must be an object`);
  assert.equal(typeof source.id, "string", `${prefix}.id must be string`);
  assert.equal(typeof source.url, "string", `${prefix}.url must be string`);
  assert.equal(typeof source.title, "string", `${prefix}.title must be string`);
  assert.ok(SOURCE_KINDS.includes(source.kind), `${prefix}.kind invalid: ${source.kind}`);
  assert.equal(typeof source.snippet, "string", `${prefix}.snippet must be string`);
  assert.ok(AGENT_NAMES.includes(source.foundBy), `${prefix}.foundBy invalid: ${source.foundBy}`);
}

export function assertConcept(concept, prefix = "concept") {
  assert.ok(concept && typeof concept === "object", `${prefix} must be an object`);
  assert.equal(typeof concept.id, "string", `${prefix}.id must be string`);
  assert.equal(typeof concept.label, "string", `${prefix}.label must be string`);
  assert.equal(typeof concept.description, "string", `${prefix}.description must be string`);
  if (concept.unit !== undefined) {
    assert.equal(typeof concept.unit, "string", `${prefix}.unit must be string`);
  }
}

export function assertConceptEdge(edge, prefix = "edge") {
  assert.ok(edge && typeof edge === "object", `${prefix} must be an object`);
  assert.equal(typeof edge.from, "string", `${prefix}.from must be string`);
  assert.equal(typeof edge.to, "string", `${prefix}.to must be string`);
  assert.ok(["prereq", "related"].includes(edge.relation), `${prefix}.relation must be prereq or related`);
}

export function assertExamTopic(topic, prefix = "examTopic") {
  assert.ok(topic && typeof topic === "object", `${prefix} must be an object`);
  assert.equal(typeof topic.conceptId, "string", `${prefix}.conceptId must be string`);
  assert.equal(typeof topic.frequency, "number", `${prefix}.frequency must be number`);
  assert.ok(topic.frequency >= 0 && topic.frequency <= 1, `${prefix}.frequency must be in 0..1`);
  assert.ok(Array.isArray(topic.evidenceSourceIds), `${prefix}.evidenceSourceIds must be array`);
}

export function assertQuote(quote, prefix = "quote") {
  assert.ok(quote && typeof quote === "object", `${prefix} must be an object`);
  assert.equal(typeof quote.text, "string", `${prefix}.text must be string`);
  assert.equal(typeof quote.sourceId, "string", `${prefix}.sourceId must be string`);
  assert.ok(["positive", "neutral", "negative"].includes(quote.sentiment), `${prefix}.sentiment invalid: ${quote.sentiment}`);
}

export function assertDifficulty(diff, prefix = "difficulty") {
  assert.ok(diff && typeof diff === "object", `${prefix} must be an object`);
  assert.equal(typeof diff.conceptId, "string", `${prefix}.conceptId must be string`);
  assert.equal(typeof diff.score, "number", `${prefix}.score must be number`);
  assert.ok(diff.score >= 0 && diff.score <= 1, `${prefix}.score must be in 0..1`);
  assert.ok(Array.isArray(diff.quotes), `${prefix}.quotes must be array`);
  diff.quotes.forEach((q, i) => assertQuote(q, `${prefix}.quotes[${i}]`));
}

export function assertCoursePack(pack, prefix = "pack") {
  assert.ok(pack && typeof pack === "object", `${prefix} must be an object`);
  assert.ok(pack.course && typeof pack.course === "object", `${prefix}.course must be object`);
  assert.equal(typeof pack.course.code, "string", `${prefix}.course.code must be string`);
  assert.equal(typeof pack.course.title, "string", `${prefix}.course.title must be string`);
  assert.equal(pack.course.school, "Georgia Tech", `${prefix}.course.school must be "Georgia Tech"`);

  assert.equal(typeof pack.summary, "string", `${prefix}.summary must be string`);
  assert.equal(typeof pack.fearScore, "number", `${prefix}.fearScore must be number`);
  assert.ok(pack.fearScore >= 0 && pack.fearScore <= 100, `${prefix}.fearScore must be in 0..100`);

  assert.ok(Array.isArray(pack.concepts), `${prefix}.concepts must be array`);
  pack.concepts.forEach((c, i) => assertConcept(c, `${prefix}.concepts[${i}]`));

  assert.ok(Array.isArray(pack.edges), `${prefix}.edges must be array`);
  pack.edges.forEach((e, i) => assertConceptEdge(e, `${prefix}.edges[${i}]`));

  assert.ok(Array.isArray(pack.examTopics), `${prefix}.examTopics must be array`);
  pack.examTopics.forEach((t, i) => assertExamTopic(t, `${prefix}.examTopics[${i}]`));

  assert.ok(Array.isArray(pack.difficulty), `${prefix}.difficulty must be array`);
  pack.difficulty.forEach((d, i) => assertDifficulty(d, `${prefix}.difficulty[${i}]`));

  assert.ok(Array.isArray(pack.studentQuotes), `${prefix}.studentQuotes must be array`);
  pack.studentQuotes.forEach((q, i) => assertQuote(q, `${prefix}.studentQuotes[${i}]`));

  assert.ok(Array.isArray(pack.sources), `${prefix}.sources must be array`);
  pack.sources.forEach((s, i) => assertSource(s, `${prefix}.sources[${i}]`));

  assert.ok(Array.isArray(pack.professors), `${prefix}.professors must be array`);
  pack.professors.forEach((p, i) => {
    assert.equal(typeof p.name, "string", `${prefix}.professors[${i}].name must be string`);
  });

  assert.ok(Array.isArray(pack.tips), `${prefix}.tips must be array`);
  assert.equal(typeof pack.generatedAt, "string", `${prefix}.generatedAt must be string`);
  assert.equal(typeof pack.mocked, "boolean", `${prefix}.mocked must be boolean`);
}

export function assertCourseSummary(summary, prefix = "summary") {
  assert.ok(summary && typeof summary === "object", `${prefix} must be an object`);
  assert.equal(typeof summary.code, "string", `${prefix}.code must be string`);
  assert.equal(typeof summary.title, "string", `${prefix}.title must be string`);
  assert.equal(typeof summary.fearScore, "number", `${prefix}.fearScore must be number`);
  assert.ok(summary.fearScore >= 0 && summary.fearScore <= 100, `${prefix}.fearScore must be 0..100`);
  assert.equal(typeof summary.conceptCount, "number", `${prefix}.conceptCount must be number`);
  assert.equal(typeof summary.sourceCount, "number", `${prefix}.sourceCount must be number`);
  assert.equal(typeof summary.topConcept, "string", `${prefix}.topConcept must be string`);
}

export function assertQuestion(q, prefix = "question") {
  assert.ok(q && typeof q === "object", `${prefix} must be an object`);
  assert.equal(typeof q.id, "string", `${prefix}.id must be string`);
  assert.equal(typeof q.conceptId, "string", `${prefix}.conceptId must be string`);
  assert.ok(["mcq", "short"].includes(q.type), `${prefix}.type must be mcq or short`);
  assert.equal(typeof q.prompt, "string", `${prefix}.prompt must be string`);
  if (q.type === "mcq") {
    assert.ok(Array.isArray(q.choices), `${prefix}.choices must be array for mcq`);
    assert.ok(q.choices.length >= 2, `${prefix}.choices must have at least 2 choices`);
  }
  assert.equal(typeof q.answer, "string", `${prefix}.answer must be string`);
  assert.equal(typeof q.explanation, "string", `${prefix}.explanation must be string`);
  assert.ok(["easy", "medium", "hard"].includes(q.difficulty), `${prefix}.difficulty invalid: ${q.difficulty}`);
}

export function assertPracticeExam(exam, prefix = "exam") {
  assert.ok(exam && typeof exam === "object", `${prefix} must be an object`);
  assert.equal(typeof exam.id, "string", `${prefix}.id must be string`);
  assert.equal(typeof exam.courseCode, "string", `${prefix}.courseCode must be string`);
  assert.equal(typeof exam.title, "string", `${prefix}.title must be string`);
  assert.ok(Array.isArray(exam.questions), `${prefix}.questions must be array`);
  exam.questions.forEach((q, i) => assertQuestion(q, `${prefix}.questions[${i}]`));
  assert.equal(typeof exam.mocked, "boolean", `${prefix}.mocked must be boolean`);
}

export function assertGradeResponse(grade, prefix = "grade") {
  assert.ok(grade && typeof grade === "object", `${prefix} must be an object`);
  assert.equal(typeof grade.correct, "boolean", `${prefix}.correct must be boolean`);
  assert.equal(typeof grade.score, "number", `${prefix}.score must be number`);
  assert.ok(grade.score >= 0 && grade.score <= 1, `${prefix}.score must be 0..1`);
  assert.equal(typeof grade.feedback, "string", `${prefix}.feedback must be string`);
  assert.equal(typeof grade.mocked, "boolean", `${prefix}.mocked must be boolean`);
}
