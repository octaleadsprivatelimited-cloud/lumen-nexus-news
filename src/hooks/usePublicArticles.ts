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
      // First, try to get all articles to see what we have
      let query = supabase
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
        `);

      // Try to filter by status if the column exists
      try {
        query = query.eq('status', 'published');
      } catch (e) {
        // If status column doesn't exist, continue without it
        console.warn('Status column not found, fetching all articles');
      }

      // Filter by is_featured if it exists
      try {
        query = query.eq('is_featured', true);
      } catch (e) {
        // If is_featured doesn't exist, skip it
      }

      query = query.order('published_at', { ascending: false }).limit(5);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching featured articles:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If RLS error, provide helpful message
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          throw new Error('Database permission denied. Please enable Row Level Security (RLS) policies in Supabase to allow public read access to the articles table.');
        }
        
        throw error;
      }
      
      // Filter in memory if status column doesn't exist
      let filteredData = data || [];
      if (data && data.length > 0 && !data[0].hasOwnProperty('status')) {
        // If no status column, return all articles as "published"
        filteredData = data.filter((article: any) => {
          // If is_featured exists, filter by it, otherwise return all
          return article.is_featured !== false;
        });
      } else if (data) {
        filteredData = data.filter((article: any) => article.status === 'published' && article.is_featured === true);
      }
      
      if (import.meta.env.DEV) {
        console.log('Featured articles loaded:', filteredData?.length || 0, 'out of', data?.length || 0, 'total');
      }
      
      return filteredData as PublicArticle[];
    },
  });
};

export const useTrendingArticles = () => {
  return useQuery({
    queryKey: ['trending-articles'],
    queryFn: async () => {
      let query = supabase
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
        `);

      // Try to filter by status
      try {
        query = query.eq('status', 'published');
      } catch (e) {
        console.warn('Status column not found');
      }

      // Try to filter by is_trending
      try {
        query = query.eq('is_trending', true);
      } catch (e) {
        console.warn('is_trending column not found');
      }

      query = query.order('view_count', { ascending: false }).limit(12);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching trending articles:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If RLS error, provide helpful message
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          throw new Error('Database permission denied. Please enable Row Level Security (RLS) policies in Supabase to allow public read access to the articles table.');
        }
        
        throw error;
      }
      
      // Filter in memory if columns don't exist
      let filteredData = data || [];
      if (data && data.length > 0) {
        filteredData = data.filter((article: any) => {
          const hasStatus = article.hasOwnProperty('status');
          const hasTrending = article.hasOwnProperty('is_trending');
          
          if (!hasStatus && !hasTrending) {
            // If neither column exists, return all
            return true;
          }
          
          const statusOk = !hasStatus || article.status === 'published';
          const trendingOk = !hasTrending || article.is_trending === true;
          
          return statusOk && trendingOk;
        });
      }
      
      if (import.meta.env.DEV) {
        console.log('Trending articles loaded:', filteredData?.length || 0);
      }
      
      return filteredData as PublicArticle[];
    },
  });
};

export const useLatestArticles = (limit: number = 9) => {
  return useQuery({
    queryKey: ['latest-articles', limit],
    queryFn: async () => {
      let query = supabase
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
        `);

      // Try to filter by status, but handle if column doesn't exist
      try {
        query = query.eq('status', 'published');
      } catch (e) {
        console.warn('Status column not found, fetching all articles');
      }

      query = query.order('published_at', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching latest articles:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If RLS error, provide helpful message
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          throw new Error('Database permission denied. Please enable Row Level Security (RLS) policies in Supabase to allow public read access to the articles table.');
        }
        
        throw error;
      }
      
      // Filter in memory if status column doesn't exist
      let filteredData = data || [];
      if (data && data.length > 0 && !data[0].hasOwnProperty('status')) {
        // If no status column, return all articles
        filteredData = data;
      } else if (data) {
        filteredData = data.filter((article: any) => article.status === 'published');
      }
      
      if (import.meta.env.DEV) {
        console.log('Latest articles loaded:', filteredData?.length || 0, 'out of', data?.length || 0, 'total');
      }
      
      return filteredData as PublicArticle[];
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