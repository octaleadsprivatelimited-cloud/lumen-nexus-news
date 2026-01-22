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

const SITE_URL = 'https://9knowledge.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch published articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .eq('no_index', false)
      .order('published_at', { ascending: false })

    if (articlesError) throw articlesError

    // Fetch active categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (categoriesError) throw categoriesError

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    ]

    const now = new Date().toISOString()

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now.split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add category pages
    for (const category of categories || []) {
      const lastmod = category.updated_at 
        ? new Date(category.updated_at).toISOString().split('T')[0]
        : now.split('T')[0]
      
      xml += `  <url>
    <loc>${SITE_URL}/category/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    }

    // Add article pages
    for (const article of articles || []) {
      const lastmod = article.updated_at 
        ? new Date(article.updated_at).toISOString().split('T')[0]
        : article.published_at
        ? new Date(article.published_at).toISOString().split('T')[0]
        : now.split('T')[0]
      
      xml += `  <url>
    <loc>${SITE_URL}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`
    }

    xml += `</urlset>`

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Failed to generate sitemap: ${errorMessage}</error>`,
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/xml', ...corsHeaders } 
      }
    )
  }
})
