/**
 * Lane: data
 * Seed pack for CS 4641: Machine Learning at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs4641Sources: Source[] = [
  { id: "s4641-1", url: "https://omscs.gatech.edu/cs-7641-machine-learning", title: "CS 4641/7641 Machine Learning Syllabus", kind: "syllabus", snippet: "Supervised learning, unsupervised learning, reinforcement learning, and neural network foundations.", foundBy: "syllabus-scout" },
  { id: "s4641-2", url: "https://github.com/gt-archives/cs4641-exam-prep", title: "CS 4641 Past Exam Questions & Math Derivations", kind: "exam", snippet: "Derivations for linear regression gradient descent, SVM Lagrange multipliers, and PCA variance maximization.", foundBy: "exam-hunter" },
  { id: "s4641-3", url: "https://reddit.com/r/gatech/comments/cs4641_tips", title: "r/gatech: 'CS 4641 is very math heavy, review linear algebra and multivariable calculus'", kind: "reddit", snippet: "Students advise brushing up on partial derivatives, matrix transposes, and eigenvalues before week 1.", foundBy: "student-pulse" },
];

export const cs4641Pack: CoursePack = {
  course: { code: "CS 4641", title: "Machine Learning", school: "Georgia Tech" },
  summary: "Comprehensive introduction to statistical machine learning algorithms and theory. Explores linear/logistic regression, decision trees, support vector machines, neural networks, clustering, dimensionality reduction, and reinforcement learning.",
  fearScore: 74,
  concepts: [
    { id: "linear-logistic-regression", label: "Linear & Logistic Regression", description: "Loss functions (MSE, Cross-Entropy), closed-form Normal Equations, batch and stochastic gradient descent, and L1/L2 regularization.", unit: "Unit 1: Supervised Learning" },
    { id: "decision-trees-ensembles", label: "Decision Trees, Random Forests & Boosting", description: "Information Gain, Gini impurity, entropy, bagging vs boosting paradigms (AdaBoost, Gradient Boost).", unit: "Unit 1: Supervised Learning" },
    { id: "support-vector-machines", label: "Support Vector Machines (SVM) & Kernel Trick", description: "Max-margin hyperplanes, primal and dual formulations, slack variables, and RBF kernel mappings.", unit: "Unit 1: Supervised Learning" },
    { id: "neural-networks-backprop", label: "Multi-Layer Perceptrons & Backpropagation", description: "Activation functions (ReLU, Sigmoid), chain rule gradient flow, forward/backward passes, and optimizer dynamics.", unit: "Unit 2: Deep Learning" },
    { id: "clustering-pca", label: "Clustering (K-Means, GMMs) & PCA", description: "Expectation-Maximization, covariance matrices, principal component projections, and reconstruction error.", unit: "Unit 3: Unsupervised Learning" },
    { id: "reinforcement-learning", label: "Markov Decision Processes & Q-Learning", description: "States, actions, rewards, Bellman optimality equation, value iteration, policy iteration, and temporal difference learning.", unit: "Unit 4: Reinforcement Learning" },
  ],
  edges: [
    { from: "linear-logistic-regression", to: "decision-trees-ensembles", relation: "related" },
    { from: "linear-logistic-regression", to: "support-vector-machines", relation: "prereq" },
    { from: "linear-logistic-regression", to: "neural-networks-backprop", relation: "prereq" },
    { from: "linear-logistic-regression", to: "clustering-pca", relation: "related" },
    { from: "neural-networks-backprop", to: "reinforcement-learning", relation: "related" },
  ],
  examTopics: [
    { conceptId: "support-vector-machines", frequency: 0.94, evidenceSourceIds: ["s4641-2"] },
    { conceptId: "neural-networks-backprop", frequency: 0.9, evidenceSourceIds: ["s4641-2"] },
    { conceptId: "clustering-pca", frequency: 0.86, evidenceSourceIds: ["s4641-2"] },
    { conceptId: "linear-logistic-regression", frequency: 0.82, evidenceSourceIds: ["s4641-2"] },
  ],
  difficulty: [
    { conceptId: "support-vector-machines", score: 0.82, quotes: [{ text: "Hand-calculating the support vector margin with soft slack variables is a classic exam question.", sourceId: "s4641-2", sentiment: "neutral" }] },
    { conceptId: "neural-networks-backprop", score: 0.78, quotes: [{ text: "Tracing backpropagation matrix dimensions across 3 layers by hand requires careful index tracking.", sourceId: "s4641-3", sentiment: "negative" }] },
  ],
  studentQuotes: [
    { text: "The projects are in Python with PyTorch/scikit-learn, but exams test the mathematical foundations and proofs.", sourceId: "s4641-3", sentiment: "positive" },
    { text: "Make sure you understand PCA eigenvalue decomposition—it bridges 1554 linear algebra and ML.", sourceId: "s4641-2", sentiment: "positive" },
  ],
  sources: cs4641Sources,
  professors: [{ name: "Dr. Mahdi Roozbahani", email: "mahdi.roozbahani@gatech.edu" }],
  tips: [
    "Know how to derive gradient descent update rules from first principles using vector calculus.",
    "Practice calculating Information Gain and Gini Impurity splits on small sample datasets by hand.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
