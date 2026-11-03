/**
 * Lane: data
 * Seed pack for CHEM 1310: General Chemistry at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const chem1310Sources: Source[] = [
  { id: "s1310-1", url: "https://chemistry.gatech.edu/courses/chem-1310", title: "CHEM 1310 General Chemistry Syllabus", kind: "syllabus", snippet: "Stoichiometry, atomic structure, bonding, thermodynamics, equilibrium, and electrochemistry.", foundBy: "syllabus-scout" },
  { id: "s1310-2", url: "https://github.com/gt-archives/chem1310-past-exams", title: "CHEM 1310 Practice Midterm & Final Archive", kind: "exam", snippet: "Archive of multiple choice questions covering ICE tables, buffer pH, and galvanic cell potentials.", foundBy: "exam-hunter" },
  { id: "s1310-3", url: "https://reddit.com/r/gatech/comments/chem1310_survival", title: "r/gatech: 'CHEM 1310 is manageable if you do practice problems weekly'", kind: "reddit", snippet: "Advice on mastering equilibrium ICE tables and redox balancing under time constraints.", foundBy: "student-pulse" },
];

export const chem1310Pack: CoursePack = {
  course: { code: "CHEM 1310", title: "General Chemistry", school: "Georgia Tech" },
  summary: "Comprehensive introduction to chemical principles for engineering and science majors. Covers stoichiometry, gas laws, atomic structure, molecular bonding, thermodynamics, chemical equilibrium, acid-base chemistry, and electrochemistry.",
  fearScore: 58,
  concepts: [
    { id: "stoichiometry-reactions", label: "Stoichiometry & Aqueous Reactions", description: "Molar ratios, limiting reactants, percent yield, precipitation, and redox reaction balancing via half-reactions.", unit: "Unit 1: Fundamentals" },
    { id: "atomic-structure-bonding", label: "Quantum Atomic Theory & Molecular Geometry", description: "Electron configurations, periodic trends, Lewis structures, formal charges, VSEPR theory, and hybridization.", unit: "Unit 2: Structure" },
    { id: "thermodynamics-thermochem", label: "Thermochemistry & Gibbs Free Energy", description: "Enthalpy of formation, Hess's law, calorimetry, entropy changes, and spontaneity criteria (Delta G = Delta H - T*Delta S).", unit: "Unit 3: Thermodynamics" },
    { id: "chemical-equilibrium-ice", label: "Chemical Equilibrium & ICE Tables", description: "Equilibrium constant expressions (Kc, Kp), Le Chatelier's principle, and reaction quotient Q vs K predictions.", unit: "Unit 4: Equilibrium" },
    { id: "acids-bases-buffers", label: "Acid-Base Equilibria & Buffer Systems", description: "Strong vs weak acids/bases, Ka/Kb calculations, Henderson-Hasselbalch equation, and titration curves.", unit: "Unit 4: Equilibrium" },
    { id: "electrochemistry-redox", label: "Electrochemistry & Galvanic Cells", description: "Standard reduction potentials, Nernst equation for non-standard cells, Faraday's laws, and electrolytic vs voltaic cells.", unit: "Unit 5: Electrochemistry" },
  ],
  edges: [
    { from: "stoichiometry-reactions", to: "atomic-structure-bonding", relation: "prereq" },
    { from: "atomic-structure-bonding", to: "thermodynamics-thermochem", relation: "prereq" },
    { from: "thermodynamics-thermochem", to: "chemical-equilibrium-ice", relation: "prereq" },
    { from: "chemical-equilibrium-ice", to: "acids-bases-buffers", relation: "prereq" },
    { from: "chemical-equilibrium-ice", to: "electrochemistry-redox", relation: "related" },
  ],
  examTopics: [
    { conceptId: "chemical-equilibrium-ice", frequency: 0.95, evidenceSourceIds: ["s1310-2"] },
    { conceptId: "acids-bases-buffers", frequency: 0.92, evidenceSourceIds: ["s1310-2"] },
    { conceptId: "electrochemistry-redox", frequency: 0.88, evidenceSourceIds: ["s1310-2"] },
    { conceptId: "thermodynamics-thermochem", frequency: 0.85, evidenceSourceIds: ["s1310-2"] },
  ],
  difficulty: [
    { conceptId: "acids-bases-buffers", score: 0.72, quotes: [{ text: "Calculating buffer pH after adding strong acid/base requires two distinct reaction steps.", sourceId: "s1310-3", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Dr. Evans makes chemistry approachable, but ICE tables on Test 3 require lots of practice.", sourceId: "s1310-3", sentiment: "positive" },
    { text: "The questions are conceptual and computational. Write down your units at every step.", sourceId: "s1310-1", sentiment: "positive" },
  ],
  sources: chem1310Sources,
  professors: [{ name: "Dr. Michael Evans", email: "mevans@gatech.edu" }],
  tips: [
    "Always check whether x is small enough (<5%) to approximate when solving quadratic equilibrium equations.",
    "Remember to balance electrons transferred (n) carefully in the Nernst equation.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
