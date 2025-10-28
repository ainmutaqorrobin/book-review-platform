import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

export default function AISection() {
  const features = [
    {
      title: "Summarize Reviews",
      description: "Quickly summarize your review text for easier reading.",
      color: "blue",
    },
    {
      title: "Analyze Sentiment",
      description: "Receive sentiment score or label for your review.",
      color: "green",
    },
    {
      title: "Suggest Tags",
      description: "Get relevant tags to make your review discoverable.",
      color: "purple",
    },
    {
      title: "Store AI Data",
      description: "AI-generated insights are saved in the database.",
      color: "orange",
    },
  ];

  return (
    <section className="mt-16 max-w-5xl mx-auto px-4 space-y-8 text-center">
      <h2 className="text-3xl font-bold">Powered by Mastra AI</h2>
      <p className="text-muted-foreground">
        When you submit a review, Mastra AI will enhance it in several ways:
      </p>
      <Separator className="my-4" />

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className={`bg-${feature.color}-100 text-${feature.color}-800`}
                >
                  {feature.title}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/books">
          <Button size="lg">Start Exploring Books</Button>
        </Link>
      </div>
    </section>
  );
}
