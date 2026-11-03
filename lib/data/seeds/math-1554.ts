/**
 * Lane: data
 * Seed pack for MATH 1554: Linear Algebra at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const math1554Sources: Source[] = [
  {
    id: "s1554-1",
    url: "https://math.gatech.edu/courses/math-1554",
    title: "MATH 1554 Master Syllabus & Course Guidelines",
    kind: "syllabus",
    snippet: "Official Georgia Tech School of Math syllabus covering vector equations, transformations, eigenvalues, and SVD.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s1554-2",
    url: "https://github.com/gt-archives/math-1554-past-midterms",
    title: "MATH 1554 Public Past Exam Archive: Midterm 1, 2, 3 & Final",
    kind: "exam",
    snippet: "High-frequency exam archive featuring the ubiquitous True/False conceptual justification questions.",
    foundBy: "exam-hunter",
  },
  {
    id: "s1554-3",
    url: "https://reddit.com/r/gatech/comments/math1554_tf_questions_guide",
    title: "r/gatech: 'How to conquer MATH 1554 True/False questions'",
    kind: "reddit",
    snippet: "Discussion on using counterexamples, dimension theorems, and the Invertible Matrix Theorem to avoid traps.",
    foundBy: "student-pulse",
  },
  {
    id: "s1554-4",
    url: "https://math.gatech.edu/interactive-linear-algebra",
    title: "Interactive Linear Algebra (Margalit & Rabinoff textbook)",
    kind: "course-page",
    snippet: "Georgia Tech's custom online interactive textbook with live Geogebra visualizations of transformations and span.",
    foundBy: "concept-mapper",
  },
];

export const math1554Pack: CoursePack = {
  course: {
    code: "MATH 1554",
    title: "Linear Algebra",
    school: "Georgia Tech",
  },
  summary:
    "An intense introduction to linear algebra balancing algorithmic matrix computation (row reductions, determinants) with abstract conceptual proofs, spanning spaces, basis dimension, eigenvalues, and orthogonality.",
  fearScore: 71,
  concepts: [
    { id: "systems-rref", label: "Systems of Linear Equations & RREF", description: "Augmented matrices, Gaussian elimination, pivot positions, and free variables determining solution sets.", unit: "Unit 1: Linear Systems" },
    { id: "vector-span-independence", label: "Vector Equations, Span & Linear Independence", description: "Linear combinations, span of vector sets, homogeneous systems Ax = 0, and non-trivial linear dependence relations.", unit: "Unit 1: Linear Systems" },
    { id: "matrix-transformations", label: "Matrix Transformations (One-to-One & Onto)", description: "Standard matrix of linear transformations, domain and codomain mappings, injectivity, and surjectivity.", unit: "Unit 2: Matrix Algebra" },
    { id: "invertible-matrix-theorem", label: "Matrix Inverses & Invertible Matrix Theorem", description: "Algorithm for computing A^-1, properties of invertible matrices, and the 18+ equivalent IMT statements.", unit: "Unit 2: Matrix Algebra" },
    { id: "subspaces-null-col", label: "Vector Subspaces, Nul A, Col A & Rank", description: "Subspace criteria, basis construction for null space and column space, and the Rank-Nullity theorem.", unit: "Unit 3: Vector Spaces" },
    { id: "eigenvalues-eigenvectors", label: "Eigenvalues, Eigenvectors & Diagonalization", description: "Characteristic equation det(A - lambda*I) = 0, eigenspaces, geometric vs algebraic multiplicity, and matrix diagonalization A = PDP^-1.", unit: "Unit 4: Eigenvalues" },
    { id: "orthogonality-gram-schmidt", label: "Orthogonality, Projections & Gram-Schmidt", description: "Inner products, orthogonal complements, orthogonal projections onto subspaces, and the Gram-Schmidt orthonormalization process.", unit: "Unit 5: Orthogonality" },
    { id: "least-squares-svd", label: "Least Squares & Singular Value Decomposition (SVD)", description: "Normal equations A^T A x = A^T b for inconsistent systems, singular values, and full/compact SVD decompositions.", unit: "Unit 5: Orthogonality" },
  ],
  edges: [
    { from: "systems-rref", to: "vector-span-independence", relation: "prereq" },
    { from: "vector-span-independence", to: "matrix-transformations", relation: "prereq" },
    { from: "matrix-transformations", to: "invertible-matrix-theorem", relation: "prereq" },
    { from: "vector-span-independence", to: "subspaces-null-col", relation: "prereq" },
    { from: "invertible-matrix-theorem", to: "subspaces-null-col", relation: "related" },
    { from: "subspaces-null-col", to: "eigenvalues-eigenvectors", relation: "prereq" },
    { from: "eigenvalues-eigenvectors", to: "orthogonality-gram-schmidt", relation: "related" },
    { from: "orthogonality-gram-schmidt", to: "least-squares-svd", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "eigenvalues-eigenvectors", frequency: 0.96, evidenceSourceIds: ["s1554-2"] },
    { conceptId: "invertible-matrix-theorem", frequency: 0.92, evidenceSourceIds: ["s1554-2", "s1554-3"] },
    { conceptId: "subspaces-null-col", frequency: 0.88, evidenceSourceIds: ["s1554-2"] },
    { conceptId: "orthogonality-gram-schmidt", frequency: 0.84, evidenceSourceIds: ["s1554-2"] },
    { conceptId: "matrix-transformations", frequency: 0.8, evidenceSourceIds: ["s1554-2"] },
  ],
  difficulty: [
    {
      conceptId: "invertible-matrix-theorem",
      score: 0.85,
      quotes: [{ text: "The True/False questions will give you 5 subtly different statements about Col A and nullity; one false word ruins the question.", sourceId: "s1554-3", sentiment: "negative" }],
    },
    {
      conceptId: "eigenvalues-eigenvectors",
      score: 0.82,
      quotes: [{ text: "Diagonalization arithmetic is easy to mess up, but geometric multiplicity vs algebraic multiplicity is what catches people.", sourceId: "s1554-2", sentiment: "neutral" }],
    },
  ],
  studentQuotes: [
    { text: "Know the Invertible Matrix Theorem inside and out. It links every single unit together.", sourceId: "s1554-3", sentiment: "positive" },
    { text: "The interactive online textbook (ILA) with Rabinoff animations is the cleanest way to visualize vector projections.", sourceId: "s1554-4", sentiment: "positive" },
    { text: "Dr. Margalit's past midterms are the best study resource. Do every single past exam posted on the archive.", sourceId: "s1554-2", sentiment: "positive" },
  ],
  sources: math1554Sources,
  professors: [
    { name: "Dr. Dan Margalit", email: "margalit@math.gatech.edu" },
    { name: "Dr. Joe Rabinoff", email: "rabinoff@math.gatech.edu" },
  ],
  tips: [
    "Memorize all 18+ equivalent statements of the Invertible Matrix Theorem for n x n matrices.",
    "Practice finding counterexamples for True/False questions (e.g. non-square matrices, zero matrices, projection matrices).",
    "Double check row reduction arithmetic: one arithmetic error in step 1 invalidates the entire eigenspace.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
