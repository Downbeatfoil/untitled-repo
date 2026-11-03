"use client";
/** Lane: components. Accessible tab bar + panels (arrow-key navigation). Controlled or uncontrolled. */
import { useRef, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Controlled active tab id. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Keep inactive panels mounted (preserves state like chat history). Default true. */
  keepMounted?: boolean;
}

export default function Tabs({ tabs, value, defaultValue, onChange, keepMounted = true }: TabsProps) {
  const [inner, setInner] = useState(defaultValue ?? tabs[0]?.id);
  const active = value ?? inner;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set([active]));

  function select(id: string) {
    setInner(id);
    setVisited((v) => new Set(v).add(id));
    onChange?.(id);
  }
  function onKey(e: React.KeyboardEvent, i: number) {
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    select(tabs[n].id);
    refs.current[tabs[n].id]?.focus();
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF] ${on ? "text-white" : "text-neutral-500 hover:text-neutral-200"}`}
            >
              {t.icon}
              {t.label}
              <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-[#B3A369] to-[#2D7DFF] transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
            </button>
          );
        })}
      </div>
      {tabs.map((t) => {
        const on = t.id === active;
        if (!on && !(keepMounted && visited.has(t.id))) return null;
        return (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={!on} tabIndex={0} className="pt-6 focus:outline-none">
            {t.content}
          </div>
        );
      })}
    </div>
  );
}
