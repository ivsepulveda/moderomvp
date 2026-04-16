-- Add notification email and onboarding flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_email text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create agency_agents table
CREATE TABLE public.agency_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  permissions jsonb NOT NULL DEFAULT '{"view_tenants": true, "approve_tenants": false, "schedule_viewings": true, "manage_listings": false}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_agents ENABLE ROW LEVEL SECURITY;

-- Agencies can manage their own agents
CREATE POLICY "Agencies can manage own agents"
ON public.agency_agents
FOR ALL
TO authenticated
USING (agency_id = auth.uid())
WITH CHECK (agency_id = auth.uid());

-- Admins can view all agents
CREATE POLICY "Admins can view all agents"
ON public.agency_agents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_agency_agents_updated_at
BEFORE UPDATE ON public.agency_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();