
-- Add calendar fields to existing profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS calendar_provider text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS calendar_connected boolean DEFAULT false;

-- ============================================
-- CREATE ALL TABLES FIRST (no cross-references in RLS yet)
-- ============================================

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  idealista_listing_id text,
  title text NOT NULL,
  address text,
  rent numeric(10,2),
  currency text DEFAULT 'EUR',
  bedrooms integer,
  bathrooms integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_properties_agency ON public.properties(agency_id);
CREATE INDEX idx_properties_idealista ON public.properties(idealista_listing_id);

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  nationality text,
  country_of_birth text,
  age_range text,
  auth_type text DEFAULT 'email',
  linkedin_id text,
  linkedin_profile text,
  linkedin_headline text,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_tenants_email ON public.tenants(email);
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idealista_listing_id text,
  property_title text,
  price numeric(10,2),
  tenant_name text,
  tenant_email text,
  tenant_phone text,
  message text,
  raw_email_source text DEFAULT 'sendgrid',
  raw_email_data jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_leads_idealista ON public.leads(idealista_listing_id);
CREATE INDEX idx_leads_processed ON public.leads(processed);

CREATE TABLE public.tenant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  agency_id uuid NOT NULL,
  idealista_listing_id text,
  status text NOT NULL DEFAULT 'pending',
  score integer DEFAULT 0,
  score_category text,
  fraud_flag boolean DEFAULT false,
  income_monthly numeric(10,2),
  rent numeric(10,2),
  employment_status text,
  job_title text,
  company text,
  contract_type text,
  salary_payment_date integer,
  documents_complete boolean DEFAULT false,
  linkedin_verified boolean DEFAULT false,
  linked_lead_id uuid REFERENCES public.leads(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tenant_applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tapps_tenant ON public.tenant_applications(tenant_id);
CREATE INDEX idx_tapps_property ON public.tenant_applications(property_id);
CREATE INDEX idx_tapps_agency ON public.tenant_applications(agency_id);
CREATE INDEX idx_tapps_status ON public.tenant_applications(status);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.tenant_applications(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  file_url text NOT NULL,
  file_name text,
  file_size integer,
  verified boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_docs_application ON public.documents(application_id);
CREATE INDEX idx_docs_tenant ON public.documents(tenant_id);

CREATE TABLE public.score_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.tenant_applications(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  financial_score integer DEFAULT 0,
  employment_score integer DEFAULT 0,
  document_score integer DEFAULT 0,
  identity_score integer DEFAULT 0,
  fraud_penalty integer DEFAULT 0,
  breakdown jsonb DEFAULT '{}',
  result text,
  fraud_flag boolean DEFAULT false,
  fraud_reasons text[],
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.score_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_scores_application ON public.score_logs(application_id);

CREATE TABLE public.viewings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.tenant_applications(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  agency_id uuid NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  provider text DEFAULT 'none',
  external_event_id text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_viewings_application ON public.viewings(application_id);
CREATE INDEX idx_viewings_agency ON public.viewings(agency_id);
CREATE INDEX idx_viewings_time ON public.viewings(start_time, end_time);

CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.tenant_applications(id) ON DELETE SET NULL,
  type text NOT NULL,
  status text DEFAULT 'sent',
  recipient_email text,
  subject text,
  sendgrid_message_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_emaillogs_application ON public.email_logs(application_id);

-- ============================================
-- RLS POLICIES (all tables exist now)
-- ============================================

-- PROPERTIES
CREATE POLICY "Agencies can manage own properties"
ON public.properties FOR ALL TO authenticated
USING (agency_id = auth.uid()) WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Anyone can view active properties"
ON public.properties FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage all properties"
ON public.properties FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TENANTS
CREATE POLICY "Tenants can view own record"
ON public.tenants FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Tenants can update own record"
ON public.tenants FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Anyone can create tenant"
ON public.tenants FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all tenants"
ON public.tenants FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agencies can view their applicant tenants"
ON public.tenants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_applications ta
    JOIN public.properties p ON ta.property_id = p.id
    WHERE ta.tenant_id = tenants.id AND p.agency_id = auth.uid()
  )
);

-- LEADS
CREATE POLICY "Webhook can create leads"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- TENANT APPLICATIONS
CREATE POLICY "Tenants can view own applications"
ON public.tenant_applications FOR SELECT TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Tenants can create applications"
ON public.tenant_applications FOR INSERT TO authenticated
WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Tenants can update own applications"
ON public.tenant_applications FOR UPDATE TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Agencies can view their applications"
ON public.tenant_applications FOR SELECT TO authenticated
USING (agency_id = auth.uid());

CREATE POLICY "Agencies can update their applications"
ON public.tenant_applications FOR UPDATE TO authenticated
USING (agency_id = auth.uid());

CREATE POLICY "Admins can manage all tenant applications"
ON public.tenant_applications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Webhook can create applications"
ON public.tenant_applications FOR INSERT TO anon
WITH CHECK (true);

-- DOCUMENTS
CREATE POLICY "Tenants can view own documents"
ON public.documents FOR SELECT TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Tenants can upload documents"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Tenants can delete own documents"
ON public.documents FOR DELETE TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Agencies can view application documents"
ON public.documents FOR SELECT TO authenticated
USING (application_id IN (SELECT id FROM public.tenant_applications WHERE agency_id = auth.uid()));

CREATE POLICY "Admins can view all documents"
ON public.documents FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- SCORE LOGS
CREATE POLICY "Agencies can view scores"
ON public.score_logs FOR SELECT TO authenticated
USING (application_id IN (SELECT id FROM public.tenant_applications WHERE agency_id = auth.uid()));

CREATE POLICY "Admins can view all scores"
ON public.score_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can insert scores"
ON public.score_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- VIEWINGS
CREATE POLICY "Agencies can manage own viewings"
ON public.viewings FOR ALL TO authenticated
USING (agency_id = auth.uid()) WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Tenants can view own viewings"
ON public.viewings FOR SELECT TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all viewings"
ON public.viewings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- EMAIL LOGS
CREATE POLICY "Admins can manage email logs"
ON public.email_logs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can insert email logs"
ON public.email_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-documents', 'tenant-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Tenants can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tenant-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Tenants can view own stored documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tenant-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Tenants can delete own stored documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tenant-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_applications_updated_at
BEFORE UPDATE ON public.tenant_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_viewings_updated_at
BEFORE UPDATE ON public.viewings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
