import type { HTMLAttributes } from "react"

export function cardClasses(className = "") {
  return `rounded-3xl border border-border bg-surface shadow-sm ${className}`
}

export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cardClasses(className)} {...props} />
}
