"use client"

import { useState, useTransition } from "react"
import { createInvoice, type NewInvoiceItem } from "../actions"
import type { Customer } from "@/lib/types"

export default function NewInvoiceForm({
  customers,
  defaultCustomerId,
}: {
  customers: Customer[]
  defaultCustomerId?: string
}) {
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? customers[0]?.id ?? "")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<NewInvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ])
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
      createInvoice({
        customerId,
        dueDate: dueDate || null,
        notes: notes || null,
        items: items.filter((item) => item.description.trim() !== ""),
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
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
          <label className="block text-sm font-medium text-slate-700">Due date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Line items</label>
        <div className="mt-2 flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                step="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                aria-label="Quantity"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                aria-label="Unit price"
              />
              <span className="w-24 shrink-0 text-right text-sm text-slate-500">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                  item.quantity * item.unit_price
                )}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                className="text-sm text-slate-400 hover:text-red-600 disabled:opacity-30"
                aria-label="Remove line"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          + Add line
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-lg font-semibold text-slate-900">
          Total:{" "}
          {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(total)}
        </p>
        <button
          type="submit"
          disabled={isPending || !customerId}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </form>
  )
}
