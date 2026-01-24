/**
 * Vercel Serverless Function for Keep-Alive Cron Job
 * This function is called by Vercel Cron every 10 minutes
 * It calls the Supabase keep-alive edge function to prevent database from sleeping
 */

export async function GET() {
  try {
    // Get Supabase URL from environment variable
    // Vercel serverless functions can access both VITE_ and regular env vars
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://pdcwabsevcfbdltqlcpb.supabase.co';
    const keepAliveUrl = `${supabaseUrl}/functions/v1/keep-alive`;
    
    // Get anon key for authentication
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_OxpGS3BVemmfeRVroxQcfg_855CrXbS';
    
    // Call the Supabase keep-alive edge function
    const response = await fetch(keepAliveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Keep-alive failed:', response.status, errorData);
      return Response.json({ 
        success: false, 
        error: errorData || 'Keep-alive request failed' 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Keep-alive successful:', data);
    
    return Response.json({ 
      success: true, 
      message: 'Keep-alive ping sent successfully',
      data 
    }, { status: 200 });
  } catch (error) {
    console.error('Error calling keep-alive:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

