
-- Fix storage RLS: allow authenticated users to upload/read/delete from media bucket
-- First, create policies for storage.objects on the media bucket

CREATE POLICY "Authenticated users can upload to media bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated users can read media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Users can delete own media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] IN (auth.uid()::text, 'avatars', 'messages', 'stories', 'documents'));

CREATE POLICY "Users can update own media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Also allow public read for the media bucket (it's already public but ensure objects are readable)
CREATE POLICY "Public can read media files"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'media');
