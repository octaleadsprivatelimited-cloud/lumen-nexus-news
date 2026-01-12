import { ArticleCard } from "@/components/articles/ArticleCard";
import type { Article } from "@/lib/data";

interface HeroSectionProps {
  featuredArticles: Article[];
}

export function HeroSection({ featuredArticles }: HeroSectionProps) {
  const mainArticle = featuredArticles[0];
  const sideArticles = featuredArticles.slice(1, 3);

  if (!mainArticle) return null;

  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Featured Article */}
        <div className="lg:col-span-2">
          <ArticleCard article={mainArticle} variant="featured" className="h-full" />
        </div>

        {/* Side Articles */}
        <div className="flex flex-col gap-4">
          {sideArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="featured"
              className="flex-1"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
