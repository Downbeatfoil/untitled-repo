"use client";
/** Lane: components. Dark-theme button. Renders <a> when `href` is given. */
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "blue" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[#B3A369] text-black hover:bg-[#C9BB82]",
  blue: "bg-[#ececec] text-black hover:bg-white",
  ghost: "bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white",
  outline: "border border-white/15 bg-white/5 text-neutral-100 hover:border-[#B3A369]/60 hover:bg-white/10",
};
const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

type Common = { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; children: ReactNode; className?: string };
type AsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };
type AsLink = Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common> & { href: string };

export default function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", loading = false, children, className = "", ...rest } = props;
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const inner = (
    <>
      {loading && <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </>
  );
  if ("href" in props && props.href !== undefined) {
    const { href, ...a } = rest as Omit<AsLink, keyof Common>;
    return (
      <a href={href} className={cls} {...a}>
        {inner}
      </a>
    );
  }
  const b = rest as Omit<AsButton, keyof Common>;
  return (
    <button type="button" className={cls} {...b} disabled={b.disabled || loading} aria-busy={loading || undefined}>
      {inner}
    </button>
  );
}
