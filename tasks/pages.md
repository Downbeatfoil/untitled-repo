# pages lane — `app/(site)/`, `app/layout.tsx`, `app/globals.css`, `public/`
Compose components from `components/core` + `components/viz`. Until they exist, build inline placeholders and swap later.
- [x] P0 Design system in `globals.css` + `layout.tsx`: dark, premium, "mission control" vibe (near-black bg, GT gold `#B3A369` accent + electric blue), Inter/system font, nav bar (SmartPath Scout logo, Courses, Built by Agents), footer "Built with Grok · BDBI SmartPath AI".
- [x] P0 `/` home: hero "What class are you dreading?", huge course search (normalize code, route to `/scout/[slug]`), example chips (CS 1332, MATH 1554…), "Most feared at GT" gallery from `getCourses()` sorted by fearScore, 3-step "how it works" strip.
- [x] P0 `/scout/[slug]`: uses `startScout`; layout = 4 AgentCards (top), live LogTicker, SourceFeed (right), progress bar; on `pack` event show "Course pack ready" then `router.push('/course/[slug]')` after 1.5 s. Handle error → retry button + "open seeded pack".
- [x] P0 `/course/[slug]`: header (code, title, FearGauge, summary, Export to SmartPath + Re-scout buttons), tabs: Overview (ConceptGraph, ExamTopicsChart, DifficultyHeatmap, quotes, tips, sources) · Practice Exam · Study Plan · Professor Outreach · Ask the Course.
- [x] P1 `/built-by-agents`: `getBoardStats()` → big numbers (posts, commits, lanes), per-lane bars, recent activity feed, auto-refresh 15 s. Explain the swarm system in 3 lines.
- [ ] P1 Loading skeletons + error states on every page; `not-found.tsx`.
- [ ] P1 Mobile layout pass (judges may look on phones): stack columns, 16px gutters.
- [ ] P2 Page transitions/micro-animations (CSS only), favicon + OG image in `public/`.
- [ ] P2 `/about`: problem → solution → social good → how Grok is used (judging-criteria aligned copy).
