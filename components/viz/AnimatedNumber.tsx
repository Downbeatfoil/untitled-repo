"use client";
/** Lane: viz. Count-up number (fear score, stats). Re-animates from the shown value when `value` changes. */
import { useEffect, useRef, useState } from "react";

export interface AnimatedNumberProps {
  value: number;
  /** ms. Default 1200. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Start from this instead of 0 on first mount. */
  from?: number;
  /** ms delay before the first animation. */
  delay?: number;
  /** Custom formatter (overrides decimals/prefix/suffix), e.g. n => n.toLocaleString(). */
  format?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({ value, duration = 1200, decimals = 0, prefix = "", suffix = "", from = 0, delay = 0, format, className = "" }: AnimatedNumberProps) {
  const target = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(from);
  const cur = useRef(from);
  const first = useRef(true);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || duration <= 0) {
      cur.current = target;
      setShown(target);
      return;
    }
    const start = cur.current;
    let raf = 0;
    let t0 = 0;
    const wait = first.current ? delay : 0;
    first.current = false;
    const tick = (now: number) => {
      if (!t0) t0 = now + wait;
      const t = Math.max(0, Math.min(1, (now - t0) / duration));
      const eased = 1 - Math.pow(1 - t, 4);
      cur.current = start + (target - start) * eased;
      setShown(cur.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);

  const text = format ? format(shown) : `${prefix}${shown.toFixed(decimals)}${suffix}`;
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }} aria-label={format ? format(target) : `${prefix}${target.toFixed(decimals)}${suffix}`}>
      {text}
    </span>
  );
}
