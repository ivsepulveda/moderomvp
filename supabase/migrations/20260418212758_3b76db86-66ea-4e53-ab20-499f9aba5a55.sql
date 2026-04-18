ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS target_rent numeric,
  ADD COLUMN IF NOT EXISTS suggested_rent numeric,
  ADD COLUMN IF NOT EXISTS listed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS rented_at timestamptz,
  ADD COLUMN IF NOT EXISTS commission_months numeric DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_properties_agency_listed ON public.properties(agency_id, listed_at);