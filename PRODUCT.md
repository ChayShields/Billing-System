# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind. Supabase for database, auth, and row-level security. Resend for transactional email. Chay's explicit choice, confirmed in conversation.

## Users

Two roles, one product:
1. Chay himself (admin) — runs his freelance business (hireme.link) and needs to track customers and invoices day to day.
2. Chay's freelance clients (customers) — each gets their own login to check their own invoices and payment status. They never pay online through this system; they pay by bank transfer or cash, and Chay marks the invoice paid manually.

## Product Purpose

An internal billing system replacing ad-hoc invoice tracking for Chay's freelance business. It exists to give Chay one place to manage customers and invoices, and to give each customer a simple way to check what they owe and what they've already paid, without adding payment-processing complexity he doesn't need.

## Positioning

Purpose-built for exactly Chay's workflow (offline payment, manual mark-as-paid, one freelancer managing a modest client list) rather than a generic invoicing SaaS with features he'd never use (multi-currency, online payment gateways, multi-seat teams).

## Operating Context

- No online payment collection anywhere in the product - customers pay by bank transfer or cash, outside the system entirely.
- Marking an invoice paid is a manual action Chay takes after he's actually been paid; it triggers an automatic confirmation email to the customer.
- Customer accounts are created by Chay, not self-service signup.
- Never publicly indexed or marketed - this is back-office tooling, not a customer-acquisition surface.

## Capabilities and Constraints

- No VAT/tax field - flat total per invoice, confirmed by Chay (not VAT-registered).
- No online payment gateway integration, and none is planned.
- Row-level security enforces that a customer can only ever read their own customer record and invoices - this is a hard product requirement, not just a nice-to-have, since it's the difference between customers seeing only their own financial data and a real data leak.
- Sequential invoice numbering (INV-0001, INV-0002, ...).

## Brand Commitments

- This sits alongside Chay's existing hireme.link brand (dark background, purple accent, Inter typography - see the portfolio site's own DESIGN.md-equivalent) but is a separate, internally-facing tool, not required to visually match the public marketing site. No existing visual identity has been established for this tool specifically yet.

## Evidence on Hand

- No existing customers, invoices, or real usage data yet - this is a brand-new system. No testimonials, screenshots, or sample data exist; none should be fabricated. Any example content shown during design work must be clearly synthetic/placeholder.

## Product Principles

- Chay needs to move fast day-to-day: adding a customer, building an invoice, and marking something paid should each take seconds, not require hunting through menus.
- A customer opening their portal should immediately understand what they owe and whether anything is overdue - clarity over decoration.
- The database-level access boundary between customers is the single most important trust property of this product; the UI should reinforce that boundary being intact (a customer never sees any hint that other customers or their data exist), never work around it for convenience.
- Despite being an internal tool, it should not look like an unstyled scaffold - Chay explicitly wants real design craft applied here, the same standard as his public sites.

## Accessibility & Inclusion

No specific requirement established beyond standard web accessibility practice (keyboard navigation, sufficient contrast, semantic form labels) - already a live bug class in this build (a dark-mode/light-mode text contrast conflict), so contrast correctness is a confirmed real requirement, not hypothetical.
