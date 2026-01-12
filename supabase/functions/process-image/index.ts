import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate SEO-friendly filename
function generateSeoFilename(originalName: string, folder: string): string {
  const timestamp = Date.now()
  const cleanName = originalName
    .toLowerCase()
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens
    .substring(0, 50) // Limit length
  
  return `${folder}/${cleanName}-${timestamp}.webp`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get auth header for user validation
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user token to check permissions
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Get user
    const { data: { user }, error: userError } = await userSupabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Service role client for operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'editor', 'author'])
      .maybeSingle()
    
    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'
    const generateSizes = formData.get('generateSizes') === 'true'
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Accepted: PNG, JPG, JPEG, WEBP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Generate SEO-friendly filename
    const seoFilename = generateSeoFilename(file.name, folder)
    
    // For now, we'll upload the image directly
    // In production, you'd use a service like Sharp via a different approach
    // Since Deno Edge Functions have limitations on image processing libraries
    
    // Check file size - if already under 300KB, upload directly
    const fileSizeKB = uint8Array.length / 1024
    
    if (fileSizeKB > 300 && file.type !== 'image/webp') {
      // For larger files that aren't WebP, we need to handle compression
      // Since we can't use Sharp in Deno, we'll inform the client
      return new Response(
        JSON.stringify({ 
          error: 'Image too large. Please compress your image to under 300KB or use WebP format.',
          currentSize: Math.round(fileSizeKB),
          maxSize: 300
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upload the image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(seoFilename, uint8Array, {
        contentType: file.type === 'image/webp' ? 'image/webp' : file.type,
        upsert: false
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(seoFilename)

    return new Response(
      JSON.stringify({ 
        success: true,
        url: urlData.publicUrl,
        path: seoFilename,
        size: Math.round(fileSizeKB),
        message: 'Image uploaded successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
