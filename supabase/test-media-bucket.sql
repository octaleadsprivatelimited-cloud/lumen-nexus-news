-- Test queries for media storage bucket
-- Run these queries in Supabase SQL Editor to verify your setup

-- 1. Check if the media bucket exists
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'media';

-- 2. Check storage policies for media bucket
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%media%'
ORDER BY policyname;

-- 3. Test: List files in media bucket (if any exist)
-- Note: This requires proper RLS policies
SELECT 
    id,
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'media'
LIMIT 10;

-- 4. Check if you have admin function (required for policies)
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- 5. Test admin function (replace 'YOUR_USER_ID' with actual user ID)
-- SELECT is_admin('YOUR_USER_ID'::uuid);

-- 6. Verify bucket is public
SELECT 
    CASE 
        WHEN public THEN '✅ Bucket is PUBLIC'
        ELSE '❌ Bucket is PRIVATE'
    END as bucket_status,
    CASE 
        WHEN file_size_limit = 20971520 THEN '✅ File size limit: 20MB'
        ELSE '⚠️ File size limit: ' || (file_size_limit / 1024 / 1024) || 'MB'
    END as size_limit_status
FROM storage.buckets 
WHERE id = 'media';

