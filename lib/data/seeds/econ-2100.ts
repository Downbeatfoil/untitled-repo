/**
 * Lane: data
 * Seed pack for ECON 2100: Economic Analysis and Policy at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const econ2100Sources: Source[] = [
  { id: "s2100-1", url: "https://econ.gatech.edu/courses/econ-2100", title: "ECON 2100 Syllabus: Economic Analysis & Policy", kind: "syllabus", snippet: "Microeconomic decision-making, market equilibrium, government policy, and macroeconomic indicators.", foundBy: "syllabus-scout" },
  { id: "s2100-2", url: "https://github.com/gt-archives/econ2100-practice-exams", title: "ECON 2100 Practice Midterms & Graphical Shifts Archive", kind: "exam", snippet: "Supply and demand curve shifts, price elasticity calculations, and deadweight loss triangles.", foundBy: "exam-hunter" },
  { id: "s2100-3", url: "https://reddit.com/r/gatech/comments/econ2100_tips", title: "r/gatech: 'ECON 2100 is great for balancing a heavy STEM semester'", kind: "reddit", snippet: "Student consensus: intuitive graphical models, manageable homework, and clear exam formats.", foundBy: "student-pulse" },
];

export const econ2100Pack: CoursePack = {
  course: { code: "ECON 2100", title: "Economic Analysis and Policy", school: "Georgia Tech" },
  summary: "Introduction to fundamental economic principles and policy analysis for engineers. Covers microeconomic market dynamics, elasticity, consumer surplus, market failures, monopoly pricing, and macroeconomic indicators (GDP, inflation, fiscal policy).",
  fearScore: 42,
  concepts: [
    { id: "supply-demand-equilibrium", label: "Supply, Demand & Market Equilibrium", description: "Demand schedules, supply curves, equilibrium price/quantity, shortages, and surpluses.", unit: "Unit 1: Markets" },
    { id: "elasticity-consumer-surplus", label: "Price Elasticity & Welfare Economics", description: "Price elasticity of demand, income elasticity, cross-price elasticity, consumer and producer surplus, and deadweight loss.", unit: "Unit 1: Markets" },
    { id: "market-structures-monopoly", label: "Market Structures (Perfect Competition & Monopoly)", description: "Marginal revenue, marginal cost, profit maximization (MR = MC), deadweight loss of monopoly, and price discrimination.", unit: "Unit 2: Firms" },
    { id: "externalities-public-goods", label: "Market Failures, Externalities & Public Goods", description: "Negative/positive externalities, Pigouvian taxes, Coase theorem, non-excludability, and the free-rider problem.", unit: "Unit 2: Firms" },
    { id: "macro-indicators-policy", label: "Macroeconomic Indicators & Monetary/Fiscal Policy", description: "Gross Domestic Product (GDP), Consumer Price Index (CPI), unemployment rate, Federal Reserve interest rate tools, and fiscal stimulus.", unit: "Unit 3: Macroeconomics" },
  ],
  edges: [
    { from: "supply-demand-equilibrium", to: "elasticity-consumer-surplus", relation: "prereq" },
    { from: "elasticity-consumer-surplus", to: "market-structures-monopoly", relation: "prereq" },
    { from: "supply-demand-equilibrium", to: "externalities-public-goods", relation: "related" },
    { from: "supply-demand-equilibrium", to: "macro-indicators-policy", relation: "related" },
  ],
  examTopics: [
    { conceptId: "elasticity-consumer-surplus", frequency: 0.95, evidenceSourceIds: ["s2100-2"] },
    { conceptId: "supply-demand-equilibrium", frequency: 0.92, evidenceSourceIds: ["s2100-2"] },
    { conceptId: "market-structures-monopoly", frequency: 0.88, evidenceSourceIds: ["s2100-2"] },
    { conceptId: "macro-indicators-policy", frequency: 0.8, evidenceSourceIds: ["s2100-1"] },
  ],
  difficulty: [
    { conceptId: "elasticity-consumer-surplus", score: 0.52, quotes: [{ text: "Calculating deadweight loss after a tax or quota requires drawing the triangles clearly.", sourceId: "s2100-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "ECON 2100 is very intuitive once you get comfortable reading supply and demand graphs.", sourceId: "s2100-3", sentiment: "positive" },
    { text: "Midterm exams are multiple choice with graphical interpretations. Very straightforward.", sourceId: "s2100-2", sentiment: "positive" },
  ],
  sources: econ2100Sources,
  professors: [{ name: "Dr. Matthew Higgins", email: "mhiggins@econ.gatech.edu" }],
  tips: [
    "Always draw the supply and demand curves and clearly label the pre-tax and post-tax equilibrium points.",
    "Remember the midpoint formula for calculating price elasticity between two price-quantity points.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
