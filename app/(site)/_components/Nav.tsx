"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#d6c78a" />
          <stop offset="1" stopColor="#3d8bff" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#0e131b" stroke="url(#lg)" strokeWidth="1.5" />
      <path d="M8 22 L14 14 L18 18 L24 9" stroke="url(#lg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="9" r="2.4" fill="#38e1ff" />
      <circle cx="8" cy="22" r="1.8" fill="#d6c78a" />
    </svg>
  );
}

const LINKS = [
  { href: "/", label: "Courses", match: (p: string) => p === "/" || p.startsWith("/course") || p.startsWith("/scout") },
  { href: "/roast", label: "Roast", match: (p: string) => p.startsWith("/roast") },
  { href: "/versus", label: "Versus", match: (p: string) => p.startsWith("/versus") },
  { href: "/wall", label: "Wall", match: (p: string) => p.startsWith("/wall") },
  { href: "/built-by-agents", label: "Built by Agents", match: (p: string) => p.startsWith("/built-by-agents") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

export default function Nav() {
  const pathname = usePathname() || "/";
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[rgba(6,8,12,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="whitespace-nowrap text-[15px] font-bold tracking-tight">
            SmartPath <span className="text-gradient">Scout</span>
          </span>
          <span className="badge hidden border-line2 text-dim sm:inline-flex">beta</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium sm:px-3 sm:text-sm transition-colors ${
                  active ? "bg-[rgba(179,163,105,0.12)] text-goldb" : "text-muted hover:text-foreground"
                } ${["/about", "/roast", "/versus", "/wall"].includes(l.href) ? "hidden md:block" : ""}`}
              >
                {l.label === "Built by Agents" ? <><span className="sm:hidden">Agents</span><span className="hidden sm:inline">Built by Agents</span></> : l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
