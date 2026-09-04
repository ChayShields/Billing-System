"use client"

import { useState, useTransition } from "react"
import { updateInvoice, type NewInvoiceItem } from "../actions"
import { buttonClasses } from "@/components/ui/Button"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"

const inputClass =
  "rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: Invoice & { invoice_items: InvoiceItem[] }
  customers: Customer[]
}) {
  const [customerId, setCustomerId] = useState(invoice.customer_id)
  const [dueDate, setDueDate] = useState(invoice.due_date ?? "")
  const [notes, setNotes] = useState(invoice.notes ?? "")
  const [items, setItems] = useState<NewInvoiceItem[]>(
    invoice.invoice_items.length > 0
      ? invoice.invoice_items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        }))
      : [{ description: "", quantity: 1, unit_price: 0 }]
  )
  const [isPending, startTransition] = useTransition()

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const updateItem = (index: number, patch: Partial<NewInvoiceItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }])
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      updateInvoice(invoice.id, {
        customerId,
        dueDate: dueDate || null,
        notes: notes || null,
        items: items.filter((item) => item.description.trim() !== ""),
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
      <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className={`mt-1.5 w-full ${inputClass}`}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`mt-1.5 w-full ${inputClass}`}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
        <label className="block text-sm font-medium text-ink">Line items</label>
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:border-0 sm:p-0"
            >
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                className={`${inputClass} sm:flex-1`}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                  className={`w-16 sm:w-20 ${inputClass}`}
                  aria-label="Quantity"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                  className={`min-w-0 flex-1 sm:w-28 sm:flex-none ${inputClass}`}
                  aria-label="Unit price"
                />
                <span className="w-20 shrink-0 text-right text-sm tabular-nums text-ink-soft sm:w-24">
                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                    item.quantity * item.unit_price
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-status-overdue-bg hover:text-status-overdue-text disabled:opacity-30"
                  aria-label="Remove line"
                >
                  <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
                    <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm font-medium text-accent hover:text-accent-hover"
        >
          + Add line
        </button>
      </div>

      <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
        <label className="block text-sm font-medium text-ink">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`mt-1.5 w-full ${inputClass}`}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface shadow-sm p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold tabular-nums text-ink">
          Total: {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(total)}
        </p>
        <button
          type="submit"
          disabled={isPending || !customerId}
          className={buttonClasses("primary", "w-full justify-center sm:w-auto")}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
