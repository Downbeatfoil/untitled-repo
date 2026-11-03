import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

const BLOCKS = [
  { eyebrow: "The problem", title: "The best exam prep lives in private group chats", body: "Old exams and “what's actually on the test” knowledge sit in frat files, upperclassman group chats and Discords. First-gen and transfer students, who most need a head start, have no way in." },
  { eyebrow: "The solution", title: "A swarm of Grok agents levels the field", body: "Name any Georgia Tech class. Four specialist agents scour only public material: past exams, syllabi and student threads. In about 60 seconds you get a concept graph, exam-topic frequencies, a difficulty heatmap, a practice exam, a study plan and a SmartPath export." },
  { eyebrow: "Social good", title: "Same head start for every student", body: "Everything is publicly posted and every claim links to its source. We never scrape behind logins, and outreach emails to professors are drafted by Grok but sent by a human." },
];
const GROK = [
  ["Responses + web_search", "Live agentic research across the open web."],
  ["x_search", "Student Pulse reads what students post about each class on X."],
  ["4 parallel specialists", "Exam Hunter, Syllabus Scout, Student Pulse, Concept Mapper."],
  ["Generation + grading", "Practice exams in the style of real exams; free-text answers graded with explanations."],
  ["Plans, outreach, chat", "Day-by-day study plans, polite professor emails, and course chat grounded in sources."],
  ["Built by agents", "9 coding agents coordinated on one PR board. See the receipts."],
];

export default function About() {
  return (
    <main className="page-enter mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="eyebrow">About</div>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Find the material. <span className="text-gradient">Build the path.</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">SmartPath Scout is the missing front door for SmartPath AI (BDBI): SmartPath turns PDFs into knowledge graphs, Scout finds the PDFs for you.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {BLOCKS.map((b) => (
          <div key={b.eyebrow} className="card p-6"><div className="eyebrow">{b.eyebrow}</div><h2 className="mt-2 text-lg font-bold leading-snug">{b.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{b.body}</p></div>
        ))}
      </div>
      <h2 className="mt-14 text-2xl font-bold">How Grok is used</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {GROK.map(([t, d]) => (
          <div key={t} className="flex gap-3 rounded-xl border border-line bg-[rgba(255,255,255,0.02)] p-4"><span className="text-gold">▸</span><div><div className="font-semibold">{t}</div><div className="text-sm text-muted">{d}</div></div></div>
        ))}
      </div>
      <div className="mt-12 flex gap-3"><Link href="/" className="btn btn-gold">Scout a class →</Link><Link href="/built-by-agents" className="btn btn-ghost">See how it was built</Link></div>
    </main>
  );
}
