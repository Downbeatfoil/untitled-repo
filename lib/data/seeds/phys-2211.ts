/**
 * Lane: data
 * Seed pack for PHYS 2211: Intro Physics I at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const phys2211Sources: Source[] = [
  {
    id: "s2211-1",
    url: "https://physics.gatech.edu/courses/phys-2211",
    title: "PHYS 2211 Official Syllabus & Lab Policy",
    kind: "syllabus",
    snippet: "Calculus-based introductory Newtonian mechanics, WebAssign homework policies, and video lab analysis.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s2211-2",
    url: "https://github.com/gt-archives/phys2211-past-exams",
    title: "PHYS 2211 Past Midterm Exams & Practice Problems",
    kind: "exam",
    snippet: "Archive of multiple choice questions featuring sign conventions, rotational torque, and energy conservation.",
    foundBy: "exam-hunter",
  },
  {
    id: "s2211-3",
    url: "https://reddit.com/r/gatech/comments/phys2211_rotational_motion",
    title: "r/gatech: 'Rotational motion on PHYS 2211 Test 3 is brutal'",
    kind: "reddit",
    snippet: "Student discussion on calculating moment of inertia using parallel axis theorem under test pressure.",
    foundBy: "student-pulse",
  },
];

export const phys2211Pack: CoursePack = {
  course: { code: "PHYS 2211", title: "Intro Physics I", school: "Georgia Tech" },
  summary: "Calculus-based classical mechanics covering kinematics, Newton's laws of motion, work-energy theorem, momentum conservation in collisions, rotational dynamics, torque, and simple harmonic motion.",
  fearScore: 66,
  concepts: [
    { id: "kinematics", label: "1D & 2D Kinematics", description: "Position, velocity, acceleration vectors, projectile motion, and integration of non-constant acceleration.", unit: "Unit 1: Motion" },
    { id: "newtons-laws", label: "Newton's Laws & Force Diagrams", description: "Free-body diagrams, static vs kinetic friction, tension in pulleys, and centripetal acceleration in circular motion.", unit: "Unit 2: Forces" },
    { id: "work-energy", label: "Work, Kinetic Energy & Potential Energy", description: "Work-energy theorem, conservative vs non-conservative forces, potential energy curves, and mechanical energy conservation.", unit: "Unit 3: Energy" },
    { id: "momentum-collisions", label: "Linear Momentum & Collisions", description: "Center of mass, impulse-momentum theorem, and 1D/2D elastic and inelastic collisions.", unit: "Unit 4: Momentum" },
    { id: "rotational-dynamics", label: "Rotational Kinematics, Torque & Moment of Inertia", description: "Angular displacement/velocity/acceleration, torque tau = r x F, parallel axis theorem, and rolling without slipping.", unit: "Unit 5: Rotation" },
    { id: "angular-momentum-shm", label: "Angular Momentum & Simple Harmonic Motion", description: "Conservation of angular momentum L = I*omega, pendulum equations of motion, and mass-spring harmonic oscillations.", unit: "Unit 6: Oscillations" },
  ],
  edges: [
    { from: "kinematics", to: "newtons-laws", relation: "prereq" },
    { from: "newtons-laws", to: "work-energy", relation: "prereq" },
    { from: "newtons-laws", to: "momentum-collisions", relation: "prereq" },
    { from: "work-energy", to: "rotational-dynamics", relation: "related" },
    { from: "rotational-dynamics", to: "angular-momentum-shm", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "rotational-dynamics", frequency: 0.95, evidenceSourceIds: ["s2211-2", "s2211-3"] },
    { conceptId: "newtons-laws", frequency: 0.9, evidenceSourceIds: ["s2211-2"] },
    { conceptId: "work-energy", frequency: 0.85, evidenceSourceIds: ["s2211-2"] },
    { conceptId: "angular-momentum-shm", frequency: 0.75, evidenceSourceIds: ["s2211-2"] },
  ],
  difficulty: [
    { conceptId: "rotational-dynamics", score: 0.85, quotes: [{ text: "Rolling with slipping vs without slipping always produces tricks with friction direction on Test 3.", sourceId: "s2211-3", sentiment: "negative" }] },
  ],
  studentQuotes: [
    { text: "Always start every problem with a clear Free Body Diagram. Half the errors come from missing normal force components on an incline.", sourceId: "s2211-1", sentiment: "positive" },
    { text: "The exams are very similar year-to-year. Drill the practice tests from previous semesters.", sourceId: "s2211-2", sentiment: "positive" },
  ],
  sources: phys2211Sources,
  professors: [{ name: "Dr. Paul Kennedy", email: "pkennedy@gatech.edu" }],
  tips: [
    "Always draw a coordinate system and label positive directions explicitly before writing F = ma.",
    "Pay special attention to rolling without slipping: a = alpha * R connects translational and rotational motion.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
