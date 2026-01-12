import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
  published_at: string | null;
  reading_time: number | null;
}

export const useSearch = (query: string, debounceMs: number = 300) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: searchError } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            reading_time,
            category:categories(name, slug)
          `)
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
          .order('published_at', { ascending: false })
          .limit(10);

        if (searchError) throw searchError;

        setResults(data as SearchResult[]);
      } catch (err) {
        setError(err as Error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return { results, isLoading, error };
};
