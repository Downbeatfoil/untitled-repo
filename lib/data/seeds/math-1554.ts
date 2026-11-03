/**
 * Lane: data
 * Seed pack for MATH 1554: Linear Algebra at Georgia Tech.
 * Demo-quality pass: 15 sources, rich student quotes, sharp tips.
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
    title: "MATH 1554 Public Past Exam Archive: Midterms 1, 2, 3 & Final",
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
  {
    id: "s1554-5",
    url: "https://github.com/gt-archives/math-1554-midterm1-solutions",
    title: "MATH 1554 Midterm 1 Solutions: RREF, Span & Free Variables",
    kind: "exam",
    snippet: "Past exam 1 answer keys demonstrating rigorous formatting for parametric vector forms of linear solutions.",
    foundBy: "exam-hunter",
  },
  {
    id: "s1554-6",
    url: "https://github.com/gt-archives/math-1554-midterm2-solutions",
    title: "MATH 1554 Midterm 2 Solutions: Invertible Matrix Theorem & Determinants",
    kind: "exam",
    snippet: "Exam 2 walkthroughs illustrating proofs of matrix invertibility and column space subspace tests.",
    foundBy: "exam-hunter",
  },
  {
    id: "s1554-7",
    url: "https://github.com/gt-archives/math-1554-midterm3-solutions",
    title: "MATH 1554 Midterm 3 Solutions: Eigenvalues, Diagonalization & SVD",
    kind: "exam",
    snippet: "Step-by-step calculations for characteristic polynomials, algebraic vs geometric multiplicities, and Gram-Schmidt.",
    foundBy: "exam-hunter",
  },
  {
    id: "s1554-8",
    url: "https://math.gatech.edu/practice-worksheets/imt-drill",
    title: "Official GT Practice Drill: 18 Statements of the Invertible Matrix Theorem",
    kind: "practice",
    snippet: "Worksheet testing quick recall of equivalences: det(A) != 0 <=> Nul A = {0} <=> Col A = R^n <=> rank A = n.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s1554-9",
    url: "https://math.gatech.edu/practice-worksheets/gram-schmidt-orthogonal",
    title: "Official GT Practice Drill: Orthogonal Projections & Least Squares",
    kind: "practice",
    snippet: "Orthogonal decomposition theorem, projection formula y_hat = sum((y dot u_i)/(u_i dot u_i) * u_i), and QR factorizations.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s1554-10",
    url: "https://reddit.com/r/gatech/comments/1554_midterm2_cliff",
    title: "r/gatech: 'Midterm 2 in 1554 is where people drop letter grades'",
    kind: "reddit",
    snippet: "Upperclassmen advice on how to spot subtle false conditions in matrix transformation questions.",
    foundBy: "student-pulse",
  },
  {
    id: "s1554-11",
    url: "https://x.com/gt_math_sufferer/status/1718000000000000000",
    title: "GT Student Post on X: Eigenvector Trap Reaction",
    kind: "x",
    snippet: "'Just spent 35 minutes calculating det(A - lambda I) only to realize my row operation in step 2 had an arithmetic error.'",
    foundBy: "student-pulse",
  },
  {
    id: "s1554-12",
    url: "https://x.com/gatech_stem/status/1721000000000000000",
    title: "GT Student Post on X: SVD Intuition",
    kind: "x",
    snippet: "'SVD A = U Sigma V^T: rotate, stretch along axes by singular values, rotate again. Best visual concept of the course.'",
    foundBy: "student-pulse",
  },
  {
    id: "s1554-13",
    url: "https://notes.gt-cs.net/math1554/master-cheat-sheet",
    title: "GT Student Study Guide: Complete IMT & Subspace Theorem Reference",
    kind: "notes",
    snippet: "Student summary sheet detailing rank-nullity theorem, basis extraction from pivot columns of original matrix, and projection matrices.",
    foundBy: "concept-mapper",
  },
  {
    id: "s1554-14",
    url: "https://math.gatech.edu/courses/math-1554/studio-manual",
    title: "MATH 1554 Studio Manual & Collaborative Problem Sets",
    kind: "course-page",
    snippet: "Weekly studio group problems focusing on counterexample construction for abstract linear mappings.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s1554-15",
    url: "https://github.com/gt-archives/math-1554-final-exam-comprehensive",
    title: "MATH 1554 Comprehensive Final Exam Review Archive",
    kind: "exam",
    snippet: "Full 3-hour practice final exams covering the entire breadth of linear algebra from RREF through full SVD.",
    foundBy: "exam-hunter",
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
    { conceptId: "eigenvalues-eigenvectors", frequency: 0.96, evidenceSourceIds: ["s1554-2", "s1554-7"] },
    { conceptId: "invertible-matrix-theorem", frequency: 0.92, evidenceSourceIds: ["s1554-2", "s1554-3", "s1554-8"] },
    { conceptId: "subspaces-null-col", frequency: 0.88, evidenceSourceIds: ["s1554-2", "s1554-6"] },
    { conceptId: "orthogonality-gram-schmidt", frequency: 0.84, evidenceSourceIds: ["s1554-2", "s1554-9"] },
    { conceptId: "matrix-transformations", frequency: 0.8, evidenceSourceIds: ["s1554-2", "s1554-5"] },
    { conceptId: "least-squares-svd", frequency: 0.78, evidenceSourceIds: ["s1554-7", "s1554-12"] },
  ],
  difficulty: [
    {
      conceptId: "invertible-matrix-theorem",
      score: 0.88,
      quotes: [
        { text: "The True/False questions will give you 5 subtly different statements about Col A and nullity; one false word ruins the question.", sourceId: "s1554-3", sentiment: "negative" },
        { text: "Memorize the IMT like your GPA depends on it, because it literally does.", sourceId: "s1554-10", sentiment: "neutral" },
      ],
    },
    {
      conceptId: "eigenvalues-eigenvectors",
      score: 0.82,
      quotes: [
        { text: "Diagonalization arithmetic is easy to mess up, but geometric multiplicity vs algebraic multiplicity is what catches people.", sourceId: "s1554-2", sentiment: "neutral" },
        { text: "One row operation sign error in det(A - lambda*I) invalidates the whole problem.", sourceId: "s1554-11", sentiment: "negative" },
      ],
    },
    {
      conceptId: "least-squares-svd",
      score: 0.79,
      quotes: [
        { text: "SVD has so many moving parts (A^T A eigenvalues, singular values, orthonormal basis) you must work methodically.", sourceId: "s1554-12", sentiment: "neutral" },
      ],
    },
  ],
  studentQuotes: [
    { text: "Know the Invertible Matrix Theorem inside and out. It links every single unit together.", sourceId: "s1554-3", sentiment: "positive" },
    { text: "The interactive online textbook (ILA) with Rabinoff animations is the cleanest way to visualize vector projections.", sourceId: "s1554-4", sentiment: "positive" },
    { text: "Dr. Margalit's past midterms are the best study resource. Do every single past exam posted on the archive.", sourceId: "s1554-2", sentiment: "positive" },
    { text: "True/False questions are where the curve is decided. Always test 0-matrix, identity, and non-square transformations.", sourceId: "s1554-10", sentiment: "neutral" },
    { text: "Studio sessions with TAs are gold for catching conceptual misunderstandings before exam week.", sourceId: "s1554-14", sentiment: "positive" },
  ],
  sources: math1554Sources,
  professors: [
    { name: "Dr. Dan Margalit", email: "margalit@math.gatech.edu" },
    { name: "Dr. Joe Rabinoff", email: "rabinoff@math.gatech.edu" },
  ],
  tips: [
    "Memorize all 18+ equivalent statements of the Invertible Matrix Theorem for n x n square matrices cold.",
    "Practice finding counterexamples for True/False questions (e.g. non-square matrices, zero matrices, projection matrices).",
    "Double check row reduction arithmetic: one arithmetic error in step 1 invalidates the entire eigenspace.",
    "When computing basis for Col A, always take the pivot columns from the ORIGINAL matrix A, not the row-reduced matrix.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
