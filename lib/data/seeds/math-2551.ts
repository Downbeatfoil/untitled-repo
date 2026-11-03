/**
 * Lane: data
 * Seed pack for MATH 2551: Multivariable Calculus at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const math2551Sources: Source[] = [
  { id: "s2551-1", url: "https://math.gatech.edu/courses/math-2551", title: "MATH 2551 Course Syllabus & Guidelines", kind: "syllabus", snippet: "3D vectors, partial derivatives, multiple integrals, vector calculus, Green's and Stokes' theorems.", foundBy: "syllabus-scout" },
  { id: "s2551-2", url: "https://github.com/gt-archives/math-2551-past-exams", title: "MATH 2551 Midterm Archive", kind: "exam", snippet: "Calculations on Lagrange multipliers, spherical coordinate change of variables, and surface integrals.", foundBy: "exam-hunter" },
  { id: "s2551-3", url: "https://reddit.com/r/gatech/comments/math2551_stokes_theorem", title: "r/gatech: 'Stokes' theorem on the final exam is always a wild ride'", kind: "reddit", snippet: "Tips on setting up boundary orientations and calculating curl vectors correctly.", foundBy: "student-pulse" },
];

export const math2551Pack: CoursePack = {
  course: { code: "MATH 2551", title: "Multivariable Calculus", school: "Georgia Tech" },
  summary: "Calculus in two and three dimensions. Covers vector geometry, parametric curves, partial differentiation, directional derivatives, gradients, multiple integrals in polar/cylindrical/spherical coordinates, and vector field theorems.",
  fearScore: 69,
  concepts: [
    { id: "vectors-lines-planes", label: "3D Vectors, Dot/Cross Products & Planes", description: "Vector arithmetic, normal vectors, projections, symmetric and parametric equations of lines and planes in R3.", unit: "Unit 1: Geometry" },
    { id: "partial-derivatives-gradients", label: "Partial Derivatives, Gradients & Tangent Planes", description: "Limits in multivariable space, directional derivatives, gradient vector direction of steepest ascent, and linear approximations.", unit: "Unit 2: Differentiation" },
    { id: "multivariable-extrema-lagrange", label: "Critical Points & Lagrange Multipliers", description: "Hessian matrix second derivative test, saddle points, and constrained optimization with Lagrange multipliers.", unit: "Unit 2: Differentiation" },
    { id: "double-triple-integrals", label: "Double & Triple Integrals (Coordinate Transforms)", description: "Fubini's theorem, Jacobian determinants, transformations to polar, cylindrical, and spherical coordinates.", unit: "Unit 3: Integration" },
    { id: "vector-fields-line-integrals", label: "Vector Fields, Line Integrals & Conservative Fields", description: "Work integrals along curves, path independence, potential functions, and Fundamental Theorem of Line Integrals.", unit: "Unit 4: Vector Calculus" },
    { id: "greens-stokes-divergence", label: "Green's Theorem, Stokes' Theorem & Divergence Theorem", description: "Circulation and flux forms in 2D, curl and divergence in 3D, surface integrals, and orientation of boundary curves.", unit: "Unit 4: Vector Calculus" },
  ],
  edges: [
    { from: "vectors-lines-planes", to: "partial-derivatives-gradients", relation: "prereq" },
    { from: "partial-derivatives-gradients", to: "multivariable-extrema-lagrange", relation: "prereq" },
    { from: "partial-derivatives-gradients", to: "double-triple-integrals", relation: "prereq" },
    { from: "double-triple-integrals", to: "vector-fields-line-integrals", relation: "prereq" },
    { from: "vector-fields-line-integrals", to: "greens-stokes-divergence", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "greens-stokes-divergence", frequency: 0.96, evidenceSourceIds: ["s2551-2", "s2551-3"] },
    { conceptId: "double-triple-integrals", frequency: 0.92, evidenceSourceIds: ["s2551-2"] },
    { conceptId: "multivariable-extrema-lagrange", frequency: 0.88, evidenceSourceIds: ["s2551-2"] },
    { conceptId: "vector-fields-line-integrals", frequency: 0.84, evidenceSourceIds: ["s2551-2"] },
  ],
  difficulty: [
    { conceptId: "greens-stokes-divergence", score: 0.86, quotes: [{ text: "Choosing whether to integrate over the surface or along the boundary curve in Stokes' theorem is the crucial step.", sourceId: "s2551-3", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Memorize spherical coordinate transformations and the rho^2 sin(phi) Jacobian factor immediately.", sourceId: "s2551-2", sentiment: "positive" },
    { text: "Exam 3 and the final are very theorem-heavy. Practice verifying conservative vector fields.", sourceId: "s2551-1", sentiment: "positive" },
  ],
  sources: math2551Sources,
  professors: [{ name: "Dr. Sal Barone", email: "sbarone@math.gatech.edu" }],
  tips: [
    "Always sketch the 3D region of integration before setting up bounds for double or triple integrals.",
    "Remember the Jacobian factor: r for polar/cylindrical, and rho^2 sin(phi) for spherical coordinates.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
