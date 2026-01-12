-- Add video_url column to articles table for embedded videos
ALTER TABLE public.articles
ADD COLUMN video_url TEXT DEFAULT NULL;