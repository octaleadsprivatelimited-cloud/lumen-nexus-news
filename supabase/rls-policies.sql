-- Row Level Security (RLS) Policies for Public Access
-- Run this SQL in your Supabase SQL Editor to allow public read access

-- Enable RLS on articles table (if not already enabled)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to published articles
CREATE POLICY "Allow public read access to published articles"
ON public.articles
FOR SELECT
USING (status = 'published' OR status IS NULL);

-- Alternative: Allow public read access to ALL articles (less secure)
-- CREATE POLICY "Allow public read access to all articles"
-- ON public.articles
-- FOR SELECT
-- USING (true);

-- Enable RLS on categories table (if not already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active categories
CREATE POLICY "Allow public read access to active categories"
ON public.categories
FOR SELECT
USING (is_active = true OR is_active IS NULL);

-- Alternative: Allow public read access to ALL categories
-- CREATE POLICY "Allow public read access to all categories"
-- ON public.categories
-- FOR SELECT
-- USING (true);

-- Note: If your table structure is different, adjust the policies accordingly
-- For example, if you don't have a 'status' column, use the alternative policy

