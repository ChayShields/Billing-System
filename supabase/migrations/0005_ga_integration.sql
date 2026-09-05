-- Google Analytics integration for the client-dashboard GA module. Chay is
-- the GA4 admin on every client's property himself, so this is a single
-- Google account connection (his own), not one per customer - only the
-- property ID differs per customer, which lets the app know which GA4
-- property belongs to whom.

alter table public.customers add column ga4_property_id text;

create table public.google_oauth_connection (
  id uuid primary key default gen_random_uuid(),
  refresh_token text not null,
  connected_at timestamptz not null default now()
);

alter table public.google_oauth_connection enable row level security;

create policy "Admins manage the Google connection" on public.google_oauth_connection
  for all using (public.is_admin()) with check (public.is_admin());
