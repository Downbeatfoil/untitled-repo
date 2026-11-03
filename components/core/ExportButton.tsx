"use client";
/** Lane: components. Downloads the SmartPath JSON via exportUrl(code,'smartpath'). */
import { exportUrl } from "@/lib/api-client";
import { courseSlug } from "@/shared/contract";
import Button, { type ButtonVariant } from "./Button";

export interface ExportButtonProps {
  courseCode: string;
  variant?: ButtonVariant;
  label?: string;
  className?: string;
}

export default function ExportButton({ courseCode, variant = "outline", label = "Export to SmartPath", className }: ExportButtonProps) {
  return (
    <Button href={exportUrl(courseCode, "smartpath")} download={`smartpath-${courseSlug(courseCode)}.json`} variant={variant} className={className}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
      </svg>
      {label}
    </Button>
  );
}
