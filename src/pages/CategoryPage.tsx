import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { categories, getArticlesByCategory, articles } from "@/lib/data";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const categoryArticles = getArticlesByCategory(slug || "");
  // If no articles in this category, show all articles for demo purposes
  const displayArticles = categoryArticles.length > 0 ? categoryArticles : articles;

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="container py-4 border-b border-border">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" />
          <li className="text-foreground font-medium">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <header className="container py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          {category.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the latest articles and insights about {category.name.toLowerCase()}.
        </p>
      </header>

      {/* Articles Grid */}
      <section className="container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map((article, index) => (
            <div
              key={article.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
