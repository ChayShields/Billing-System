import type { InvoiceStatus } from "@/lib/types"

const STYLES: Record<InvoiceStatus, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-status-draft-bg", text: "text-status-draft-text", dot: "bg-status-draft-dot" },
  sent: { bg: "bg-status-sent-bg", text: "text-status-sent-text", dot: "bg-status-sent-dot" },
  paid: { bg: "bg-status-paid-bg", text: "text-status-paid-text", dot: "bg-status-paid-dot" },
  overdue: { bg: "bg-status-overdue-bg", text: "text-status-overdue-text", dot: "bg-status-overdue-dot" },
  void: { bg: "bg-status-void-bg", text: "text-status-void-text", dot: "bg-status-void-dot" },
}

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}
