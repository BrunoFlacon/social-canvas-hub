
-- 1. Create safe view for social_connections (without tokens)
CREATE VIEW public.social_connections_safe AS
SELECT 
  id, user_id, platform, is_connected, page_id, page_name, 
  platform_user_id, token_expires_at, created_at, updated_at
FROM public.social_connections;

-- 2. Enable RLS on the view
ALTER VIEW public.social_connections_safe SET (security_invoker = on);

-- 3. Create oauth_states table for CSRF protection
CREATE TABLE public.oauth_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  state text NOT NULL UNIQUE,
  redirect_uri text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own oauth states"
ON public.oauth_states FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own oauth states"
ON public.oauth_states FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth states"
ON public.oauth_states FOR DELETE
USING (auth.uid() = user_id);

-- 4. Add bulk_import_id to scheduled_posts
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS bulk_import_id uuid;

-- 5. Enable realtime for scheduled_posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_posts;
