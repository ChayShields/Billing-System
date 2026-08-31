import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    heading: "About these terms",
    body: "These terms apply when you use this billing system, whether as the admin (Chay) or as a customer with portal access to view your own invoices. They're written in plain language and are not a substitute for whatever engagement, quote, or agreement covers the actual work being invoiced.",
  },
  {
    heading: "What this system is for",
    body: "This system exists to issue invoices and let customers view their own invoice and payment status. It does not create, alter, or replace any agreement about the work itself - what's owed is whatever was actually agreed between Chay and the customer directly.",
  },
  {
    heading: "Payment",
    body: "This system does not process payment. Invoices are settled by bank transfer or cash, arranged directly with Chay, outside this system. An invoice is marked \"paid\" manually once payment has actually been received - the system does not confirm or verify payment on its own.",
  },
  {
    heading: "Customer accounts",
    body: "A customer account is created by Chay and is for viewing your own invoices only. Keep your login details private; contact Chay@Hireme.link if you believe your access has been compromised, and a new password can be issued.",
  },
  {
    heading: "Accuracy",
    body: "Invoice details are entered by Chay. If anything on an invoice looks wrong, contact Chay@Hireme.link before paying.",
  },
  {
    heading: "Changes",
    body: "These terms may be updated from time to time. The date at the top of the page shows when they were last revised.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction, unless the law in your country says otherwise.",
  },
]

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        &larr; Back
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Terms of Service</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated 31 August 2026.</p>

      <div className="mt-8 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 className="text-sm font-semibold text-ink">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}

        <p className="text-xs text-ink-faint">
          See also the{" "}
          <Link href="/privacy-policy" className="text-accent hover:text-accent-hover">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
