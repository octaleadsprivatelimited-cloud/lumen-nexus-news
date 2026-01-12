import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { PublicArticle } from './usePublicArticles';

type Tag = Database['public']['Tables']['tags']['Row'];
type TagInsert = Database['public']['Tables']['tags']['Insert'];
type TagUpdate = Database['public']['Tables']['tags']['Update'];

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useTagBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['tag', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useArticlesByTag = (tagSlug: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['articles-by-tag', tagSlug, limit],
    queryFn: async () => {
      // First get the tag
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle();

      if (!tag) return [];

      // Get article IDs from article_tags junction table
      const { data: articleTags } = await supabase
        .from('article_tags')
        .select('article_id')
        .eq('tag_id', tag.id);

      if (!articleTags || articleTags.length === 0) return [];

      const articleIds = articleTags.map(at => at.article_id);

      // Fetch articles
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
        .in('id', articleIds)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PublicArticle[];
    },
    enabled: !!tagSlug,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: TagInsert) => {
      const { data, error } = await supabase
        .from('tags')
        .insert(tag)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
