import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { Article, Category } from "@/lib/data";

interface CategorySectionProps {
  category: Category;
  articles: Article[];
}

export function CategorySection({ category, articles }: CategorySectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="container py-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">
          {category.name}
        </h2>
        <Link
          to={`/category/${category.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {articles.slice(0, 4).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
