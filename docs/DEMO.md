# Demo plan: SmartPath Scout (2 minutes, at our table)

## Setup (two screens)
- **Laptop A: Akshaj drives.** `npm run dev` on localhost (venue Wi-Fi can't break it). Browser fullscreen (F11), zoom 110%, dark mode, all other tabs closed. Pre-opened tabs: `/` · `/course/cs-1332` · `/roast` · `/built-by-agents`.
- **Laptop B: Vibhor, facing the judges.** `/wall` in fullscreen (TV mode). It loops course packs + the live build board while judges walk up. It's the hook before we say a word.
- **Backup:** deployed Vercel URL on a phone, and a 60 s screen recording of the full flow in case anything dies.
- **Pre-warm (5 min before judging):** run a scout for CS 1332 and MATH 1554 once so packs are cached and instant.

## Script (~2:00)

**0:00–0:15 · Hook** (point at Laptop B)
> "Quick question: what's the class you're most scared of at Tech?"
(Let the judge answer. That's the course we demo.)
> "Every GT student knows the trick for those classes: get the old exams from someone who took it. But that only works if you know the right people. SmartPath Scout gives everyone that head start."

**0:15–0:45 · Live scout** (Laptop A, `/`)
- Type the judge's course → Enter.
- Four Grok agents light up: **Exam Hunter, Syllabus Scout, Student Pulse, Concept Mapper.**
> "These are Grok agents using live web and X search in parallel. Exam Hunter is finding publicly posted past exams, Student Pulse is reading what students say on Reddit and X, and every source is cited."
- Let sources fly in for ~10 s. (If their course isn't seeded and Grok is slow, say "let's look at one we scouted earlier" and go to `/course/cs-1332`.)

**0:45–1:15 · The course pack** (`/course/[slug]`)
- **Fear gauge**: "CS 1332 is a 78. Brutal."
- **Concept graph**: "Every concept, sized by how often it shows up on past exams, colored by how much students struggle." Click the reddest node: show student quotes.
- **What's on the exam** chart: "This is what to study first."

**1:15–1:35 · Grok as study partner** (tabs)
- **Practice exam**: answer one question; Grok grades it with feedback (confetti if right).
- **Study plan**: pick the exam date → "Add to calendar."
- **Professor outreach**: "Grok drafts an email asking the professor to share past exams with SmartPath. A human always hits send."
- **Export to SmartPath**: "It plugs straight into SmartPath's knowledge graph, so this becomes the courses page SmartPath doesn't have yet."

**1:35–1:50 · Crowd-pleaser** (`/roast`)
- Enter the judge's actual schedule → **Schedule Roast**: survival odds + one Grok roast line per class. (Let them laugh.)

**1:50–2:00 · How we built it** (`/built-by-agents` or point at Laptop B's `/wall/swarm`)
> "And we built all of this in 90 minutes with a swarm of 12 AI agents: GrokBot, Antigravity, and Claude, coordinating through one GitHub PR as a message board. That's [N] posts and [M] commits. Grok is the product AND the builder."

## Judging criteria → where we hit them
| Criterion | Moment |
|---|---|
| Creative + extensive Grok tools | Live 4-agent scout (web + X search), exam grading, plans, outreach, roast; GrokBot built it |
| Social good | Hook line: old exams shouldn't depend on who you know; public sources only, cited |
| Working demo + technical execution | Live streaming scout, real graph, nothing mocked on screen without a label; seeded fallback means no crashes |
| Usefulness + integration | Export to SmartPath graph format; fills SmartPath's missing courses page |

## Do / don't
- DO let the judge pick the course and type their schedule: personal = memorable.
- DO keep talking while the scout streams; never wait in silence.
- DON'T scroll through code or explain the folder structure.
- DON'T claim exams were "scraped": say "publicly posted, cited."
- If anything errors: "that's the live version; here's the one we scouted earlier," then open `/course/cs-1332`.
