-- Entitlements layer for the client-dashboard roadmap (booking, GA
-- dashboard, CRM, local SEO, AI content, email marketing). A row here
-- means a customer has that module switched on; no row means off.
-- Every future module page gates itself through this table via
-- requireModule(), not by trusting the admin UI alone.

create table public.customer_modules (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  module text not null check (
    module in ('booking', 'ga_dashboard', 'crm', 'local_seo', 'ai_content', 'email_marketing')
  ),
  enabled_at timestamptz not null default now(),
  unique (customer_id, module)
);

alter table public.customer_modules enable row level security;

create policy "Admins manage all customer modules" on public.customer_modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Customers view own modules" on public.customer_modules
  for select using (customer_id = public.current_customer_id());
