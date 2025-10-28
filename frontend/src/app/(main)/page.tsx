import AISection from "@/components/landing-page/ai-section";
import HeroSection from "@/components/landing-page/hero-section";
import FeaturesSection from "@/components/landing-page/features-section";

export default function HomePage() {
  return (
    <section className="text-center py-20 space-y-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* AI Section */}
      <AISection />
    </section>
  );
}
