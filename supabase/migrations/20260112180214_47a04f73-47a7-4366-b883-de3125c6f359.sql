-- Create reading_analytics table to track article reading behavior
CREATE TABLE public.reading_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  scroll_depth INTEGER NOT NULL DEFAULT 0,
  time_on_page INTEGER NOT NULL DEFAULT 0,
  completed_reading BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_reading_analytics_article ON public.reading_analytics(article_id);
CREATE INDEX idx_reading_analytics_created ON public.reading_analytics(created_at);

-- Enable RLS
ALTER TABLE public.reading_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (anonymous tracking)
CREATE POLICY "Anyone can insert reading analytics"
ON public.reading_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view reading analytics"
ON public.reading_analytics
FOR SELECT
USING (is_admin(auth.uid()));

-- Create function to aggregate reading stats per article
CREATE OR REPLACE FUNCTION public.get_article_reading_stats(article_uuid UUID)
RETURNS TABLE(
  total_reads BIGINT,
  avg_scroll_depth NUMERIC,
  avg_time_on_page NUMERIC,
  completion_rate NUMERIC
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) as total_reads,
    ROUND(AVG(scroll_depth), 1) as avg_scroll_depth,
    ROUND(AVG(time_on_page), 1) as avg_time_on_page,
    ROUND((SUM(CASE WHEN completed_reading THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1) as completion_rate
  FROM public.reading_analytics
  WHERE article_id = article_uuid;
$$;