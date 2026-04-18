-- ============ LEADS: add qualification fields ============
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS agency_id uuid,
  ADD COLUMN IF NOT EXISTS qualification_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS qualification_score integer,
  ADD COLUMN IF NOT EXISTS qualification_reasons jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS assigned_agent_id uuid,
  ADD COLUMN IF NOT EXISTS property_id uuid,
  ADD COLUMN IF NOT EXISTS viewing_invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS viewing_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS viewing_declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON public.leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_status ON public.leads(qualification_status);

-- Allow agencies to view/update their own leads
DROP POLICY IF EXISTS "Agencies can view own leads" ON public.leads;
CREATE POLICY "Agencies can view own leads" ON public.leads
  FOR SELECT TO authenticated
  USING (agency_id = auth.uid());

DROP POLICY IF EXISTS "Agencies can update own leads" ON public.leads;
CREATE POLICY "Agencies can update own leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (agency_id = auth.uid());

-- ============ CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  property_id uuid,
  tenant_id uuid,
  lead_id uuid,
  application_id uuid,
  tenant_name text,
  tenant_email text,
  tenant_phone text,
  property_title text,
  status text NOT NULL DEFAULT 'ai_handling', -- ai_handling | agent_handling | closed
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_agency_id ON public.conversations(agency_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies manage own conversations" ON public.conversations
  FOR ALL TO authenticated
  USING (agency_id = auth.uid())
  WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Admins manage all conversations" ON public.conversations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MESSAGES ============
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL, -- ai | agent | tenant | system
  sender_name text,
  body text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies view messages in own conversations" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id AND c.agency_id = auth.uid()
  ));

CREATE POLICY "Agencies insert messages in own conversations" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id AND c.agency_id = auth.uid()
  ));

CREATE POLICY "Admins manage all messages" ON public.messages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Bump conversation last_message_at on new message
CREATE OR REPLACE FUNCTION public.bump_conversation_last_message()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = now(),
        unread_count = CASE WHEN NEW.sender_type = 'tenant' THEN unread_count + 1 ELSE unread_count END
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_messages_bump_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_last_message();

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  type text NOT NULL, -- new_qualified_lead | viewing_accepted | viewing_declined | new_message
  title text NOT NULL,
  body text,
  link text,
  related_lead_id uuid,
  related_conversation_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_agency ON public.notifications(agency_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies manage own notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (agency_id = auth.uid())
  WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Admins view all notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;