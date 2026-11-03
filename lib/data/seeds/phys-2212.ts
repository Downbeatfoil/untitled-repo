/**
 * Lane: data
 * Seed pack for PHYS 2212: Intro Physics II (Electricity & Magnetism) at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const phys2212Sources: Source[] = [
  { id: "s2212-1", url: "https://physics.gatech.edu/courses/phys-2212", title: "PHYS 2212 Syllabus: Electricity, Magnetism & Optics", kind: "syllabus", snippet: "Calculus-based electromagnetism, Gauss's law, Ampere's law, Faraday's law, and AC circuits.", foundBy: "syllabus-scout" },
  { id: "s2212-2", url: "https://github.com/gt-archives/phys2212-past-exams", title: "PHYS 2212 Past Midterms & Conceptual Question Archive", kind: "exam", snippet: "Integration over non-uniform charge distributions, magnetic field loops, and right-hand rule problems.", foundBy: "exam-hunter" },
  { id: "s2212-3", url: "https://reddit.com/r/gatech/comments/phys2212_gauss_law", title: "r/gatech: 'PHYS 2212 Test 1 and 2 are historically the hardest'", kind: "reddit", snippet: "Tips on choosing Gaussian surfaces matching the symmetry of cylindrical and spherical charge densities.", foundBy: "student-pulse" },
];

export const phys2212Pack: CoursePack = {
  course: { code: "PHYS 2212", title: "Intro Physics II", school: "Georgia Tech" },
  summary: "Calculus-based classical electrodynamics and optics. Covers Coulomb's law, electric fields, Gauss's law, electric potential, capacitance, DC/AC circuits, magnetic forces, Ampere's law, Faraday induction, and electromagnetic waves.",
  fearScore: 82,
  concepts: [
    { id: "coulomb-electric-field", label: "Coulomb's Law & Continuous Charge Integrals", description: "Point charges, superposition principle, linear/surface/volume charge densities (lambda, sigma, rho), and field integrals.", unit: "Unit 1: Electrostatics" },
    { id: "gauss-law-flux", label: "Electric Flux & Gauss's Law", description: "Closed surface flux integrals, spherical, cylindrical, and planar symmetries, and conductor electrostatic equilibrium.", unit: "Unit 1: Electrostatics" },
    { id: "electric-potential-capacitance", label: "Electric Potential, Work & Capacitors", description: "Conservative electric fields, potential difference V = -int(E dot dl), capacitance, dielectric materials, and stored energy.", unit: "Unit 2: Potential & Circuits" },
    { id: "dc-circuits-rc", label: "Direct Current Circuits & RC Transients", description: "Kirchhoff's loop and junction rules, multi-loop circuit analysis, and exponential charging/discharging in RC circuits.", unit: "Unit 2: Potential & Circuits" },
    { id: "magnetic-fields-ampere", label: "Magnetic Forces, Biot-Savart & Ampere's Law", description: "Lorentz force F = q(v x B), current loops, torque on magnetic dipoles, Biot-Savart integration, and Ampere's circuital law.", unit: "Unit 3: Magnetism" },
    { id: "faraday-induction-maxwell", label: "Faraday's Law, Lenz's Law & Inductance", description: "Magnetic flux changes, induced EMF, Lenz's law opposing flux change, mutual and self-inductance, and Maxwell's displacement current.", unit: "Unit 4: Electrodynamics" },
  ],
  edges: [
    { from: "coulomb-electric-field", to: "gauss-law-flux", relation: "prereq" },
    { from: "gauss-law-flux", to: "electric-potential-capacitance", relation: "prereq" },
    { from: "electric-potential-capacitance", to: "dc-circuits-rc", relation: "prereq" },
    { from: "coulomb-electric-field", to: "magnetic-fields-ampere", relation: "related" },
    { from: "magnetic-fields-ampere", to: "faraday-induction-maxwell", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "gauss-law-flux", frequency: 0.96, evidenceSourceIds: ["s2212-2", "s2212-3"] },
    { conceptId: "faraday-induction-maxwell", frequency: 0.94, evidenceSourceIds: ["s2212-2"] },
    { conceptId: "coulomb-electric-field", frequency: 0.9, evidenceSourceIds: ["s2212-2"] },
    { conceptId: "magnetic-fields-ampere", frequency: 0.88, evidenceSourceIds: ["s2212-2"] },
  ],
  difficulty: [
    { conceptId: "gauss-law-flux", score: 0.88, quotes: [{ text: "Choosing the correct Gaussian surface and integrating non-uniform charge density lambda(r) is a rite of passage.", sourceId: "s2212-3", sentiment: "negative" }] },
    { conceptId: "faraday-induction-maxwell", score: 0.84, quotes: [{ text: "Right hand rules for induced currents in moving conducting bars trip up half the class on Exam 3.", sourceId: "s2212-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Do not underestimate Gauss's law. Practice the classic sphere inside a hollow conducting shell problems.", sourceId: "s2212-3", sentiment: "positive" },
    { text: "Right-hand rule for cross products must be second nature before taking Midterm 3.", sourceId: "s2212-2", sentiment: "positive" },
  ],
  sources: phys2212Sources,
  professors: [{ name: "Dr. Edwin Greco", email: "egreco@gatech.edu" }],
  tips: [
    "Always identify coordinate symmetries (spherical, cylindrical, planar) before setting up electric or magnetic integrals.",
    "For Lenz's law, ask: is the external flux increasing or decreasing? The induced field must oppose that change.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
