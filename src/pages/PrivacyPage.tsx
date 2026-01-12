import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const PrivacyPage = () => {
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
          <li className="text-foreground font-medium">Privacy Policy</li>
        </ol>
      </nav>

      {/* Content */}
      <article className="container py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-foreground mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 12, 2025
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you subscribe 
            to our newsletter, create an account, or contact us. This may include your 
            name, email address, and any other information you choose to provide.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve our 
            services, send you newsletters and updates, respond to your comments and 
            questions, and analyze usage patterns.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            3. Cookies
          </h2>
          <p>
            We use cookies and similar technologies to collect information about your 
            browsing activities and to personalize your experience. You can control 
            cookies through your browser settings.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            4. Data Security
          </h2>
          <p>
            We take reasonable measures to protect your personal information from 
            unauthorized access, use, or disclosure. However, no internet transmission 
            is completely secure.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:info@9knowledge.com" className="text-accent hover:underline">
              info@9knowledge.com
            </a>
          </p>
        </div>
      </article>
    </Layout>
  );
};

export default PrivacyPage;
