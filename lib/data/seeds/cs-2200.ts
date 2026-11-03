/**
 * Lane: data
 * Seed pack for CS 2200: Systems and Networks at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs2200Sources: Source[] = [
  { id: "s2200-1", url: "https://cs2200.gatech.edu/syllabus", title: "CS 2200 Systems & Networks Syllabus", kind: "syllabus", snippet: "Processor architecture, pipelining, virtual memory, operating systems, and networking.", foundBy: "syllabus-scout" },
  { id: "s2200-2", url: "https://github.com/gt-archives/cs2200-exam-archive", title: "CS 2200 Midterm 1 & 2 Archive", kind: "exam", snippet: "Detailed problems on multi-stage pipeline hazards and two-level virtual page table address translation.", foundBy: "exam-hunter" },
  { id: "s2200-3", url: "https://reddit.com/r/gatech/comments/cs2200_vm_project", title: "r/gatech: 'CS 2200 Project 3 Virtual Memory is a rite of passage'", kind: "reddit", snippet: "Advice on handling page faults, TLB evictions, and clock replacement algorithms.", foundBy: "student-pulse" },
];

export const cs2200Pack: CoursePack = {
  course: { code: "CS 2200", title: "Systems and Networks", school: "Georgia Tech" },
  summary: "Comprehensive exploration of computer systems architecture and OS concepts. Explores pipelined datapaths, multi-level virtual memory, process scheduling, inter-process communication, and TCP/IP networking protocols.",
  fearScore: 86,
  concepts: [
    { id: "pipelining-hazards", label: "Pipelined Datapaths & Hazards", description: "5-stage pipeline (IF, ID, EX, MEM, WB), data hazards with forwarding, structural hazards, and branch prediction stalls.", unit: "Unit 1: Architecture" },
    { id: "virtual-memory", label: "Virtual Memory & Multi-Level Page Tables", description: "Virtual-to-physical address translation, VPN/VPO to PFN/PFO, two-level page tables, and page fault handling.", unit: "Unit 2: Memory" },
    { id: "tlb-caching", label: "TLB & Page Replacement Algorithms", description: "Translation Lookaside Buffers, hit/miss penalties, and replacement policies (FIFO, LRU, Clock algorithm).", unit: "Unit 2: Memory" },
    { id: "os-scheduling", label: "Process Scheduling & Context Switching", description: "PCB state transitions, preemptive vs non-preemptive scheduling (Round Robin, Multi-Level Feedback Queue), and context save/restore.", unit: "Unit 3: Operating Systems" },
    { id: "concurrency-locks", label: "Synchronization, Semaphores & Deadlock", description: "Critical sections, mutexes, counting semaphores, condition variables, and Coffman deadlock conditions.", unit: "Unit 3: Operating Systems" },
    { id: "networking-tcp", label: "Networking Layers & TCP Reliable Transport", description: "OSI 7-layer model vs TCP/IP, sliding window protocols, three-way handshakes, and congestion control.", unit: "Unit 4: Networks" },
  ],
  edges: [
    { from: "pipelining-hazards", to: "virtual-memory", relation: "prereq" },
    { from: "virtual-memory", to: "tlb-caching", relation: "prereq" },
    { from: "virtual-memory", to: "os-scheduling", relation: "related" },
    { from: "os-scheduling", to: "concurrency-locks", relation: "prereq" },
    { from: "concurrency-locks", to: "networking-tcp", relation: "related" },
  ],
  examTopics: [
    { conceptId: "virtual-memory", frequency: 0.98, evidenceSourceIds: ["s2200-2"] },
    { conceptId: "pipelining-hazards", frequency: 0.94, evidenceSourceIds: ["s2200-2"] },
    { conceptId: "tlb-caching", frequency: 0.88, evidenceSourceIds: ["s2200-2", "s2200-3"] },
    { conceptId: "concurrency-locks", frequency: 0.82, evidenceSourceIds: ["s2200-1"] },
  ],
  difficulty: [
    { conceptId: "virtual-memory", score: 0.9, quotes: [{ text: "Two-level page table math with 32-bit addresses and 4KB pages is guaranteed to show up on Midterm 2.", sourceId: "s2200-3", sentiment: "negative" }] },
    { conceptId: "pipelining-hazards", score: 0.84, quotes: [{ text: "Drawing cycle-by-cycle pipeline diagrams with data forwarding requires extreme concentration.", sourceId: "s2200-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Project 3 (Virtual Memory) was the hardest project I've ever completed at Tech, but you learn so much.", sourceId: "s2200-3", sentiment: "positive" },
    { text: "Exam 1 is manageable; Exam 2 on virtual memory and interrupts is where the class average drops.", sourceId: "s2200-2", sentiment: "negative" },
  ],
  sources: cs2200Sources,
  professors: [{ name: "Dr. Umakishore Ramachandran", email: "rama@cc.gatech.edu" }],
  tips: [
    "Draw the bit breakdowns for Virtual Page Number (VPN1, VPN2) and offset immediately when starting virtual memory problems.",
    "Trace clock replacement bit changes step-by-step on scratch paper during projects and exams.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
