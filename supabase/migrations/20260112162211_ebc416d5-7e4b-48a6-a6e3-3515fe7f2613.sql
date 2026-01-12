-- Drop the security definer view and recreate with security invoker (default)
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER (uses invoker by default)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
    id,
    full_name,
    avatar_url,
    bio,
    created_at
FROM public.profiles;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add a policy for anonymous users to see profiles (but the view hides email)
CREATE POLICY "Anonymous can view profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);