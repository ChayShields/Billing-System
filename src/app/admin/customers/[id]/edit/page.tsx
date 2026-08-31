import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { buttonClasses } from "@/components/ui/Button"
import type { Customer } from "@/lib/types"
import { updateCustomer } from "../../actions"

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single<Customer>()

  if (!customer) notFound()

  async function editAction(formData: FormData) {
    "use server"
    await updateCustomer(customer!.id, formData)
  }

  return (
    <div>
      <Link href={`/admin/customers/${customer.id}`} className="text-sm text-ink-soft hover:text-ink">
        &larr; {customer.name}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Edit customer</h1>

      <form action={editAction} className="mt-6 max-w-lg rounded-3xl border border-border bg-surface shadow-sm p-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink">Name</label>
            <input name="name" defaultValue={customer.name} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={customer.email}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Company</label>
            <input name="company" defaultValue={customer.company ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Phone</label>
            <input name="phone" defaultValue={customer.phone ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Website</label>
            <input
              name="website"
              type="url"
              defaultValue={customer.website ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Address</label>
            <textarea name="address" defaultValue={customer.address ?? ""} rows={2} className={inputClass} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="submit" className={buttonClasses("primary")}>
            Save changes
          </button>
          <Link href={`/admin/customers/${customer.id}`} className={buttonClasses("secondary")}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
