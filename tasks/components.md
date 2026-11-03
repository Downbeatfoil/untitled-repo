# components lane — `components/core/`  (interactive UI; call lib/api-client.ts only)
- [x] P0 `CourseSearch.tsx` (input + submit + example chips; props `onSubmit(code)`), `CourseCard.tsx` (CourseSummary card w/ fear score badge).
- [x] P0 Scout UI: `AgentCard.tsx` (emoji, label, tool badge, status w/ animated pulse/spinner/check), `LogTicker.tsx` (latest log lines, typewriter feel), `SourceFeed.tsx` (sources animate in; kind badge colors; link out), `ScoutProgress.tsx`.
- [x] P0 `PracticeExam.tsx`: `postExam` → one question at a time, MCQ buttons / short-answer textarea → `postGrade` → feedback + explanation → final score card with per-concept breakdown.
- [ ] P1 `StudyPlanner.tsx`: date + hours inputs → `postPlan` → day list/calendar grid → "Add to calendar" link via `exportUrl(code,'ics',…)`.
- [ ] P1 `OutreachComposer.tsx`: professor select (from pack.professors), tone toggle → `postOutreach` → editable subject/body → "Open in mail app" (mailto) + copy button. Label: "Grok drafts, you send."
- [ ] P1 `CourseChat.tsx`: chat with `postChat`, suggested questions ("What's on exam 2?"), cited sources as chips.
- [ ] P1 `Tabs.tsx`, `Skeleton.tsx`, `Badge.tsx`, `Button.tsx`, `ExportButton.tsx` (downloads `exportUrl(code,'smartpath')`).
- [ ] P2 `QuoteCard.tsx`, `TipList.tsx`, `SourceList.tsx` (grouped by kind).
- [ ] P2 Keyboard + focus states, `aria-live` on scout feed.
