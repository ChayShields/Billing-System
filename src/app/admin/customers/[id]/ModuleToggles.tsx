"use client"

import { useTransition } from "react"
import { toggleCustomerModule } from "../actions"
import type { ModuleName } from "@/lib/types"

const MODULES: { module: ModuleName; label: string }[] = [
  { module: "booking", label: "Booking" },
  { module: "ga_dashboard", label: "GA Dashboard" },
  { module: "crm", label: "CRM" },
  { module: "local_seo", label: "Local SEO" },
  { module: "ai_content", label: "AI Content" },
  { module: "email_marketing", label: "Email Marketing" },
]

export default function ModuleToggles({
  customerId,
  enabledModules,
}: {
  customerId: string
  enabledModules: ModuleName[]
}) {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {MODULES.map(({ module, label }) => (
        <ModuleRow
          key={module}
          customerId={customerId}
          module={module}
          label={label}
          enabled={enabledModules.includes(module)}
        />
      ))}
    </div>
  )
}

function ModuleRow({
  customerId,
  module,
  label,
  enabled,
}: {
  customerId: string
  module: ModuleName
  label: string
  enabled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-sunken px-3 py-2">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleCustomerModule(customerId, module, !enabled))}
        aria-pressed={enabled}
        className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 disabled:opacity-50 ${
          enabled ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-150 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}
