# wall lane — `app/(wall)/`, `components/wall/`  (big-screen demo-table mode; route group (wall) shares root layout)
- [x] P0 `/wall` **TV mode** (laptop facing the judges, fullscreen): auto-rotates every 12 s through seeded course packs (fear gauge, hardest concept, top exam topics, a student quote), plus a right rail live ticker of the build board.
- [x] P0 `app/(wall)/wall-api/board/route.ts` GET → last 30 board posts parsed `{lane,type,message,at}` from `https://api.github.com/repos/Downbeatfoil/untitled-repo/issues/1/comments?per_page=100` (cache 20 s; static fallback). (Separate from api's /api/board-stats so you're not blocked.)
- [x] P1 `SwarmCounter`: giant animated counters "agents · board posts · commits · minutes", refresh 20 s.
- [ ] P1 `/wall/swarm`: live visualization of the 12 agent lanes as nodes; a node pulses when its lane posts; edges light up on `TO:` handoffs. This is the "how it was built" wow moment.
- [x] P2 Keyboard: space = pause rotation, arrows = next/prev, f = fullscreen.
- [ ] P2 QR code panel linking to the deployed app/repo (pure SVG, no deps).
