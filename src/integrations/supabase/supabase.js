/**
 * Supabase Configuration
 * 
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Settings > API
 * 3. Copy your Project URL and anon/public key
 * 4. Create a .env file in the root directory with:
 *    VITE_SUPABASE_URL=your_project_url
 *    VITE_SUPABASE_ANON_KEY=your_anon_key
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use environment variables with fallback values for build-time safety
// Update these fallback values to match your .env file if needed
const url = supabaseUrl || 'https://pdcwabsevcfbdltqlcpb.supabase.co'
const key = supabaseAnonKey || 'sb_publishable_OxpGS3BVemmfeRVroxQcfg_855CrXbS'

// Validate and warn in development
if (import.meta.env.DEV) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables. Using fallback values.')
    console.warn('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
  } else {
    console.log('✅ Supabase environment variables loaded successfully')
  }
  
  // Validate URL format
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    console.error('❌ Invalid Supabase URL format:', url)
  }
  
  // Validate key format
  if (!key || key.length < 20) {
    console.error('❌ Invalid Supabase key format')
  }
}

export const supabase = createClient(url, key, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Export URL for use in other components
export const getSupabaseUrl = () => url

/**
 * Image Storage Helper Functions
 * 
 * The images are stored in Supabase Storage bucket named "media"
 * Images are organized in folders: "uploads" and "articles"
 * 
 * Upload images using the ImageUpload component or process-image edge function
 * Access images via: supabase.storage.from('media').getPublicUrl(path)
 */

/**
 * Get public URL for an image
 * @param {string} path - Image path (e.g., "uploads/image-name.webp" or "articles/image-name.webp")
 * @returns {string} Public URL of the image
 */
export const getImageUrl = (path) => {
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

/**
 * List images from a specific folder
 * @param {string} folder - Folder name ('uploads' or 'articles')
 * @param {number} limit - Maximum number of images to return
 * @returns {Promise<Array>} Array of image file objects
 */
export const listImages = async (folder = 'uploads', limit = 100) => {
  const { data, error } = await supabase.storage
    .from('media')
    .list(folder, { limit, sortBy: { column: 'created_at', order: 'desc' } })
  
  if (error) {
    console.error('Error listing images:', error)
    return []
  }
  
  return (data || []).filter(file => 
    file.name !== '.emptyFolderPlaceholder' && 
    !file.name.endsWith('/')
  )
}

/**
 * Delete an image from storage
 * @param {string} path - Full path to the image (e.g., "uploads/image-name.webp")
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const deleteImage = async (path) => {
  const { error } = await supabase.storage
    .from('media')
    .remove([path])
  
  if (error) {
    console.error('Error deleting image:', error)
    return false
  }
  
  return true
}

// Log success in development
if (import.meta.env.DEV) {
  console.log('✅ Supabase client initialized successfully')
  console.log('📍 Supabase URL:', url.replace(/https:\/\/(.*)\.supabase\.co/, 'https://***.supabase.co'))
  
  // Test connection to articles table
  supabase.from('articles')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase articles table connection test failed:', error.message)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        console.error('💡 Solutions:')
        console.error('   1. Check your Supabase URL and API key in .env file')
        console.error('   2. Make sure the "articles" table exists in your Supabase database')
        console.error('   3. Enable Row Level Security (RLS) policies - see supabase/rls-policies.sql')
        console.error('   4. Run the SQL in supabase/rls-policies.sql in your Supabase SQL Editor')
        
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          console.error('')
          console.error('🔒 RLS Policy Error Detected!')
          console.error('   Go to Supabase Dashboard > SQL Editor')
          console.error('   Run the SQL from: supabase/rls-policies.sql')
        }
      } else {
        console.log('✅ Supabase articles table connection test successful')
        console.log('📊 Found', data?.length || 0, 'article(s)')
      }
    })
    .catch((err) => {
      console.error('❌ Supabase connection error:', err)
    })
  
  // Test connection to categories table
  supabase.from('categories')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase categories table connection test failed:', error.message)
      } else {
        console.log('✅ Supabase categories table connection test successful')
        console.log('📊 Found', data?.length || 0, 'categorie(s)')
      }
    })
    .catch((err) => {
      console.error('❌ Categories connection error:', err)
    })
  
  // Test connection to media storage bucket
  supabase.storage
    .from('media')
    .list('uploads', { limit: 1 })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase media storage bucket test failed:', error.message)
        console.error('💡 Solutions:')
        console.error('   1. Make sure the "media" storage bucket exists in Supabase')
        console.error('   2. Check Storage > Settings in your Supabase dashboard')
        console.error('   3. Run the SQL from: supabase/migrations/*.sql (creates the bucket)')
        console.error('   4. Verify RLS policies allow access - see supabase/rls-policies.sql')
        
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          console.error('')
          console.error('📦 Storage Bucket Missing!')
          console.error('   Go to Supabase Dashboard > Storage')
          console.error('   Create a bucket named "media" and make it public')
          console.error('   Or run the migration SQL that creates it')
        }
      } else {
        console.log('✅ Supabase media storage bucket test successful')
        console.log('📊 Found', data?.length || 0, 'image(s) in uploads folder')
      }
    })
    .catch((err) => {
      console.error('❌ Media storage connection error:', err)
    })
  
  // Test connection to media storage bucket (articles folder)
  supabase.storage
    .from('media')
    .list('articles', { limit: 1 })
    .then(({ data, error }) => {
      if (error) {
        // It's okay if articles folder doesn't exist yet
        if (!error.message?.includes('not found') && !error.message?.includes('does not exist')) {
          console.warn('⚠️ Supabase media storage (articles folder) test:', error.message)
        }
      } else {
        console.log('✅ Supabase media storage (articles folder) accessible')
        console.log('📊 Found', data?.length || 0, 'image(s) in articles folder')
      }
    })
    .catch((err) => {
      // Silently ignore - articles folder may not exist yet
    })
}

