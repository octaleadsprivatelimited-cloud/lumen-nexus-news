-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service can insert pings" ON public.supabase_pings;

-- Create a more restrictive policy - only allow inserts via service role (no auth.uid check needed for service role)
-- Since edge functions use service role key, they bypass RLS anyway
-- We just need to ensure no regular users can insert
CREATE POLICY "No public inserts"
ON public.supabase_pings
FOR INSERT
WITH CHECK (false);