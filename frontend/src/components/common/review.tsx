"use client";

import clsx from "clsx";
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Review as Model } from "@/utils/api/books";
import { formatDate } from "@/lib/format";

interface ReviewProps {
  review: Model;
}

const Review: FC<ReviewProps> = ({ review }) => {
  const { reviewer_name, text, rating, created_at, summary, tags } = review;

  const ratingClassName = clsx(
    "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]",
    {
      "border-red-300 bg-red-50 text-red-700": rating <= 2,
      "border-amber-300 bg-amber-50 text-amber-800": rating === 3,
      "border-emerald-300 bg-emerald-50 text-emerald-700": rating >= 4,
    }
  );

  return (
    <article className="rounded-[1.5rem] border border-stone-900/10 bg-white/75 p-5 shadow-[0_14px_30px_rgba(64,38,24,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-[family-name:Georgia,serif] text-2xl text-stone-900">
            {reviewer_name}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-500">
            {formatDate(created_at)}
          </p>
        </div>
        <span className={ratingClassName}>Rating {rating}/5</span>
      </div>

      {summary && (
        <p className="mt-4 rounded-[1.25rem] border border-stone-900/8 bg-[#f6eee1] px-4 py-3 text-sm italic leading-7 text-stone-600">
          “{summary}”
        </p>
      )}

      <p className="mt-4 text-sm leading-7 text-stone-700">{text}</p>

      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              className="rounded-full border-stone-300 bg-white/75 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-600"
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
