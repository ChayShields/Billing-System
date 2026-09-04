-- Adds "void" as a valid invoice status, for cancelling an already-sent
-- invoice without erasing it (keeps invoice numbering and records intact).
-- Purely additive - widens the existing check constraint, no existing rows
-- are touched.

alter table public.invoices drop constraint invoices_status_check;

alter table public.invoices add constraint invoices_status_check
  check (status in ('draft', 'sent', 'paid', 'overdue', 'void'));
