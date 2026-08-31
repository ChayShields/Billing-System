import type { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "secondary" | "danger" | "success"

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-ink hover:bg-surface-sunken",
  danger: "border border-border bg-surface text-ink hover:border-status-overdue-text hover:text-status-overdue-text",
  success: "bg-status-paid-text text-white hover:brightness-110",
}

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`
}

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClasses(variant, className)} {...props} />
}
