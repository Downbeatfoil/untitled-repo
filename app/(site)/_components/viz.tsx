/** Lane: pages. Difficulty heatmap (not in components/viz). */
import type { CoursePack } from "@/shared/contract";

const diffColor = (d: number) => (d >= 0.75 ? "#ff5d6c" : d >= 0.55 ? "#ffb547" : d >= 0.35 ? "#d6c78a" : "#3ddc97");

export function DifficultyHeatmap({ pack }: { pack: CoursePack }) {
  const label = new Map(pack.concepts.map((c) => [c.id, c.label]));
  const unit = new Map(pack.concepts.map((c) => [c.id, c.unit ?? "Other"]));
  const freq = new Map(pack.examTopics.map((t) => [t.conceptId, t.frequency]));
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {[...pack.difficulty].sort((a, b) => b.score - a.score).map((d) => {
        const c = diffColor(d.score);
        return (
          <div key={d.conceptId} className="rounded-lg border p-3" style={{ background: `${c}${Math.round(18 + d.score * 40).toString(16).padStart(2, "0")}`, borderColor: `${c}55` }} title={unit.get(d.conceptId)}>
            <div className="text-[13px] font-semibold leading-tight">{label.get(d.conceptId) ?? d.conceptId}</div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="mono font-bold" style={{ color: c }}>{Math.round(d.score * 100)} diff</span>
              <span className="text-muted">{Math.round((freq.get(d.conceptId) ?? 0) * 100)}% exam</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
