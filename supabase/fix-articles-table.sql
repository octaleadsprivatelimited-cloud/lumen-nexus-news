-- Fix Articles Table - Add missing columns if they don't exist
-- Run this SQL in your Supabase SQL Editor if you get "column does not exist" errors

-- Add content column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'articles' 
        AND column_name = 'content'
    ) THEN
        ALTER TABLE public.articles ADD COLUMN content TEXT;
        RAISE NOTICE 'Added content column to articles table';
    ELSE
        RAISE NOTICE 'Content column already exists';
    END IF;
END $$;

-- Add video_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'articles' 
        AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.articles ADD COLUMN video_url TEXT DEFAULT NULL;
        RAISE NOTICE 'Added video_url column to articles table';
    ELSE
        RAISE NOTICE 'Video_url column already exists';
    END IF;
END $$;

-- Verify all required columns exist
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY[
        'id', 'title', 'slug', 'excerpt', 'content', 
        'featured_image', 'featured_image_alt', 'author_id', 
        'category_id', 'status', 'is_featured', 'is_trending', 
        'view_count', 'reading_time', 'published_at', 
        'scheduled_at', 'created_at', 'updated_at'
    ];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'articles' 
            AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Missing columns: %', array_to_string(missing_columns, ', ');
        RAISE WARNING 'Some required columns are missing. Consider running create-tables.sql to recreate the table properly.';
    ELSE
        RAISE NOTICE '✅ All required columns exist in articles table';
    END IF;
END $$;

-- Success message
SELECT '✅ Articles table fix completed. Check the messages above for any issues.' as status;

