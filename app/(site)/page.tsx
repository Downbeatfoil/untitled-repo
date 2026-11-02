/** Lane: pages. Landing page — replace with the real product at kickoff. */
import AskBox from "@/components/AskBox";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Project Name</h1>
        <p className="mt-2 text-neutral-500">One-line pitch goes here.</p>
      </div>
      <AskBox />
    </main>
  );
}
