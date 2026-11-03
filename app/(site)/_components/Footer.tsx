import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-dim sm:flex-row sm:items-center sm:px-6">
        <div>
          Built with <span className="text-goldb">Grok</span> · BDBI <span className="text-muted">SmartPath AI</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/built-by-agents" className="hover:text-foreground">Built by 9 agents</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <span className="mono text-xs">Georgia Tech · public sources only</span>
        </div>
      </div>
    </footer>
  );
}
