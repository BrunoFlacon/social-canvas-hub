
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- contacts
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
CREATE POLICY "contacts_select" ON public.contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "documents_select" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "documents_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "documents_delete" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- media
DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
DROP POLICY IF EXISTS "Users can insert their own media" ON public.media;
DROP POLICY IF EXISTS "Users can update their own media" ON public.media;
DROP POLICY IF EXISTS "Users can delete their own media" ON public.media;
CREATE POLICY "media_select" ON public.media FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "media_insert" ON public.media FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "media_update" ON public.media FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "media_delete" ON public.media FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages_delete" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messaging_channels
DROP POLICY IF EXISTS "Users can view own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can insert own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can update own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can delete own channels" ON public.messaging_channels;
CREATE POLICY "channels_select" ON public.messaging_channels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "channels_insert" ON public.messaging_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "channels_update" ON public.messaging_channels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "channels_delete" ON public.messaging_channels FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- oauth_states
DROP POLICY IF EXISTS "Users can view their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can insert their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can delete their own oauth states" ON public.oauth_states;
CREATE POLICY "oauth_select" ON public.oauth_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "oauth_insert" ON public.oauth_states FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "oauth_delete" ON public.oauth_states FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- scheduled_posts
DROP POLICY IF EXISTS "Users can view their own posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.scheduled_posts;
CREATE POLICY "posts_select" ON public.scheduled_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_insert" ON public.scheduled_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON public.scheduled_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON public.scheduled_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- social_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.social_connections;
CREATE POLICY "social_select" ON public.social_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "social_insert" ON public.social_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_update" ON public.social_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "social_delete" ON public.social_connections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- stories_lives
DROP POLICY IF EXISTS "Users can view own stories_lives" ON public.stories_lives;
DROP POLICY IF EXISTS "Users can insert own stories_lives" ON public.stories_lives;
DROP POLICY IF EXISTS "Users can update own stories_lives" ON public.stories_lives;
DROP POLICY IF EXISTS "Users can delete own stories_lives" ON public.stories_lives;
CREATE POLICY "stories_select" ON public.stories_lives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "stories_insert" ON public.stories_lives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_update" ON public.stories_lives FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "stories_delete" ON public.stories_lives FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
