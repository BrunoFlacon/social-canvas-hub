
-- Fix all RLS policies from RESTRICTIVE to PERMISSIVE

-- contacts
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
CREATE POLICY "Users can view own contacts" ON public.contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- media
DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
DROP POLICY IF EXISTS "Users can insert their own media" ON public.media;
DROP POLICY IF EXISTS "Users can update their own media" ON public.media;
DROP POLICY IF EXISTS "Users can delete their own media" ON public.media;
CREATE POLICY "Users can view their own media" ON public.media FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own media" ON public.media FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON public.media FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media" ON public.media FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messaging_channels
DROP POLICY IF EXISTS "Users can view own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can insert own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can update own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can delete own channels" ON public.messaging_channels;
CREATE POLICY "Users can view own channels" ON public.messaging_channels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own channels" ON public.messaging_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channels" ON public.messaging_channels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own channels" ON public.messaging_channels FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- scheduled_posts
DROP POLICY IF EXISTS "Users can view their own posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.scheduled_posts;
CREATE POLICY "Users can view their own posts" ON public.scheduled_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posts" ON public.scheduled_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.scheduled_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.scheduled_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- stories_lives
DROP POLICY IF EXISTS "Users can view own stories_lives" ON public.stories_lives;
DROP POLICY IF EXISTS "Users can insert own stories_lives" ON public.stories_lives;
DROP POLICY IF EXISTS "Users can update own stories_lives" ON public.stories_lives;
DROP POLICY IF EXISTS "Users can delete own stories_lives" ON public.stories_lives;
CREATE POLICY "Users can view own stories_lives" ON public.stories_lives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stories_lives" ON public.stories_lives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories_lives" ON public.stories_lives FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories_lives" ON public.stories_lives FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- oauth_states
DROP POLICY IF EXISTS "Users can view their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can insert their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can delete their own oauth states" ON public.oauth_states;
CREATE POLICY "Users can view their own oauth states" ON public.oauth_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own oauth states" ON public.oauth_states FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own oauth states" ON public.oauth_states FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- social_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.social_connections;
CREATE POLICY "Users can view their own connections" ON public.social_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own connections" ON public.social_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own connections" ON public.social_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own connections" ON public.social_connections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_roles (SELECT only)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
