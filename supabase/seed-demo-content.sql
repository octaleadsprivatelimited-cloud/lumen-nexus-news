-- Demo Content for 9knowledge News Portal
-- Run this SQL in your Supabase SQL Editor to insert demo articles and categories

-- First, ensure categories exist (matching the ones in src/lib/data.ts)
-- Using ON CONFLICT on slug since categories are created with UUIDs

INSERT INTO public.categories (name, slug, description, color, is_active, sort_order)
VALUES
  ('Health', 'health', 'Health and wellness articles', 'health', true, 1),
  ('Food', 'food', 'Food and nutrition articles', 'food', true, 2),
  ('Technology', 'technology', 'Latest tech news and tutorials', 'technology', true, 3),
  ('Facts', 'facts', 'Interesting facts and trivia', 'facts', true, 4),
  ('Finance', 'finance', 'Financial tips and investment advice', 'finance', true, 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Insert demo articles
-- Note: You'll need to replace 'author-id-here' with an actual author_id from your users table
-- Or create a test author first

-- Create a test author if needed (optional - you can use your own user ID)
-- INSERT INTO public.profiles (id, email, full_name)
-- VALUES ('demo-author-1', 'demo@example.com', 'Sarah Mitchell')
-- ON CONFLICT (id) DO NOTHING;

-- Insert demo articles
-- Using subqueries to get category IDs by slug (since categories use UUIDs)

INSERT INTO public.articles (
  id,
  title,
  slug,
  excerpt,
  content,
  featured_image,
  featured_image_alt,
  category_id,
  status,
  is_featured,
  is_trending,
  published_at,
  reading_time,
  view_count
) VALUES
  (
    gen_random_uuid(),
    'The Future of Artificial Intelligence: What to Expect in 2025',
    'future-of-artificial-intelligence-2025',
    'From advanced language models to autonomous systems, AI is reshaping every industry. Here''s what experts predict for the coming year.',
    '<p>Artificial intelligence continues to evolve at an unprecedented pace, transforming industries and redefining what''s possible in technology. From advanced language models to autonomous systems, AI is reshaping every industry.</p><p>In 2025, we can expect to see even more sophisticated AI applications that will revolutionize how we work, learn, and interact with technology. Major tech companies are investing billions in AI research, and startups are emerging with innovative solutions.</p><p>The integration of AI into everyday applications will become seamless, making complex tasks simpler and more efficient. As we move forward, the focus will be on ethical AI development and ensuring these powerful tools benefit all of humanity.</p>',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    'Artificial Intelligence and Technology',
    (SELECT id FROM public.categories WHERE slug = 'technology' LIMIT 1),
    'published',
    true,
    true,
    NOW() - INTERVAL ''2 days'',
    8,
    15420
  ),
  (
    gen_random_uuid(),
    '5 Proven Habits That Can Extend Your Lifespan by a Decade',
    'habits-extend-lifespan-decade',
    'New research reveals simple daily practices that can significantly improve longevity and quality of life.',
    '<p>Scientists have long studied the habits of centenarians around the world, and recent research has identified key practices that can significantly extend your lifespan.</p><p>These five habits are surprisingly simple but incredibly effective: regular exercise, a balanced diet rich in whole foods, adequate sleep, stress management, and strong social connections.</p><p>Studies show that people who follow these practices can add up to 10 years to their life expectancy while also improving their quality of life. The key is consistency and making these habits part of your daily routine.</p>',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
    'Health and Wellness',
    (SELECT id FROM public.categories WHERE slug = 'health' LIMIT 1),
    'published',
    true,
    false,
    NOW() - INTERVAL ''3 days'',
    6,
    8930
  ),
  (
    gen_random_uuid(),
    'Global Markets Rally as Tech Sector Leads Recovery',
    'global-markets-rally-tech-recovery',
    'Major indices surge following positive earnings reports from leading technology companies.',
    '<p>Wall Street experienced its strongest week in months as technology stocks led a broad market rally. Major indices surged following positive earnings reports from leading technology companies.</p><p>Investors are showing renewed confidence in the tech sector, with particular interest in artificial intelligence, cloud computing, and cybersecurity companies. Analysts predict this trend will continue as companies invest heavily in digital transformation.</p><p>The recovery signals a strong economic outlook for the coming quarters, with technology playing a central role in driving growth across multiple industries.</p>',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop',
    'Financial Markets',
    (SELECT id FROM public.categories WHERE slug = 'finance' LIMIT 1),
    'published',
    false,
    true,
    NOW() - INTERVAL ''4 days'',
    5,
    12340
  ),
  (
    gen_random_uuid(),
    'Revolutionary Solar Technology Could Power Entire Cities',
    'revolutionary-solar-technology-cities',
    'Breakthrough in photovoltaic cells promises 40% efficiency, potentially transforming renewable energy.',
    '<p>A team of researchers at MIT has developed a new type of solar cell that achieves unprecedented efficiency. This breakthrough in photovoltaic cells promises 40% efficiency, potentially transforming renewable energy.</p><p>The new technology uses advanced materials and innovative design to capture more sunlight and convert it to electricity more efficiently than ever before. This could make solar power the primary energy source for entire cities.</p><p>If successfully commercialized, this technology could significantly reduce our dependence on fossil fuels and accelerate the transition to clean energy worldwide.</p>',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop',
    'Solar Technology',
    (SELECT id FROM public.categories WHERE slug = 'technology' LIMIT 1),
    'published',
    true,
    true,
    NOW() - INTERVAL ''5 days'',
    7,
    9870
  ),
  (
    gen_random_uuid(),
    'Amazing Food Facts You Never Knew',
    'amazing-food-facts-you-never-knew',
    'Discover fascinating facts about the food we eat every day that will surprise and amaze you.',
    '<p>Food is not just sustenance—it''s a fascinating world of science, history, and culture. Here are some amazing facts about the food we eat every day.</p><p>Did you know that honey never spoils? Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible. Or that bananas are berries, but strawberries aren''t?</p><p>These surprising facts reveal the incredible complexity and wonder of the foods we often take for granted. Understanding these facts can make your relationship with food more interesting and informed.</p>',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=600&fit=crop',
    'Food Facts',
    (SELECT id FROM public.categories WHERE slug = 'food' LIMIT 1),
    'published',
    false,
    false,
    NOW() - INTERVAL ''6 days'',
    4,
    5620
  ),
  (
    gen_random_uuid(),
    '10 Mind-Blowing Facts About the Universe',
    '10-mind-blowing-facts-about-universe',
    'Explore incredible facts about our universe that will expand your understanding of space and time.',
    '<p>The universe is vast, mysterious, and full of incredible facts that challenge our understanding of reality. Here are 10 mind-blowing facts about the cosmos.</p><p>From black holes that can warp space-time to galaxies billions of light-years away, the universe never ceases to amaze. Scientists continue to discover new phenomena that push the boundaries of what we thought was possible.</p><p>These facts remind us of how small we are in the grand scheme of things, yet how remarkable it is that we can observe and understand such vast cosmic phenomena.</p>',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
    'Universe Facts',
    (SELECT id FROM public.categories WHERE slug = 'facts' LIMIT 1),
    'published',
    false,
    true,
    NOW() - INTERVAL ''7 days'',
    6,
    7890
  ),
  (
    gen_random_uuid(),
    'Smart Investment Strategies for 2025',
    'smart-investment-strategies-2025',
    'Expert advice on building a diversified portfolio and making smart financial decisions in the coming year.',
    '<p>As we enter 2025, investors are looking for smart strategies to grow their wealth while managing risk. Here are expert tips for building a diversified portfolio.</p><p>Diversification remains key, but the approach is evolving. Consider a mix of traditional stocks, bonds, and alternative investments like real estate or commodities.</p><p>Stay informed about market trends, but avoid making emotional decisions. Long-term thinking and disciplined investing typically yield the best results over time.</p>',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop',
    'Investment Strategies',
    (SELECT id FROM public.categories WHERE slug = 'finance' LIMIT 1),
    'published',
    false,
    true,
    NOW() - INTERVAL ''8 days'',
    8,
    11200
  ),
  (
    gen_random_uuid(),
    'The Science Behind Healthy Eating',
    'science-behind-healthy-eating',
    'Understanding the nutritional science that can help you make better food choices for optimal health.',
    '<p>Nutrition science has come a long way in helping us understand what makes a truly healthy diet. Here''s what the latest research tells us about healthy eating.</p><p>It''s not just about calories—the quality of food matters tremendously. Whole foods, rich in nutrients and fiber, provide benefits that processed foods simply cannot match.</p><p>Understanding the science behind nutrition can empower you to make informed choices that support your long-term health and well-being.</p>',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=600&fit=crop',
    'Healthy Eating',
    (SELECT id FROM public.categories WHERE slug = 'food' LIMIT 1),
    'published',
    false,
    false,
    NOW() - INTERVAL ''9 days'',
    5,
    6540
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  featured_image_alt = EXCLUDED.featured_image_alt,
  category_id = EXCLUDED.category_id,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  is_trending = EXCLUDED.is_trending,
  published_at = EXCLUDED.published_at,
  reading_time = EXCLUDED.reading_time,
  view_count = EXCLUDED.view_count;

-- Verify the data was inserted
SELECT 'Categories inserted: ' || COUNT(*) FROM public.categories;
SELECT 'Articles inserted: ' || COUNT(*) FROM public.articles WHERE status = 'published';

