/** Lane: lab. /versus: Course Cage Match. */
import type { Metadata } from "next";
import { listSeeds } from "@/lib/data";
import VersusClient from "@/components/lab/VersusClient";

export const metadata: Metadata = {
  title: "Course Cage Match",
  description: "Two Georgia Tech courses enter. Five rounds of fear, exams and student tears. One champion of dread.",
};

export default function VersusPage() {
  return <VersusClient courses={listSeeds()} />;
}
