-- Create storage bucket for media
-- Run this SQL in your Supabase SQL Editor if the "media" bucket doesn't exist

-- Create the media bucket (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media', 
    'media', 
    true,
    20971520,  -- 20MB max upload
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket

-- Allow anyone to view media files
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow admins to upload media
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND is_admin(auth.uid()));

-- Allow admins to update media
CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND is_admin(auth.uid()));

-- Allow admins to delete media
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND is_admin(auth.uid()));

