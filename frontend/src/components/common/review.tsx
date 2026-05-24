"use client";

import { FC } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Review as Model } from "@/utils/api/books";
import { formatDate } from "@/lib/format";

interface ReviewProps {
  review: Model;
}

const Review: FC<ReviewProps> = ({ review }) => {
  const {
    reviewer_name,
    text,
    rating,
    created_at,
    summary,
    tags,
    ai_enrichment_status,
  } = review;
  const enrichmentStatus = ai_enrichment_status ?? "completed";
  const isAiPending =
    enrichmentStatus === "pending" || enrichmentStatus === "processing";
  const ratingToneClassName =
    rating <= 2
      ? "border-red-200/80 bg-red-50/85 text-red-700"
      : rating === 3
        ? "border-amber-200/80 bg-amber-50/90 text-amber-800"
        : "border-emerald-200/80 bg-emerald-50/90 text-emerald-700";

  return (
    <article className="rounded-[1.75rem] border border-stone-900/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(250,244,236,0.94))] p-5 shadow-[0_16px_32px_rgba(64,38,24,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-[family-name:Georgia,serif] text-[1.9rem] leading-none text-stone-900">
            {reviewer_name}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-stone-500">
            {formatDate(created_at)}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <div className="ml-auto rounded-full border border-stone-900/8 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            Review Note
          </div>
          <div
            className={`ml-auto inline-flex w-full max-w-[220px] items-center gap-3 rounded-[1.15rem] border px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:w-auto ${ratingToneClassName}`}
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  aria-hidden="true"
                  className="size-3.5"
                  fill={index < rating ? "currentColor" : "none"}
                />
              ))}
            </div>
            <div className="h-8 w-px bg-current/15" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.22em] text-current/80">
                Reader Score
              </span>
              <span className="text-sm font-semibold tracking-[0.14em] text-current">
                {rating}.0/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {isAiPending && (
        <div className="mt-5 rounded-[1.4rem] border border-amber-200/90 bg-amber-50/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge
              className="rounded-full border-amber-300 bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-800"
              variant="outline"
            >
              {enrichmentStatus === "processing"
                ? "AI Processing"
                : "AI Pending"}
            </Badge>
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-700">
              AI summary pending
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-amber-900">
            We&apos;re generating the summary and tags for this review.
          </p>
        </div>
      )}

      {enrichmentStatus === "failed" && (
        <div className="mt-5 rounded-[1.4rem] border border-red-200/90 bg-red-50/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge
              className="rounded-full border-red-300 bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-red-700"
              variant="outline"
            >
              AI Unavailable
            </Badge>
            <p className="text-[11px] uppercase tracking-[0.22em] text-red-700">
              Review saved
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-red-800">
            Your review was saved, but the AI summary could not be generated.
          </p>
        </div>
      )}

      {enrichmentStatus === "completed" && summary && (
        <div className="mt-5 rounded-[1.4rem] border border-stone-900/8 bg-[#f6eee1]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="space-y-3">
            <div className="flex justify-end">
              <p className="rounded-full border border-stone-900/8 bg-white/75 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-stone-500">
                AI Summary
              </p>
            </div>
            <p className="text-sm italic leading-7 text-stone-700">
              &ldquo;{summary}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 border-l-2 border-stone-200 pl-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
          Full Review
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-700">{text}</p>
      </div>

      {enrichmentStatus === "completed" && tags && tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              className="rounded-full border-stone-300/90 bg-white/82 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              variant="outline"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
};

export default Review;
