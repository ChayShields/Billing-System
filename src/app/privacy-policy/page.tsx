import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    heading: "Who we are",
    body: "This system is operated by Chay Levi Shields, trading as a freelance consultant (hireme.link), as the data controller for the information described below. Contact: Chay@Hireme.link.",
  },
  {
    heading: "What this system is",
    body: "This is an internal billing tool used to manage customers and invoices for Chay's freelance business. It is not a public website and is not used for marketing. Two kinds of accounts exist: an admin account (Chay), and customer accounts created by Chay so a customer can view their own invoices.",
  },
  {
    heading: "Information we collect",
    body: "For each customer: name, email address, and optionally company name, phone number, website, and address, entered by Chay when a customer is added. For each invoice: line-item descriptions, quantities, prices, dates, and status. If a customer is given portal access, their email address is used as their login and their account is linked to their own customer record.",
  },
  {
    heading: "How we use it",
    body: "This information is used solely to issue and track invoices, and to let a customer view their own invoice history and payment status. It is not used for marketing, not sold, and not shared with third parties except the service providers below.",
  },
  {
    heading: "No online payment processing",
    body: "This system does not collect or process card payments. Invoices are paid by bank transfer or cash, arranged directly between Chay and the customer, outside this system. No payment card data is ever entered into or stored by this system.",
  },
  {
    heading: "Who can see what",
    body: "Chay, as the admin, can see all customers and invoices. A customer with portal access can only ever see their own customer record and their own invoices - this is enforced by the database itself (row-level security), not just by the page you're looking at, so there is no way for one customer to see another's data through this system.",
  },
  {
    heading: "Service providers",
    body: "Data is stored with Supabase (database, authentication). Payment-confirmation emails, once configured, are sent via Resend. Both process data on our behalf under their own security and data-protection commitments; neither is used for any purpose beyond running this system.",
  },
  {
    heading: "Cookies",
    body: "See the Cookie Policy below.",
  },
  {
    heading: "How long we keep it",
    body: "Customer and invoice records are kept for as long as needed to run the business and to meet legal, accounting, and tax obligations, then removed or archived.",
  },
  {
    heading: "Your rights",
    body: "If you're a customer with an account on this system, you can ask Chay (Chay@Hireme.link) for a copy of the information held about you, ask for corrections, or ask for it to be deleted where it's no longer needed for an active or past engagement.",
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        &larr; Back
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated 31 August 2026.</p>

      <div className="mt-8 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 className="text-sm font-semibold text-ink">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}

        <div id="cookies">
          <h2 className="text-sm font-semibold text-ink">Cookie Policy</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This system sets one cookie: a login session cookie (managed by Supabase Auth) that
            keeps you signed in as you move between pages. It is strictly necessary for the
            system to work - without it, you could not stay logged in - and under UK GDPR/PECR,
            strictly necessary cookies do not require consent. No advertising, analytics, or
            tracking cookies are set by this system.
          </p>
        </div>

        <p className="text-xs text-ink-faint">
          See also the{" "}
          <Link href="/terms-of-service" className="text-accent hover:text-accent-hover">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
