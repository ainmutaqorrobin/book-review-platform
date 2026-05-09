import "../globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { buttonVariants } from "@/components/ui/button";

const editorialLinkClassName = buttonVariants({
  variant: "outline",
  size: "sm",
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,120,74,0.18),_transparent_32%),linear-gradient(180deg,_#f8f2e8_0%,_#efe4d3_100%)] text-stone-900">
        <AuthProvider>
          <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_center,_rgba(72,38,22,0.14),_transparent_62%)]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#cfa67e]/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-12 top-24 h-64 w-64 rounded-full bg-[#7c5233]/12 blur-3xl" />

            <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[#fffaf2]/90 shadow-[0_30px_90px_rgba(53,31,18,0.18)] backdrop-blur lg:min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
              <section className="relative hidden overflow-hidden bg-[#201814] px-10 py-10 text-stone-100 lg:flex lg:flex-col lg:justify-between">
                <div className="space-y-6">
                  <Link
                    href="/"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-stone-100 transition-colors hover:bg-white/14"
                  >
                    Back Home
                  </Link>

                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-stone-300">
                      BookReview Library
                    </p>
                    <h1 className="max-w-md font-[family-name:Georgia,serif] text-5xl leading-[1.05] text-stone-50">
                      Build a reading trail worth returning to.
                    </h1>
                    <p className="max-w-lg text-sm leading-7 text-stone-300">
                      Keep your notes, ratings, and discoveries in one place.
                      Browse as a guest when you want to explore, then sign in
                      when you are ready to curate your own shelf.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid gap-3">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                        01
                      </p>
                      <h2 className="mt-3 text-lg font-semibold text-stone-50">
                        Discover with context
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-stone-300">
                        Follow titles, summaries, and review signals without
                        digging through clutter.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                        02
                      </p>
                      <h2 className="mt-3 text-lg font-semibold text-stone-50">
                        Write like a real reader
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-stone-300">
                        Add thoughtful reviews, track sentiment, and keep each
                        book tied to your voice.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#b98a63]/30 bg-[#b98a63]/10 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#e6c9a9]">
                      Guest Friendly
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-6 text-stone-100">
                      You do not need an account to look around. Sign in when
                      you want to save books, manage reviews, or own the
                      collection.
                    </p>
                  </div>
                </div>
              </section>

              <section className="relative flex flex-col justify-between bg-[#f8f1e4] px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-10">
                <div className="flex items-center justify-between gap-3 lg:hidden">
                  <Link href="/" className={editorialLinkClassName}>
                    Back Home
                  </Link>
                  <span className="text-xs font-medium uppercase tracking-[0.26em] text-stone-500">
                    BookReview
                  </span>
                </div>

                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 lg:py-12">
                  <div className="mb-8 space-y-2 text-center">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                      Reader Access
                    </p>
                    <Link
                      href="/"
                      className="inline-flex justify-center font-[family-name:Georgia,serif] text-4xl leading-none text-stone-900 transition-colors hover:text-[#7c5233]"
                    >
                      BookReview
                    </Link>
                    <p className="mx-auto max-w-sm text-sm leading-6 text-stone-600">
                      A calm place to discover books, keep your notes, and add
                      reviews only when they are worth writing.
                    </p>
                  </div>

                  {children}
                </div>

                <div className="pt-6 text-center text-xs uppercase tracking-[0.2em] text-stone-500">
                  BookReview Platform
                </div>
              </section>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
