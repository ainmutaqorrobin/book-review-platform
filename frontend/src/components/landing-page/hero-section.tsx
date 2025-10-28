import Link from "next/link";
import { Button } from "../ui/button";

function HeroSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-extrabold">
        Welcome to BookReview Platform
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Browse books, submit reviews, and let Mastra AI help you summarize,
        analyze sentiment, and suggest tags for your reviews.
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <Link href="/books">
          <Button size="lg">Explore Books</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;
