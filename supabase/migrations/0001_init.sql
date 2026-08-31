-- Billing System initial schema
-- Customers, invoices, invoice line items, role-linked profiles, and
-- row-level security so a customer can only ever read their own data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  customer_id uuid references public.customers (id) on delete set null,
  created_at timestamptz not null default now()
);

create sequence public.invoice_number_seq start 1;

create function public.next_invoice_number()
returns text
language sql
as $$
  select 'INV-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0');
$$;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  invoice_number text not null unique default public.next_invoice_number(),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  issue_date date not null default current_date,
  due_date date,
  paid_date date,
  notes text,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null default 0,
  amount numeric(10, 2) generated always as (quantity * unit_price) stored
);

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Access-control helper functions (security definer so RLS policies
-- can call them without recursing back into the RLS-protected tables)
-- ---------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select customer_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.customers enable row level security;
alter table public.profiles enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

create policy "Admins manage all customers" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Customers view own record" on public.customers
  for select using (id = public.current_customer_id());

create policy "Admins manage all profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Users view own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Admins manage all invoices" on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Customers view own invoices" on public.invoices
  for select using (customer_id = public.current_customer_id());

create policy "Admins manage all invoice items" on public.invoice_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Customers view own invoice items" on public.invoice_items
  for select using (
    invoice_id in (
      select id from public.invoices where customer_id = public.current_customer_id()
    )
  );
