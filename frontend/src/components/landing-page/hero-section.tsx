import Link from "next/link";
import { ArrowRight, BookOpenText, Quote } from "lucide-react";
import { Button } from "../ui/button";

export default function HeroSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-8 text-left">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.34em] text-stone-500">
            Contemporary Reading Journal
          </p>
          <h1 className="max-w-3xl font-[family-name:Georgia,serif] text-5xl leading-[1.02] text-stone-900 sm:text-6xl lg:text-7xl">
            Build a shelf that remembers why a book mattered.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            Explore thoughtful reviews, add the titles you care about, and use
            AI support when you want sharper summaries, sentiment clues, and
            cleaner tags.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-stone-900 px-6 text-stone-50 shadow-[0_18px_40px_rgba(42,26,18,0.18)] hover:bg-stone-800"
          >
            <Link href="/books">
              Explore Books
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-stone-300 bg-white/70 px-6 text-stone-700 hover:border-stone-500 hover:bg-white"
          >
            <Link href="/signup">Start Your Shelf</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-stone-900/10 bg-white/60 p-4 shadow-[0_14px_30px_rgba(64,38,24,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
              Reviews
            </p>
            <p className="mt-2 font-[family-name:Georgia,serif] text-3xl text-stone-900">
              Human-first
            </p>
          </div>
          <div className="rounded-3xl border border-stone-900/10 bg-white/60 p-4 shadow-[0_14px_30px_rgba(64,38,24,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
              Discovery
            </p>
            <p className="mt-2 font-[family-name:Georgia,serif] text-3xl text-stone-900">
              Curated
            </p>
          </div>
          <div className="rounded-3xl border border-stone-900/10 bg-white/60 p-4 shadow-[0_14px_30px_rgba(64,38,24,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
              AI Assist
            </p>
            <p className="mt-2 font-[family-name:Georgia,serif] text-3xl text-stone-900">
              Quietly smart
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-4 top-12 hidden h-28 w-28 rounded-full bg-[#c79668]/20 blur-3xl sm:block" />
        <div className="absolute -right-4 bottom-8 hidden h-40 w-40 rounded-full bg-[#7c5233]/16 blur-3xl sm:block" />

        <div className="relative overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[#201814] p-6 text-stone-100 shadow-[0_24px_70px_rgba(42,26,18,0.28)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">
                Featured Reading
              </p>
              <h2 className="mt-2 font-[family-name:Georgia,serif] text-3xl leading-tight text-stone-50">
                Notes that feel like margins in a favorite copy.
              </h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <BookOpenText className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <div className="flex items-start gap-3">
                <Quote className="mt-1 h-4 w-4 text-[#d8b08b]" aria-hidden="true" />
                <div>
                  <p className="text-sm leading-7 text-stone-200">
                    “Track the titles you want to remember, then turn quick
                    impressions into reviews worth revisiting.”
                  </p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-stone-400">
                    Reading workflow
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
                  Summaries
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-200">
                  Distill a review without flattening your tone.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
                  Discovery
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-200">
                  Search titles and authors without losing atmosphere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
