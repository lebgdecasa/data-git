-- ============================================================================
-- Product Audit Studio — add strategic narrative report column
-- ============================================================================
-- The deterministic scores live in `report`; the AI (or fallback) strategic
-- narrative report lives here. RLS from 0001 already covers this column.

alter table public.audits
  add column if not exists narrative jsonb;
