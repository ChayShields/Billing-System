import type { InvoiceStatus } from "@/lib/types"

const STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-status-draft-bg text-status-draft-text",
  sent: "bg-status-sent-bg text-status-sent-text",
  paid: "bg-status-paid-bg text-status-paid-text",
  overdue: "bg-status-overdue-bg text-status-overdue-text",
}

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  )
}
