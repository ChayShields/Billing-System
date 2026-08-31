-- Adds a website field to customers, requested alongside phone/email/address.

alter table public.customers
  add column website text;
