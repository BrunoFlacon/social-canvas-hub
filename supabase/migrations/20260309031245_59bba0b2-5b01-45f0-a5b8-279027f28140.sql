
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- contacts
DROP POLICY IF EXISTS "contacts_select" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete" ON public.contacts;
CREATE POLICY "contacts_select" ON public.contacts AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert" ON public.contacts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update" ON public.contacts AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete" ON public.contacts AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- documents
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;
CREATE POLICY "documents_select" ON public.documents AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "documents_insert" ON public.documents AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update" ON public.documents AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "documents_delete" ON public.documents AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- media
DROP POLICY IF EXISTS "media_select" ON public.media;
DROP POLICY IF EXISTS "media_insert" ON public.media;
DROP POLICY IF EXISTS "media_update" ON public.media;
DROP POLICY IF EXISTS "media_delete" ON public.media;
CREATE POLICY "media_select" ON public.media AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "media_insert" ON public.media AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "media_update" ON public.media AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "media_delete" ON public.media AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;
DROP POLICY IF EXISTS "messages_delete" ON public.messages;
CREATE POLICY "messages_select" ON public.messages AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages_insert" ON public.messages AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update" ON public.messages AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages_delete" ON public.messages AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messaging_channels
DROP POLICY IF EXISTS "channels_select" ON public.messaging_channels;
DROP POLICY IF EXISTS "channels_insert" ON public.messaging_channels;
DROP POLICY IF EXISTS "channels_update" ON public.messaging_channels;
DROP POLICY IF EXISTS "channels_delete" ON public.messaging_channels;
CREATE POLICY "channels_select" ON public.messaging_channels AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "channels_insert" ON public.messaging_channels AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "channels_update" ON public.messaging_channels AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "channels_delete" ON public.messaging_channels AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON public.notifications AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete" ON public.notifications AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- oauth_states
DROP POLICY IF EXISTS "oauth_select" ON public.oauth_states;
DROP POLICY IF EXISTS "oauth_insert" ON public.oauth_states;
DROP POLICY IF EXISTS "oauth_delete" ON public.oauth_states;
CREATE POLICY "oauth_select" ON public.oauth_states AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "oauth_insert" ON public.oauth_states AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "oauth_delete" ON public.oauth_states AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- scheduled_posts
DROP POLICY IF EXISTS "posts_select" ON public.scheduled_posts;
DROP POLICY IF EXISTS "posts_insert" ON public.scheduled_posts;
DROP POLICY IF EXISTS "posts_update" ON public.scheduled_posts;
DROP POLICY IF EXISTS "posts_delete" ON public.scheduled_posts;
CREATE POLICY "posts_select" ON public.scheduled_posts AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_insert" ON public.scheduled_posts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON public.scheduled_posts AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON public.scheduled_posts AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- social_connections
DROP POLICY IF EXISTS "social_select" ON public.social_connections;
DROP POLICY IF EXISTS "social_insert" ON public.social_connections;
DROP POLICY IF EXISTS "social_update" ON public.social_connections;
DROP POLICY IF EXISTS "social_delete" ON public.social_connections;
CREATE POLICY "social_select" ON public.social_connections AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "social_insert" ON public.social_connections AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_update" ON public.social_connections AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "social_delete" ON public.social_connections AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- stories_lives
DROP POLICY IF EXISTS "stories_select" ON public.stories_lives;
DROP POLICY IF EXISTS "stories_insert" ON public.stories_lives;
DROP POLICY IF EXISTS "stories_update" ON public.stories_lives;
DROP POLICY IF EXISTS "stories_delete" ON public.stories_lives;
CREATE POLICY "stories_select" ON public.stories_lives AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "stories_insert" ON public.stories_lives AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_update" ON public.stories_lives AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "stories_delete" ON public.stories_lives AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "roles_select" ON public.user_roles;
CREATE POLICY "roles_select" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
