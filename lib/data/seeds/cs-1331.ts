/**
 * Lane: data
 * Seed pack for CS 1331: Introduction to Object-Oriented Programming at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs1331Sources: Source[] = [
  {
    id: "s1331-1",
    url: "https://cs1331.gitlab.io",
    title: "CS 1331 Official Course Portal & Java Style Guide",
    kind: "syllabus",
    snippet: "Covers Java syntax, object-oriented principles, checkstyle rules, and weekly coding assignments.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s1331-2",
    url: "https://github.com/gt-archives/cs1331-sample-exam2",
    title: "CS 1331 Sample Midterm 2: Polymorphism, Abstract Classes & Interfaces",
    kind: "exam",
    snippet: "Traces dynamic method dispatch, casting exceptions, and interface contract implementations.",
    foundBy: "exam-hunter",
  },
  {
    id: "s1331-3",
    url: "https://reddit.com/r/gatech/comments/cs1331_checkstyle_tips",
    title: "r/gatech: 'Checkstyle penalties will silently destroy your HW grades'",
    kind: "reddit",
    snippet: "Tips on setting up checkstyle in VS Code/IntelliJ so students don't lose points for indentation or line length.",
    foundBy: "student-pulse",
  },
];

export const cs1331Pack: CoursePack = {
  course: { code: "CS 1331", title: "Intro to Object-Oriented Programming", school: "Georgia Tech" },
  summary: "Georgia Tech's entry point to Java and object-oriented paradigms. Emphasizes clean class hierarchy design, strict checkstyle conformance, interfaces, polymorphism, exception handling, and JavaFX event-driven GUI development.",
  fearScore: 52,
  concepts: [
    { id: "java-basics", label: "Java Syntax, Primitives & Control Flow", description: "Variables, primitive types vs references, loops, arrays, and standard input/output.", unit: "Unit 1: Foundations" },
    { id: "classes-objects", label: "Classes, Objects & Encapsulation", description: "Constructors, instance variables, getter/setter methods, visibility modifiers (private, protected, public), and this reference.", unit: "Unit 1: Foundations" },
    { id: "inheritance", label: "Inheritance & Method Overriding", description: "Extending superclasses, method overriding vs overloading, super keyword, and the Object class root hierarchy.", unit: "Unit 2: OOP Principles" },
    { id: "polymorphism-interfaces", label: "Polymorphism, Abstract Classes & Interfaces", description: "Compile-time types vs runtime types, dynamic method lookup, abstract method enforcement, and Comparable/Comparator.", unit: "Unit 2: OOP Principles" },
    { id: "exceptions", label: "Exceptions & Error Handling", description: "Checked vs unchecked exceptions, try-catch-finally blocks, throwing custom exceptions, and exception propagation.", unit: "Unit 3: Robust Design" },
    { id: "generics-collections", label: "Generics & Collections Framework", description: "Type parameters <T>, ArrayList, LinkedList, HashMap, HashSet, and iterator patterns.", unit: "Unit 3: Robust Design" },
    { id: "javafx-lambdas", label: "JavaFX & Event-Driven UI", description: "Layout panes, stage/scene hierarchy, action event handlers, and anonymous inner classes / lambda expressions.", unit: "Unit 4: GUI" },
  ],
  edges: [
    { from: "java-basics", to: "classes-objects", relation: "prereq" },
    { from: "classes-objects", to: "inheritance", relation: "prereq" },
    { from: "inheritance", to: "polymorphism-interfaces", relation: "prereq" },
    { from: "classes-objects", to: "exceptions", relation: "prereq" },
    { from: "polymorphism-interfaces", to: "generics-collections", relation: "prereq" },
    { from: "polymorphism-interfaces", to: "javafx-lambdas", relation: "related" },
  ],
  examTopics: [
    { conceptId: "polymorphism-interfaces", frequency: 0.94, evidenceSourceIds: ["s1331-2"] },
    { conceptId: "inheritance", frequency: 0.9, evidenceSourceIds: ["s1331-2"] },
    { conceptId: "generics-collections", frequency: 0.8, evidenceSourceIds: ["s1331-1"] },
    { conceptId: "exceptions", frequency: 0.75, evidenceSourceIds: ["s1331-2"] },
  ],
  difficulty: [
    { conceptId: "polymorphism-interfaces", score: 0.68, quotes: [{ text: "Dynamic dispatch questions with superclass reference pointing to subclass instance trip up everyone on Exam 2.", sourceId: "s1331-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Run checkstyle before every single homework submission. Those 5-point penalties add up fast.", sourceId: "s1331-3", sentiment: "negative" },
    { text: "Dr. Simpkins gives very clear lectures. If you follow the live coding examples, exams are very predictable.", sourceId: "s1331-1", sentiment: "positive" },
  ],
  sources: cs1331Sources,
  professors: [{ name: "Dr. Chris Simpkins", email: "simpkins@gatech.edu" }],
  tips: [
    "Always distinguish compile-time reference type from runtime object type when predicting method calls.",
    "Automate your checkstyle check inside your IDE before pushing any homework code.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
