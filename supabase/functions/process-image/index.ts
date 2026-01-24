// @ts-ignore - Deno edge function, types are provided by Supabase runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Deno global types (provided by Supabase edge runtime)
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

// ✅ CORS (safe for browsers + Supabase)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

// ✅ Generate SEO-friendly filename
function generateSeoFilename(originalName: string, folder: string): string {
  const timestamp = Date.now();
  const cleanName = originalName
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  return `${folder}/${cleanName}-${timestamp}.webp`;
}

Deno.serve(async (req: Request) => {
  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ✅ Supabase client (service role for storage upload)
    const supabase = createClient(supabaseUrl, serviceKey);

    // ✅ Read multipart form data (Tiptap compatible)
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'articles';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Validate image type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Convert to Uint8Array
    const buffer = new Uint8Array(await file.arrayBuffer());
    const sizeKB = Math.round(buffer.length / 1024);

    // ✅ Optional: enforce max size (200KB)
    if (sizeKB > 200) {
      return new Response(
        JSON.stringify({ error: 'Image exceeds 200KB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Generate filename
    const filename = generateSeoFilename(file.name, folder);

    // ✅ Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, buffer, {
        contentType: 'image/webp',
        upsert: false,
        cacheControl: '3600', // Cache for 1 hour (in seconds)
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Get public URL (bucket must be PUBLIC)
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    // ✅ SUCCESS RESPONSE (2xx REQUIRED BY TIPTAP)
    return new Response(
      JSON.stringify({
        success: true,
        url: data.publicUrl,
        path: filename,
        size: sizeKB,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
