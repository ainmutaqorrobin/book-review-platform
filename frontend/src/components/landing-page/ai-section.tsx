import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Review Summaries",
    description:
      "Condense long thoughts into short reading notes you can scan later.",
  },
  {
    title: "Sentiment Clarity",
    description:
      "See the emotional signal behind a review without rewriting it from scratch.",
  },
  {
    title: "Smarter Tags",
    description:
      "Generate useful labels that make the collection easier to navigate.",
  },
  {
    title: "Saved Context",
    description:
      "Keep AI output alongside each review so it remains part of your archive.",
  },
];

export default function AISection() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
      <div className="rounded-[2rem] border border-stone-900/10 bg-[#201814] p-8 text-stone-100 shadow-[0_24px_70px_rgba(42,26,18,0.24)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-stone-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Support
        </div>
        <h2 className="mt-6 font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-50">
          Quiet intelligence for better review writing.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-stone-300">
          Mastra AI adds structure without taking over the page. Use it to make
          your notes more discoverable and easier to revisit later.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-[#b98a63]/30 bg-[#b98a63]/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#e6c9a9]">
            Built for reflection
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-100">
            AI should sharpen your notes, not replace your judgment. This flow
            is designed to preserve the reader’s voice.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-full bg-stone-50 px-6 text-stone-900 hover:bg-stone-200"
        >
          <Link href="/books">Start Exploring Books</Link>
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className={`rounded-[2rem] border border-stone-900/10 p-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)] ${
              index === 0 || index === 3 ? "bg-white/70" : "bg-[#efe0cf]"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
              Capability {index + 1}
            </p>
            <h3 className="mt-4 font-[family-name:Georgia,serif] text-2xl leading-tight text-stone-900">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
