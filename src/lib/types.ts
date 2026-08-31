export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue"

export type Customer = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export type Invoice = {
  id: string
  customer_id: string
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string | null
  paid_date: string | null
  notes: string | null
  total: number
  created_at: string
  updated_at: string
  customers?: Customer
  invoice_items?: InvoiceItem[]
}

export type Profile = {
  id: string
  role: "admin" | "customer"
  customer_id: string | null
}
