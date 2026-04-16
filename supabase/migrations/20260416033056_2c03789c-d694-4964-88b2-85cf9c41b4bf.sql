DROP VIEW IF EXISTS public.public_properties;

CREATE VIEW public.public_properties
WITH (security_invoker = true) AS
SELECT
  id, title, address, rent, currency, bedrooms, bathrooms, is_active, agency_id, idealista_listing_id, created_at, updated_at
FROM public.properties
WHERE is_active = true;