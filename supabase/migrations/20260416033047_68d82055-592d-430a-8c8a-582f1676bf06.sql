-- 1. Drop overpermissive score_logs INSERT policy
DROP POLICY IF EXISTS "Authenticated can insert scores" ON public.score_logs;

-- 2. Drop overpermissive tenant_applications anon INSERT policy
DROP POLICY IF EXISTS "Webhook can create applications" ON public.tenant_applications;

-- 3. Drop overpermissive email_logs INSERT policy
DROP POLICY IF EXISTS "Authenticated can insert email logs" ON public.email_logs;

-- 4. Fix properties: replace public SELECT to exclude listing_rules
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;

CREATE POLICY "Anyone can view active properties (limited)"
ON public.properties
FOR SELECT
TO authenticated
USING (is_active = true);

-- Create a secure view that excludes listing_rules for non-owners
CREATE OR REPLACE VIEW public.public_properties AS
SELECT
  id, title, address, rent, currency, bedrooms, bathrooms, is_active, agency_id, idealista_listing_id, created_at, updated_at
FROM public.properties
WHERE is_active = true;