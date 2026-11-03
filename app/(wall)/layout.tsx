/** Lane: wall. Full-screen mission-control shell: covers the site nav/footer (route group shares the root layout). */
export default function WallLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-[#05070b] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(900px 520px at 8% -10%, rgba(179,163,105,.16), transparent 60%), radial-gradient(900px 560px at 95% -6%, rgba(61,139,255,.18), transparent 60%)" }} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
