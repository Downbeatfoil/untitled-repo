/** Lane: lab. /roast: Schedule Roast. */
import type { Metadata } from "next";
import { listSeeds } from "@/lib/data";
import RoastClient from "@/components/lab/RoastClient";

export const metadata: Metadata = {
  title: "Schedule Roast",
  description: "Pick 3–5 Georgia Tech classes and Grok roasts your semester: survival odds, fear score, one savage line per course.",
};

export default function RoastPage() {
  return <RoastClient courses={listSeeds()} />;
}
