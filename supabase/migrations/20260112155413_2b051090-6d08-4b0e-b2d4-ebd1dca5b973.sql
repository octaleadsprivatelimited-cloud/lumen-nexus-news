-- Create table for ping logs
CREATE TABLE public.supabase_pings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pinged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'success',
    response_time_ms INTEGER,
    error_message TEXT
);

-- Enable RLS
ALTER TABLE public.supabase_pings ENABLE ROW LEVEL SECURITY;

-- Allow admins to view pings
CREATE POLICY "Admins can view pings" 
ON public.supabase_pings 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow service role to insert pings (edge function will use service role)
CREATE POLICY "Service can insert pings" 
ON public.supabase_pings 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images', 
    'images', 
    true,
    20971520,  -- 20MB max upload
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND is_admin(auth.uid()));