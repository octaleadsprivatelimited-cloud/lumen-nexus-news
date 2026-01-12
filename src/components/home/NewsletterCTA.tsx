import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterCTA() {
  return (
    <section className="container py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 md:p-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
            Never Miss a Story
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Join 50,000+ readers who get our daily digest of the most important news and insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              placeholder="Your email address"
              type="email"
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-primary-foreground/50 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
