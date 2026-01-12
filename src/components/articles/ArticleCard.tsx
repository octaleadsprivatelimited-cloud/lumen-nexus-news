import { Link } from "react-router-dom";
import { Clock, Eye, TrendingUp } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/data";
import { formatRelativeDate } from "@/lib/data";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "horizontal" | "compact";
  className?: string;
}

export function ArticleCard({ article, variant = "default", className }: ArticleCardProps) {
  if (variant === "featured") {
    return (
      <article className={cn("group relative overflow-hidden rounded-xl", className)}>
        <Link to={`/article/${article.slug}`} className="block">
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <CategoryBadge category={article.category} className="mb-3" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2 line-clamp-2">
              {article.title}
            </h2>
            <p className="text-primary-foreground/80 text-sm mb-3 line-clamp-2 hidden md:block">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-primary-foreground/70">
              <span>{formatRelativeDate(article.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min read
              </span>
              {article.isTrending && (
                <span className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className={cn("group article-card flex gap-4", className)}>
        <Link to={`/article/${article.slug}`} className="shrink-0">
          <div className="w-32 h-24 md:w-48 md:h-32 overflow-hidden rounded-lg">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          <CategoryBadge category={article.category} className="mb-2 self-start" />
          <Link to={`/article/${article.slug}`}>
            <h3 className="font-display font-bold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatRelativeDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group flex items-start gap-3", className)}>
        <span className="shrink-0 text-3xl font-display font-bold text-muted-foreground/30 group-hover:text-accent transition-colors">
          {String(article.views).padStart(2, "0").slice(0, 2)}
        </span>
        <div className="min-w-0">
          <Link to={`/article/${article.slug}`}>
            <h4 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </h4>
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{article.category.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className={cn("group article-card bg-card rounded-xl overflow-hidden border border-border", className)}>
      <Link to={`/article/${article.slug}`} className="block">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={article.category} />
          {article.isTrending && (
            <span className="flex items-center gap-1 text-xs text-accent font-medium">
              <TrendingUp className="h-3 w-3" />
              Trending
            </span>
          )}
        </div>
        <Link to={`/article/${article.slug}`}>
          <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="font-medium">{article.author.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{formatRelativeDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
