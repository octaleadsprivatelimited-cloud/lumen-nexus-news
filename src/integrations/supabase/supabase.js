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
}

