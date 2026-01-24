// @ts-ignore - Deno edge function, types are provided by Supabase runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno global types (provided by Supabase edge runtime)
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test database connection by querying categories (simple read)
    const { error: testError } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
    
    const responseTimeMs = Date.now() - startTime
    
    if (testError) {
      // Log failed ping
      await supabase.from('supabase_pings').insert({
        status: 'error',
        response_time_ms: responseTimeMs,
        error_message: testError.message
      })
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: testError.message,
          response_time_ms: responseTimeMs 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Log successful ping
    const { error: insertError } = await supabase.from('supabase_pings').insert({
      status: 'success',
      response_time_ms: responseTimeMs
    })
    
    if (insertError) {
      console.error('Failed to log ping:', insertError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database connection verified',
        response_time_ms: responseTimeMs,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    const responseTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        response_time_ms: responseTimeMs 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
