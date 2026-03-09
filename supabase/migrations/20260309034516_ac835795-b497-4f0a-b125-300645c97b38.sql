CREATE TABLE public.api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL,
  credentials jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creds_select" ON public.api_credentials AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "creds_insert" ON public.api_credentials AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "creds_update" ON public.api_credentials AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "creds_delete" ON public.api_credentials AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_api_credentials_updated_at BEFORE UPDATE ON public.api_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();