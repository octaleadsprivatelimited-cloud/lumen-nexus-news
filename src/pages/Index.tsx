import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { CategorySection } from "@/components/home/CategorySection";
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { Helmet } from "react-helmet-async";
import { 
  useFeaturedArticles, 
  useTrendingArticles, 
  useLatestArticles,
  useArticlesByCategory 
} from "@/hooks/usePublicArticles";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: featuredArticles, isLoading: featuredLoading } = useFeaturedArticles();
  const { data: trendingArticles, isLoading: trendingLoading } = useTrendingArticles();
  const { data: latestArticles, isLoading: latestLoading } = useLatestArticles(9);
  const { data: categories } = useCategories();
  
  const { data: techArticles } = useArticlesByCategory('technology', 6);
  const { data: healthArticles } = useArticlesByCategory('health', 6);

  const techCategory = categories?.find((c) => c.slug === 'technology');
  const healthCategory = categories?.find((c) => c.slug === 'health');

  const isLoading = featuredLoading || trendingLoading || latestLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

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
      {featuredArticles && featuredArticles.length > 0 && (
        <HeroSection featuredArticles={featuredArticles} />
      )}

      {/* Trending Articles */}
      {trendingArticles && trendingArticles.length > 0 && (
        <TrendingSection articles={trendingArticles} />
      )}

      {/* Latest Articles */}
      {latestArticles && latestArticles.length > 0 && (
        <LatestArticles articles={latestArticles} />
      )}


      {/* Category Sections */}
      {techCategory && techArticles && techArticles.length > 0 && (
        <CategorySection
          category={techCategory}
          articles={techArticles}
        />
      )}
      {healthCategory && healthArticles && healthArticles.length > 0 && (
        <CategorySection
          category={healthCategory}
          articles={healthArticles}
        />
      )}

      {/* Show message when no articles */}
      {(!latestArticles || latestArticles.length === 0) && !isLoading && (
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Articles Yet</h2>
          <p className="text-muted-foreground">Check back soon for new content!</p>
        </div>
      )}
    </Layout>
  );
};

export default Index;