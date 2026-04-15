
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name text NOT NULL,
  email text NOT NULL,
  website text,
  idealista_profile text,
  active_listings text,
  monthly_inquiries text,
  years_operating text,
  associations text,
  pitch text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  flags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form, no auth required)
CREATE POLICY "Anyone can submit an application"
ON public.applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view applications
CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
ON public.applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
