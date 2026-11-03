# export lane — `lib/export/`  (pure TS functions, no React, no fetch)
- [ ] P0 `smartpath.ts`: `toSmartPath(pack, exam?): SmartPathExport` (weight = exam frequency; quizzes from exam questions or tips).
- [ ] P0 `mailto.ts`: `buildMailto(to, subject, body)` (proper encoding).
- [ ] P1 `ics.ts`: `toIcs(plan, courseCode)` → valid RFC 5545 VCALENDAR with one all-day/1-hr event per PlanDay (title "CS 1332: AVL Trees, Heaps"), CRLF line endings, UID per event.
- [ ] P1 `markdown.ts`: `packToMarkdown(pack)` cheat-sheet export (concepts, exam topics, tips, sources).
- [ ] P1 `share.ts`: `shareText(pack)` one-paragraph "I scouted CS 1332 with Grok…" for copy/paste.
- [ ] P2 Read gt-big-data/smart-path-ai's graph format (github.com/gt-big-data/smart-path-ai, src/lib + server/controllers/graphController) and make `toSmartPath` match it as closely as possible; document mapping in `lib/export/README.md`.
- [ ] P2 Unit sanity script `lib/export/selfcheck.ts` (run with `npx tsx`) printing sample outputs for the CS 1332 seed.
