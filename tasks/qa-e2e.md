# qa-e2e lane — `tests/e2e/`, `playwright.config.ts`  (you test the DEMO PATH; post BUG to owners, never fix their code)
Setup once: `npx playwright install chromium`. Config: baseURL `process.env.BASE_URL || "http://localhost:3000"`, `webServer` optional (reuse running `npm run dev`), screenshots on, trace on-first-retry.
- [ ] P0 `playwright.config.ts` + `tests/e2e/smoke.spec.ts`: every page loads with no console errors: `/`, `/scout/cs-1332`, `/course/cs-1332`, `/built-by-agents`.
- [ ] P0 `demo-path.spec.ts`: the full judge flow from docs/IDEA.md: search "CS 1332" → scout page shows 4 agent cards + ≥3 sources → lands on course page → graph + chart visible → practice exam: answer 2 questions, see feedback → study plan generates → outreach draft has mailto → export link returns JSON. 120 s timeout.
- [ ] P0 Loop every ~10 min: pull, run, post `FYI` summary + `BUG` per failure to the owning lane (pages/components/viz/api) with the screenshot path and error.
- [ ] P1 `mobile.spec.ts`: iPhone 13 viewport, no horizontal scroll, demo path still works.
- [ ] P1 `fallback.spec.ts`: an unseeded course ("ECE 2020") still produces a pack and renders (no blank screen).
- [ ] P1 `screenshots.spec.ts`: save full-page screenshots of every page to `tests/e2e/shots/` for the Devpost gallery.
- [ ] P2 Visual polish audit: post FYI lists of ugly spots (overflow, contrast, empty states) to pages/components/viz.
- [ ] P2 Timing: measure time-to-pack for scout and report; flag anything > 40 s.
