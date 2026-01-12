import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { CategorySection } from "@/components/home/CategorySection";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import {
  getFeaturedArticles,
  getTrendingArticles,
  getLatestArticles,
  getArticlesByCategory,
  categories,
} from "@/lib/data";

const Index = () => {
  const featuredArticles = getFeaturedArticles();
  const trendingArticles = getTrendingArticles();
  const latestArticles = getLatestArticles();

  // Get articles for a few categories to display
  const techArticles = getArticlesByCategory("technology");
  const healthArticles = getArticlesByCategory("health");

  return (
    <Layout>
      {/* SEO Meta Tags would go here in production */}
      
      {/* Hero Section with Featured Articles */}
      <HeroSection featuredArticles={featuredArticles} />

      {/* Trending Articles */}
      <TrendingSection articles={trendingArticles} />

      {/* Latest Articles */}
      <LatestArticles articles={latestArticles} />

      {/* Newsletter CTA */}
      <NewsletterCTA />

      {/* Category Sections */}
      <CategorySection
        category={categories.find((c) => c.slug === "technology")!}
        articles={techArticles}
      />
      <CategorySection
        category={categories.find((c) => c.slug === "health")!}
        articles={healthArticles}
      />
    </Layout>
  );
};

export default Index;
