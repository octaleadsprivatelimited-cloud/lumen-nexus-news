import { Link } from "react-router-dom";
import { Mail, Twitter, Facebook, Linkedin, Instagram, ChevronDown } from "lucide-react";
import { categories } from "@/lib/data";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center mb-4">
              <span className="text-2xl font-display font-bold text-accent">9</span>
              <span className="text-2xl font-display font-bold">knowledge</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Your trusted source for insightful articles on technology, health, business, and more.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories - Collapsible on mobile */}
          <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full md:cursor-default">
              <h4 className="font-semibold">Categories</h4>
              <ChevronDown className={`h-4 w-4 md:hidden transition-transform ${openSections.categories ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="md:!block">
              <ul className="space-y-2 mt-4">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>

          {/* More Categories - Collapsible on mobile */}
          <Collapsible open={openSections.more} onOpenChange={() => toggleSection('more')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full md:cursor-default">
              <h4 className="font-semibold">More</h4>
              <ChevronDown className={`h-4 w-4 md:hidden transition-transform ${openSections.more ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="md:!block">
              <ul className="space-y-2 mt-4">
                {categories.slice(5).map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>

          {/* Company - Collapsible on mobile */}
          <Collapsible open={openSections.company} onOpenChange={() => toggleSection('company')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full md:cursor-default">
              <h4 className="font-semibold">Company</h4>
              <ChevronDown className={`h-4 w-4 md:hidden transition-transform ${openSections.company ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="md:!block">
              <ul className="space-y-2 mt-4">
                <li>
                  <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="mailto:info@9knowledge.com" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    info@9knowledge.com
                  </a>
                </li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} 9knowledge. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/50">
            Developed By octaleads Pvt Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
