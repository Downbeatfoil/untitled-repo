/**
 * Lane: data
 * Seed pack for CS 2340: Objects and Design at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs2340Sources: Source[] = [
  { id: "s2340-1", url: "https://cs2340.gitlab.io", title: "CS 2340 Objects & Design Syllabus", kind: "syllabus", snippet: "Agile methodologies, sprint cycles, design patterns, and collaborative team project development.", foundBy: "syllabus-scout" },
  { id: "s2340-2", url: "https://reddit.com/r/gatech/comments/cs2340_team_advice", title: "r/gatech: 'Finding good teammates in CS 2340 is 90% of your grade'", kind: "reddit", snippet: "Student consensus on setting up GitHub branch protection and early weekly milestone checkpoints.", foundBy: "student-pulse" },
];

export const cs2340Pack: CoursePack = {
  course: { code: "CS 2340", title: "Objects and Design", school: "Georgia Tech" },
  summary: "Georgia Tech's collaborative software engineering introduction. Emphasizes Agile/Scrum lifecycles, Gang of Four design patterns, Git workflow discipline, unit testing, and team-based full-stack application delivery.",
  fearScore: 46,
  concepts: [
    { id: "agile-scrum", label: "Agile & Scrum Lifecycles", description: "Sprint planning, daily standups, backlog refinement, user stories, acceptance criteria, and sprint retrospectives.", unit: "Unit 1: Process" },
    { id: "git-collaboration", label: "Git Workflows & Branching Models", description: "Feature branches, pull request code reviews, conflict resolution, merge strategies, and CI/CD pipelines.", unit: "Unit 1: Process" },
    { id: "creational-patterns", label: "Creational Design Patterns (Singleton, Factory, Builder)", description: "Decoupling object instantiation from business logic; thread-safe singletons and extensible builder patterns.", unit: "Unit 2: Design Patterns" },
    { id: "structural-behavioral-patterns", label: "Structural & Behavioral Patterns (Observer, Strategy, Adapter)", description: "Loose coupling, event listeners, polymorphic runtime strategies, and interface compatibility wrappers.", unit: "Unit 2: Design Patterns" },
    { id: "clean-architecture-solid", label: "SOLID Principles & Clean Architecture", description: "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.", unit: "Unit 3: Architecture" },
    { id: "unit-integration-testing", label: "Unit Testing & Test-Driven Development (TDD)", description: "JUnit testing, mocking frameworks (Mockito), code coverage thresholds, and regression validation.", unit: "Unit 3: Architecture" },
  ],
  edges: [
    { from: "agile-scrum", to: "git-collaboration", relation: "prereq" },
    { from: "creational-patterns", to: "structural-behavioral-patterns", relation: "prereq" },
    { from: "structural-behavioral-patterns", to: "clean-architecture-solid", relation: "prereq" },
    { from: "clean-architecture-solid", to: "unit-integration-testing", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "clean-architecture-solid", frequency: 0.92, evidenceSourceIds: ["s2340-1"] },
    { conceptId: "structural-behavioral-patterns", frequency: 0.88, evidenceSourceIds: ["s2340-1"] },
    { conceptId: "creational-patterns", frequency: 0.85, evidenceSourceIds: ["s2340-1"] },
    { conceptId: "agile-scrum", frequency: 0.78, evidenceSourceIds: ["s2340-1"] },
  ],
  difficulty: [
    { conceptId: "git-collaboration", score: 0.55, quotes: [{ text: "Managing 5 students pushing to the same repository requires strict branch policies.", sourceId: "s2340-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Pick your group carefully. A cohesive team makes 2340 the most fun class you take in sophomore year.", sourceId: "s2340-2", sentiment: "positive" },
    { text: "Design patterns show up heavily in technical interviews—pay attention to Factory and Strategy patterns.", sourceId: "s2340-1", sentiment: "positive" },
  ],
  sources: cs2340Sources,
  professors: [{ name: "Dr. Bob Waters", email: "waters@cc.gatech.edu" }],
  tips: [
    "Establish clear sprint task assignments on Trello/GitHub Projects at the start of each sprint.",
    "Require at least one peer approval on pull requests before merging into main.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
