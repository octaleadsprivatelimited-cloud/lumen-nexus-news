-- Complete Database Setup for 9knowledge News Portal
-- Run this SQL in your Supabase SQL Editor to create all necessary tables
-- This script is idempotent - it won't fail if tables already exist

-- Create enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'editor', 'author');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for article status (if not exists)
DO $$ BEGIN
    CREATE TYPE public.article_status AS ENUM ('draft', 'published', 'scheduled', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table with SEO fields
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    featured_image_alt TEXT,
    video_url TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status article_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    -- SEO fields
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image TEXT,
    canonical_url TEXT,
    no_index BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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
    END IF;
END $$;

-- Create article_tags junction table
CREATE TABLE IF NOT EXISTS public.article_tags (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Create ad_slots table
CREATE TABLE IF NOT EXISTS public.ad_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slot_id TEXT NOT NULL,
    position TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('super_admin', 'editor', 'author')
    )
$$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin can manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;

DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;

DROP POLICY IF EXISTS "Article tags are viewable by everyone" ON public.article_tags;
DROP POLICY IF EXISTS "Admins can manage article tags" ON public.article_tags;

DROP POLICY IF EXISTS "Ad slots are viewable by everyone" ON public.ad_slots;
DROP POLICY IF EXISTS "Super admin can manage ad slots" ON public.ad_slots;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can manage roles" 
ON public.user_roles FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for tags
CREATE POLICY "Tags are viewable by everyone" 
ON public.tags FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" 
ON public.tags FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for articles - IMPORTANT: Allow public to read published articles
CREATE POLICY "Published articles are viewable by everyone" 
ON public.articles FOR SELECT 
USING (status = 'published' OR status IS NULL OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

CREATE POLICY "Admins can insert articles" 
ON public.articles FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update articles" 
ON public.articles FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete articles" 
ON public.articles FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS Policies for article_tags
CREATE POLICY "Article tags are viewable by everyone" 
ON public.article_tags FOR SELECT USING (true);

CREATE POLICY "Admins can manage article tags" 
ON public.article_tags FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for ad_slots
CREATE POLICY "Ad slots are viewable by everyone" 
ON public.ad_slots FOR SELECT USING (true);

CREATE POLICY "Super admin can manage ad slots" 
ON public.ad_slots FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe" 
ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view subscribers" 
ON public.newsletter_subscribers FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage subscribers" 
ON public.newsletter_subscribers FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create helper functions
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
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

CREATE OR REPLACE FUNCTION public.update_article_reading_time()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.reading_time := public.calculate_reading_time(NEW.content);
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS article_reading_time_trigger ON public.articles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_ad_slots_updated_at ON public.ad_slots;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create triggers
CREATE TRIGGER article_reading_time_trigger
BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_article_reading_time();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_slots_updated_at
BEFORE UPDATE ON public.ad_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle new user (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON public.articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_trending ON public.articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Insert default categories (only if they don't exist)
INSERT INTO public.categories (name, slug, description, color, sort_order, is_active) 
VALUES
('Health', 'health', 'Health and wellness articles', 'health', 1, true),
('Food', 'food', 'Food and nutrition articles', 'food', 2, true),
('Technology', 'technology', 'Latest tech news and tutorials', 'technology', 3, true),
('Facts', 'facts', 'Interesting facts and trivia', 'facts', 4, true),
('Finance', 'finance', 'Financial tips and investment advice', 'finance', 5, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: articles, categories, tags, profiles, user_roles, article_tags, ad_slots, newsletter_subscribers';
    RAISE NOTICE '🔒 RLS policies enabled for all tables';
    RAISE NOTICE '📝 Default categories inserted';
END $$;

