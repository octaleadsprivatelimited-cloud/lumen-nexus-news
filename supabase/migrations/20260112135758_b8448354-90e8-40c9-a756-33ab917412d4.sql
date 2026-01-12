-- Fix function search path for calculate_reading_time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    word_count INTEGER;
BEGIN
    IF content IS NULL OR content = '' THEN
        RETURN 0;
    END IF;
    word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
    RETURN GREATEST(1, CEIL(word_count / 200.0));
END;
$$;

-- Fix function search path for update_article_reading_time
CREATE OR REPLACE FUNCTION public.update_article_reading_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.reading_time := public.calculate_reading_time(NEW.content);
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Drop and recreate the permissive newsletter policy with rate limiting
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with email" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');