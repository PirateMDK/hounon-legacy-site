
CREATE TABLE public.message_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','whatsapp')),
  body text NOT NULL,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_message_replies_message ON public.message_replies(message_id, created_at DESC);
ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read replies" ON public.message_replies FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "staff write replies" ON public.message_replies FOR ALL USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.message_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  note text,
  done boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_message_followups_message ON public.message_followups(message_id);
CREATE INDEX idx_message_followups_pending ON public.message_followups(remind_at) WHERE done = false;
ALTER TABLE public.message_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read followups" ON public.message_followups FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "staff write followups" ON public.message_followups FOR ALL USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
