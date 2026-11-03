# design lane — de-slop the UI (owns ALL frontend files from 01:43 until FREEZE ~01:53)
Goal: make it look designed by a human product designer, not "vibe-coded". Keep every feature and data flow working.
- [ ] P0 Global tokens in app/globals.css: one restrained palette (kill rainbow gradients/glows), real type scale, consistent spacing/radius, fewer borders/shadows.
- [ ] P0 Demo path pages first: /, /scout/[slug], /course/[slug], /roast. Then /wall, /versus, /built-by-agents.
- [ ] P1 Remove AI tells: emoji in headings, gradient text, glassmorphism everywhere, generic "✨ AI-powered" copy, everything-centered layouts, identical cards.
- [ ] P1 Copy pass: short, specific, human.
Rules: CSS/className/copy changes only, no logic/API changes. `npm run build` must pass before every ship. Ship every ~3 min with scripts/ship.sh design "msg".
