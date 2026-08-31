import type { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "secondary" | "danger" | "success"

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-accent to-accent-hover text-white shadow-accent hover:brightness-110 active:translate-y-px active:shadow-sm",
  secondary:
    "border border-border bg-surface text-ink shadow-xs hover:border-ink-faint hover:shadow-sm active:translate-y-px",
  danger:
    "border border-border bg-surface text-ink shadow-xs hover:border-status-overdue-text hover:text-status-overdue-text hover:shadow-sm active:translate-y-px",
  success:
    "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:brightness-110 active:translate-y-px active:shadow-sm",
}

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 ${VARIANTS[variant]} ${className}`
}

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClasses(variant, className)} {...props} />
}
