import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SocialShare } from "@/components/articles/SocialShare";
import { Button } from "@/components/ui/button";
import AdSlot from "@/components/ads/AdSlot";
import {
  Clock,
  Calendar,
  Eye,
  Share2,
  ChevronRight,
} from "lucide-react";
import {
  getArticleBySlug,
  getRelatedArticles,
  formatDate,
} from "@/lib/data";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");

  if (!article) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const relatedArticles = getRelatedArticles(article);

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  return (
    <Layout>
      <article>
        {/* Breadcrumb */}
        <nav className="container py-4 border-b border-border">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li>
              <Link
                to={`/category/${article.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {article.category.name}
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="text-foreground font-medium truncate max-w-[200px]">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="container py-8 max-w-4xl mx-auto">
          <CategoryBadge category={article.category} size="md" className="mb-4" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {article.excerpt}
          </p>

          {/* Author & Meta Info */}
          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">{article.author.name}</p>
                <p className="text-sm text-muted-foreground">{article.author.bio.slice(0, 50)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="container max-w-5xl mx-auto mb-8">
          <figure>
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full aspect-[2/1] object-cover rounded-xl"
            />
          </figure>
        </div>

        {/* Article Content */}
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Share Buttons - Sticky on Desktop */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <span className="hidden lg:flex items-center justify-center text-xs text-muted-foreground mb-2">
                  <Share2 className="h-4 w-4" />
                </span>
                <SocialShare url={shareUrl} title={shareTitle} vertical />
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-11">
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-lg leading-relaxed">
                  {article.content}
                </p>
                <p className="text-lg leading-relaxed mt-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                
                {/* In-Article Ad */}
                <AdSlot position="in-article" className="not-prose" />
                
                <h2 className="text-2xl font-display font-bold mt-8 mb-4">Key Takeaways</h2>
                <ul className="space-y-2">
                  <li>Important insight number one about this topic</li>
                  <li>Another critical point to consider</li>
                  <li>Expert opinions and analysis</li>
                  <li>Future implications and predictions</li>
                </ul>
                <p className="text-lg leading-relaxed mt-6">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tag/${tag.toLowerCase()}`}
                      className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Author Bio */}
              <div className="mt-8 p-6 bg-muted rounded-xl">
                <div className="flex items-start gap-4">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      Written by {article.author.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="container py-12 mt-8 border-t border-border">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
};

export default ArticlePage;
