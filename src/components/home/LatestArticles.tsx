import { Clock } from "lucide-react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface LatestArticlesProps {
  articles: PublicArticle[];
}

export function LatestArticles({ articles }: LatestArticlesProps) {
  return (
    <section className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">
          Latest Articles
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {articles.map((article, index) => (
          <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </section>
  );
}