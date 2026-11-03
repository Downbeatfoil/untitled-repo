# lab lane — `app/(lab)/`, `components/lab/`  (wow features; route group (lab) shares the root layout)
Data: `getPack`/`getCourses` from `@/lib/api-client`. Grok calls: import `roastSchedule`/`cageMatch` from `@/lib/ai-tools` through YOUR OWN server route under `app/(lab)/lab-api/...` (route.ts), or a server action. Until ai-tools ships them, use inline mocks.
- [x] P0 `/roast` **Schedule Roast**: pick 3–5 GT courses (chips from getCourses + free text) → "Roast my schedule" → big survival-odds meter, total fear score, Grok verdict, one roast line per course, "Build my survival plan" links to each /course page. Make it screenshot-worthy.
- [x] P0 `app/(lab)/lab-api/roast/route.ts` POST {codes: string[]} → roast result (uses getPack data from lib/data + roastSchedule; mock fallback).
- [ ] P1 `/versus` **Course Cage Match**: two course pickers → animated round-by-round battle (Grok commentary, round winners, health bars) → champion banner. Route `app/(lab)/lab-api/versus/route.ts`.
- [ ] P1 Share buttons on both (copy text).
- [ ] P2 Sound-free micro-animations, mobile layout.
- [ ] P2 Ask `pages` (board ASK) to add nav links to /roast and /versus.
