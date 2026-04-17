CREATE TABLE public.agency_setup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL UNIQUE,
  basic_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  listings JSONB NOT NULL DEFAULT '[]'::jsonb,
  connection_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  intelligence_brain JSONB NOT NULL DEFAULT '{}'::jsonb,
  team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT agency_setup_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE,
  CONSTRAINT agency_setup_current_step_check CHECK (current_step >= 0 AND current_step <= 4)
);

ALTER TABLE public.agency_setup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agency setup"
ON public.agency_setup
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agencies can view own setup"
ON public.agency_setup
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = agency_setup.application_id
      AND lower(coalesce(a.email, '')) = lower(coalesce(p.email, ''))
  )
);

CREATE TRIGGER update_agency_setup_updated_at
BEFORE UPDATE ON public.agency_setup
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();