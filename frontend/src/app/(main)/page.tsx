import AISection from "@/components/landing-page/ai-section";
import FeaturesSection from "@/components/landing-page/features-section";
import HeroSection from "@/components/landing-page/hero-section";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 pb-8 pt-4 sm:gap-24">
      <HeroSection />
      <FeaturesSection />
      <AISection />
    </div>
  );
}
