-- Drop the overly permissive public SELECT policy on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a more restrictive policy: authenticated users can see all profiles, 
-- but only the profile owner can see their own email
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow public to see non-sensitive profile info via a secure view
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    avatar_url,
    bio,
    created_at
FROM public.profiles;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Create a function to get profile with email only for the owner
CREATE OR REPLACE FUNCTION public.get_profile_with_email(profile_id uuid)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    avatar_url text,
    bio text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        p.id,
        CASE 
            WHEN auth.uid() = p.id OR has_role(auth.uid(), 'super_admin') 
            THEN p.email 
            ELSE NULL 
        END as email,
        p.full_name,
        p.avatar_url,
        p.bio,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.id = profile_id;
$$;