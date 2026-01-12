import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  reading_time: number | null;
  published_at: string | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  view_count: number | null;
  author_id: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

export const usePublishedArticles = () => {
  return useQuery({
    queryKey: ['published-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          published_at,
          is_featured,
          is_trending,
          view_count,
          author_id,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as PublicArticle[];
    },
  });
};

export const useFeaturedArticles = () => {
  return useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          published_at,
          is_featured,
          is_trending,
          view_count,
          author_id,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as PublicArticle[];
    },
  });
};

export const useTrendingArticles = () => {
  return useQuery({
    queryKey: ['trending-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          published_at,
          is_featured,
          is_trending,
          view_count,
          author_id,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .eq('is_trending', true)
        .order('view_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as PublicArticle[];
    },
  });
};

export const useLatestArticles = (limit: number = 9) => {
  return useQuery({
    queryKey: ['latest-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          published_at,
          is_featured,
          is_trending,
          view_count,
          author_id,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PublicArticle[];
    },
  });
};

export const useArticlesByCategory = (categorySlug: string, limit: number = 6) => {
  return useQuery({
    queryKey: ['articles-by-category', categorySlug, limit],
    queryFn: async () => {
      // First get the category
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (!category) return [];

      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          published_at,
          is_featured,
          is_trending,
          view_count,
          author_id,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .eq('category_id', category.id)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PublicArticle[];
    },
    enabled: !!categorySlug,
  });
};

export const usePublicArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['public-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          video_url,
          reading_time,
          published_at,
          is_featured,
          is_trending,
          view_count,
          author_id,
          meta_title,
          meta_description,
          meta_keywords,
          og_image,
          canonical_url,
          category:categories(id, name, slug, color)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};