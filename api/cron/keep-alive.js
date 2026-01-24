/**
 * Vercel Serverless Function for Keep-Alive Cron Job
 * This function is called by Vercel Cron every 10 minutes
 * It calls the Supabase keep-alive edge function to prevent database from sleeping
 */

export default async function handler(req, res) {
  // Only allow GET requests (Vercel Cron sends GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase URL from environment variable
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pdcwabsevcfbdltqlcpb.supabase.co';
    const keepAliveUrl = `${supabaseUrl}/functions/v1/keep-alive`;
    
    // Get anon key for authentication
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OxpGS3BVemmfeRVroxQcfg_855CrXbS';
    
    // Call the Supabase keep-alive edge function
    const response = await fetch(keepAliveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Keep-alive failed:', data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.error || 'Keep-alive request failed' 
      });
    }

    console.log('Keep-alive successful:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Keep-alive ping sent successfully',
      data 
    });
  } catch (error) {
    console.error('Error calling keep-alive:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}

