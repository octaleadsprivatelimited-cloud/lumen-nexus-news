import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
  className?: string;
}

const categoryColors: Record<string, string> = {
  health: "bg-category-health/10 text-category-health border-category-health/20",
  technology: "bg-category-technology/10 text-category-technology border-category-technology/20",
  business: "bg-category-business/10 text-category-business border-category-business/20",
  education: "bg-category-education/10 text-category-education border-category-education/20",
  finance: "bg-category-finance/10 text-category-finance border-category-finance/20",
  lifestyle: "bg-category-lifestyle/10 text-category-lifestyle border-category-lifestyle/20",
  science: "bg-category-science/10 text-category-science border-category-science/20",
  travel: "bg-category-travel/10 text-category-travel border-category-travel/20",
  trending: "bg-category-trending/10 text-category-trending border-category-trending/20",
};

export function CategoryBadge({ category, size = "sm", className }: CategoryBadgeProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className={cn(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-wide transition-colors hover:opacity-80",
        categoryColors[category.color] || "bg-muted text-muted-foreground border-border",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {category.name}
    </Link>
  );
}
