# Billing System

Internal customer and invoice tracking for hireme.link. Not a public site — `noindex`, admin-only plus a customer login area.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres database, auth, row-level security)
- Resend (payment-confirmation emails)

## Roles

- **Admin** (`Chay@Hireme.link`) — full access: manage customers, create invoices, mark paid, create customer logins.
- **Customer** — signed in via a login the admin creates for them. Can only ever see their own customer record and invoices, enforced by database row-level security (not just app-level checks).

## Environment variables (`.env.local`, gitignored)

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — from Supabase Project Settings → API.
- `SUPABASE_SECRET_KEY` — same page, server-only, bypasses RLS. Never expose to the browser.
- `RESEND_API_KEY` — from resend.com. Until set, marking an invoice paid skips the email (logs a warning) rather than failing.
- `DATABASE_URL` — only used for running SQL migrations directly, not read by the app at runtime.

## Database migrations

Schema lives in `supabase/migrations/*.sql`, applied in order. Run a new one with:

```
node -e "const {Client}=require('pg');const fs=require('fs');const sql=fs.readFileSync('supabase/migrations/000X_name.sql','utf8');const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});c.connect().then(()=>c.query(sql)).then(()=>c.end())"
```

(`pg` is not a normal dependency — install it with `npm install -D pg` first, migrations are a one-off admin task, not something the running app needs.)

## Before this is usable for real invoices

- **Resend**: verify the `hireme.link` domain in Resend so the paid-confirmation email can actually send from `billing@hireme.link` (`src/lib/email.ts`) — until verified, Resend will reject sends from that address.
- **Supabase auth email**: creating a customer login triggers Supabase's built-in password-reset email. The default shared Supabase SMTP has a low rate limit meant for testing — for real use, configure custom SMTP in Supabase Auth settings (Resend's SMTP credentials work well for this too).
