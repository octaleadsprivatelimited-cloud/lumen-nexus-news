import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { CategorySection } from "@/components/home/CategorySection";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { Helmet } from "react-helmet-async";
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
      {/* SEO Meta Tags */}
      <Helmet>
        <title>9knowledge - Your Trusted Knowledge Portal</title>
        <meta name="description" content="Discover insightful articles on technology, health, business, and more. Stay informed with the latest news and expert analysis." />
        <meta property="og:title" content="9knowledge - Your Trusted Knowledge Portal" />
        <meta property="og:description" content="Discover insightful articles on technology, health, business, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://9knowledge.com" />
        <link rel="canonical" href="https://9knowledge.com" />
      </Helmet>
      <WebsiteSchema />
      <OrganizationSchema />
      
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
