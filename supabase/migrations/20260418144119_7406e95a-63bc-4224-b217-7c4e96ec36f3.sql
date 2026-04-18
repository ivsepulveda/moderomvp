
-- Create public bucket for agency logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Agency logos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'agency-logos');

-- Admins can upload
CREATE POLICY "Admins can upload agency logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agency-logos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update agency logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'agency-logos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete agency logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'agency-logos' AND public.has_role(auth.uid(), 'admin'));
