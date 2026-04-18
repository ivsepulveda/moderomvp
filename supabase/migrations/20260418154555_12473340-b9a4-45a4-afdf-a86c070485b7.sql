-- Link leads to the application they spawned (if matched)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS linked_application_id uuid REFERENCES public.tenant_applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS match_status text NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_leads_listing ON public.leads(idealista_listing_id);
CREATE INDEX IF NOT EXISTS idx_leads_match_status ON public.leads(match_status);
CREATE INDEX IF NOT EXISTS idx_properties_idealista ON public.properties(idealista_listing_id);

-- Allow tenants to be looked up/upserted by email uniquely
CREATE UNIQUE INDEX IF NOT EXISTS uniq_tenants_email_lower ON public.tenants (lower(email));