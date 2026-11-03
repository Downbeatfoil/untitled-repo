"use client";
/**
 * Lane: components. Toasts: wrap the page tree in <ToastProvider>, then `const toast = useToast(); toast("Copied!")`.
 * Without a provider, useToast() is a safe no-op so components never crash.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import Fx from "./Fx";

export type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}
export type ToastFn = (message: string, opts?: { kind?: ToastKind; durationMs?: number }) => void;

const Ctx = createContext<ToastFn | null>(null);

const KIND: Record<ToastKind, string> = {
  success: "border-emerald-400/40 text-emerald-200",
  error: "border-rose-400/40 text-rose-200",
  info: "border-[#2D7DFF]/50 text-[#BBD4FF]",
};
const ICON: Record<ToastKind, string> = { success: "✓", error: "!", info: "i" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const toast = useCallback<ToastFn>((message, opts) => {
    const id = nextId.current++;
    setItems((p) => [...p.slice(-3), { id, message, kind: opts?.kind ?? "success" }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), opts?.durationMs ?? 2800);
  }, []);
  const value = useMemo(() => toast, [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Fx />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`sp-fly-in pointer-events-auto flex items-center gap-2 rounded-xl border bg-[#12151c]/95 px-4 py-2.5 text-sm shadow-xl backdrop-blur ${KIND[t.kind]}`}>
            <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-xs font-bold">
              {ICON[t.kind]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

const noop: ToastFn = () => {};
export function useToast(): ToastFn {
  return useContext(Ctx) ?? noop;
}

export default ToastProvider;
