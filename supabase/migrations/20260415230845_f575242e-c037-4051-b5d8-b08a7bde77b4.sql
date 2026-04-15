
-- Create a function to auto-create a tenant when a new user signs up (only for tenant users)
CREATE OR REPLACE FUNCTION public.handle_new_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create tenant if the user metadata indicates tenant signup
  IF (NEW.raw_user_meta_data ->> 'user_type') = 'tenant' THEN
    INSERT INTO public.tenants (user_id, name, email, email_verified)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      NEW.email,
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for tenant creation
CREATE TRIGGER on_auth_user_created_tenant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tenant();
