# SmartPath Scout

**One-liner:** Name any Georgia Tech class. A swarm of Grok agents scours the web and X for public past exams, syllabi and student chatter, then builds you a SmartPath study path in about 60 seconds.

**Project:** SmartPath AI (BDBI, gt-big-data/smart-path-ai). SmartPath turns uploaded PDFs into knowledge graphs + quizzes, but students must already *have* the material and there is no courses page. Scout fills both gaps: it finds the material for you and exports straight into SmartPath's graph format.

**Social good:** Old exams and "what's actually on the test" knowledge live in frat files, upperclassman group chats and Discords. Scout gives every student, including first-gen and transfer students with no network, the same head start, using only publicly posted material with every source cited.

**Why Grok (judging criterion #1):**
- Grok API **Responses + server-side `web_search` and `x_search`**: real agentic research, live.
- 4 specialist Grok agents run in parallel (Exam Hunter, Syllabus Scout, Student Pulse, Concept Mapper).
- Grok generates practice exams in the style of the real past exams, grades free-text answers, builds study plans, drafts professor outreach, and powers course chat.
- Built by a swarm of coding agents (GrokBot, Cursor, Antigravity) coordinating on one GitHub PR board (see /built-by-agents).

## Demo path (what judges see, in order) — 2 minutes
1. **Home (`/`)**: hero "What class are you dreading?" + big search box + gallery "Most feared at GT" (seeded cards with fear scores).
2. Judge types *their* class → **`/scout/[slug]`**: 4 agent cards light up (searching → thinking → done), live thought ticker, sources fly into a feed with kind badges (exam, syllabus, reddit, x). Ends with "Course pack ready" → auto-navigates.
3. **`/course/[slug]`** dashboard: fear-score gauge, summary, **concept graph** (nodes sized by exam frequency, colored by difficulty, prereq arrows), "What's on the exam" bar chart, difficulty heatmap, student quotes, cited sources, study tips.
4. **Practice exam tab:** 6 questions in the style of real past exams → answer → Grok grades with explanations → score card.
5. **Study plan tab:** pick exam date + hours/day → day-by-day plan → **Add to calendar (.ics)**.
6. **Professor outreach tab:** Grok drafts a polite email asking the professor to share past exams with SmartPath → **Open in mail app** (human sends).
7. **Ask the course** chat (grounded in the pack, cites sources).
8. **Export to SmartPath** button (JSON in SmartPath graph format).
9. **`/built-by-agents`**: live board stats — posts and commits per agent lane, recent activity. "This app was built in 90 minutes by 9 AI agents."

## Seeded courses (demo never depends on the network)
CS 1332 (Data Structures & Algorithms), CS 2110 (Computer Organization & Programming), CS 1331 (Intro to OOP), MATH 1554 (Linear Algebra), CS 3510 (Design & Analysis of Algorithms), PHYS 2211 (Intro Physics I).

## Out of scope (fake it or skip)
Auth, databases (in-memory + JSON seed files only), real email sending, scraping behind logins, anything non-public.
