import { Card } from "../ui/card";

function FeaturesSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Browse Books</h2>
        <p>
          Discover books across all genres, view details, and explore reviews.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Submit Reviews</h2>
        <p>
          Write your own reviews with rating, and let Mastra AI summarize,
          analyze sentiment, and suggest tags automatically.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Search & Discover</h2>
        <p>
          Easily search books and reviews with our intuitive search bar, filter
          by tags, and find recommendations.
        </p>
      </Card>
    </div>
  );
}

export default FeaturesSection;
