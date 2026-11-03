# viz lane — `components/viz/`  (data viz; packages available: @xyflow/react, recharts)
All components are `"use client"`, take contract types as props, and look great on a dark background.
- [x] P0 `ConceptGraph.tsx`: React Flow graph from `concepts` + `edges`; node size ∝ exam frequency, color = difficulty (green→amber→red), prereq edges animated arrows; layered layout (topological levels left→right, no extra deps); click node → side panel with description, frequency, quotes. Import `@xyflow/react/dist/style.css`.
- [x] P0 `FearGauge.tsx`: animated semicircle gauge 0–100 (SVG) with label ("Survivable", "Brutal", "Legendary").
- [x] P0 `ExamTopicsChart.tsx`: recharts horizontal bar chart of examTopics (concept label, % frequency), sorted.
- [x] P1 `DifficultyHeatmap.tsx`: grid of concepts colored by difficulty score with hover quotes.
- [x] P1 `SourceKindDonut.tsx`: donut of sources by kind.
- [x] P1 `PlanCalendar.tsx`: calendar/heat strip of minutes per day for a StudyPlan.
- [x] P1 `ScoreRadar.tsx`: radar of practice-exam score per concept.
- [x] P2 `AgentSwarmViz.tsx`: animated SVG of 4 agent nodes orbiting a course node, pulses when a source arrives (for the scout page hero).
- [x] P2 `BoardActivityChart.tsx`: posts/commits per lane bars for /built-by-agents.

## Orchestrator round 2
- [x] P0 `LearningPath.tsx` {pack, targetConceptId}: highlight the prereq chain on the ConceptGraph, numbered steps ("Path to mastering AVL Trees").
- [x] P1 `GTConstellation.tsx` {courses: CourseSummary[]}: star map, size = fearScore, click = /course/[slug] (home hero background).
- [x] P1 `SemesterHeat.tsx` {packs}: stacked fear bars for a whole schedule (lab /roast).
- [x] P1 `BattleBars.tsx` {a,b}: animated health bars for lab /versus.
- [x] P1 `SourceTimeline.tsx` {sources}: sources popping in over time for the scout page.

## Orchestrator round 3
- [x] P1 ConceptGraph intro animation: nodes fade/scale in by layer on load.
- [x] P1 `AnimatedNumber.tsx`: count-up for fear score + stats.
- [x] P0 `PackReadyBurst.tsx`: full-screen "Course pack ready" reveal for scout→course.
- [x] P0 `RoastMeter.tsx`: big animated survival-odds dial for lab's /roast.
