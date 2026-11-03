/**
 * Lane: ai. Self-test script verifying all Grok scouts, generators, and fallbacks.
 * Run with: npx tsx lib/ai/selfcheck.ts
 */
import { examHunter, syllabusScout, studentPulse } from "./agents";
import { buildPack } from "./conceptMapper";
import { runScout } from "./scout";
import { generateExam, gradeAnswer } from "./exam";
import { generatePlan } from "./plan";
import { draftOutreach } from "./outreach";
import { courseChat } from "./chat";
import { getSeedPack } from "@/lib/data";

async function main() {
  console.log("=== Testing lib/ai Research Swarm ===");
  const code = "CS 1332";

  // 1. Agents
  console.log("1. Testing research agents...");
  const eh = await examHunter(code);
  console.log(`- Exam Hunter: ${eh.sources.length} sources, notes len: ${eh.notes.length}`);
  if (eh.sources.length === 0) throw new Error("Exam Hunter returned 0 sources");

  const ss = await syllabusScout(code);
  console.log(`- Syllabus Scout: ${ss.sources.length} sources, notes len: ${ss.notes.length}`);
  if (ss.sources.length === 0) throw new Error("Syllabus Scout returned 0 sources");

  const sp = await studentPulse(code);
  console.log(`- Student Pulse: ${sp.sources.length} sources, notes len: ${sp.notes.length}`);
  if (sp.sources.length === 0) throw new Error("Student Pulse returned 0 sources");

  // 2. Concept Mapper
  console.log("2. Testing concept mapper...");
  const pack = await buildPack(code, { examHunter: eh, syllabusScout: ss, studentPulse: sp });
  console.log(`- Concept Mapper: ${pack.concepts.length} concepts, ${pack.edges.length} edges, fearScore: ${pack.fearScore}`);
  if (pack.concepts.length < 3) throw new Error("Concept Mapper produced fewer than 3 concepts");

  // 3. Scout stream
  console.log("3. Testing runScout async stream...");
  let eventCount = 0;
  let sawPack = false;
  let sawDone = false;
  for await (const event of runScout(code)) {
    eventCount++;
    if (event.type === "pack") sawPack = true;
    if (event.type === "done") sawDone = true;
  }
  console.log(`- runScout yielded ${eventCount} events (sawPack=${sawPack}, sawDone=${sawDone})`);
  if (!sawPack || !sawDone) throw new Error("runScout did not yield pack or done event");

  // 4. Downstream study tools
  console.log("4. Testing study tools with pack...");
  const seed = getSeedPack("CS 1332")!;
  const exam = await generateExam(seed, 4);
  console.log(`- generateExam: ${exam.questions.length} questions, title: "${exam.title}"`);

  const grade = await gradeAnswer(exam.questions[0], exam.questions[0].answer);
  console.log(`- gradeAnswer: score=${grade.score}, feedback: "${grade.feedback.slice(0, 40)}..."`);

  const plan = await generatePlan(seed, "2026-11-20", 2);
  console.log(`- generatePlan: ${plan.days.length} days`);

  const outreach = await draftOutreach(seed, "Dr. HB", "Alex", "friendly");
  console.log(`- draftOutreach: mailto starts with "${outreach.mailto.slice(0, 25)}..."`);

  const chat = await courseChat(seed, [{ role: "user", content: "What is on Exam 2?" }]);
  console.log(`- courseChat: reply len=${chat.reply.length}, cited=${chat.citedSourceIds.join(",")}`);

  console.log("\nALL LIB/AI TESTS PASSED! 🚀");
}

main().catch((err) => {
  console.error("Selfcheck failed:", err);
  process.exit(1);
});
