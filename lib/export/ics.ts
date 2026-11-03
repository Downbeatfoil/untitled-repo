/** Lane: export. StudyPlan -> RFC 5545 calendar (one event per day, 6pm local, duration = minutes). */
import type { CoursePack, StudyPlan } from "@/shared/contract";

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Fold lines longer than 75 octets per RFC 5545. */
const fold = (line: string) => line.match(/.{1,73}/g)!.join("\r\n ");

export function toIcs(plan: StudyPlan, pack?: CoursePack): string {
  const label = new Map(pack?.concepts.map((c) => [c.id, c.label]) ?? []);
  const now = stamp(new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SmartPath Scout//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  plan.days.forEach((day, i) => {
    const [y, m, d] = day.date.split("-").map(Number);
    const start = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}T180000`;
    const endDate = new Date(Date.UTC(y, m - 1, d, 18, 0) + Math.min(Math.max(day.minutes, 15), 345) * 60000);
    const end = `${start.slice(0, 9)}${String(endDate.getUTCHours()).padStart(2, "0")}${String(endDate.getUTCMinutes()).padStart(2, "0")}00`;
    const topics = day.conceptIds.map((id) => label.get(id) ?? id).join(", ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${plan.courseCode.replace(/\s/g, "")}-${day.date}-${i}@smartpath-scout`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      fold(`SUMMARY:${esc(`${plan.courseCode}: ${topics || "Review"}`)}`),
      fold(`DESCRIPTION:${esc(day.tasks.map((t) => `• ${t}`).join("\n"))}`),
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
