import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Get article counts by status
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('status, view_count');

      if (articlesError) throw articlesError;

      const totalArticles = articles?.length || 0;
      const publishedArticles = articles?.filter(a => a.status === 'published').length || 0;
      const draftArticles = articles?.filter(a => a.status === 'draft').length || 0;
      const totalViews = articles?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;

      // Get category count
      const { count: categoryCount, error: categoryError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (categoryError) throw categoryError;

      // Get subscriber count
      const { count: subscriberCount, error: subscriberError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (subscriberError) throw subscriberError;

      // Get recent articles
      const { data: recentArticles, error: recentError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          status,
          view_count,
          created_at,
          category:categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      return {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        categoryCount: categoryCount || 0,
        subscriberCount: subscriberCount || 0,
        recentArticles: recentArticles || [],
      };
    },
  });
};
