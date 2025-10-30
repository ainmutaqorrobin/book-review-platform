"use client";

import { FC } from "react";
import { Review as Model } from "@/utils/api/books";
import clsx from "clsx";

interface ReviewProps {
  review: Model;
}

const Review: FC<ReviewProps> = ({ review }) => {
  const { reviewer_name, text, rating, created_at, summary, tags } = review;

  const ratingColor = clsx(
    "inline-block text-xs px-2 py-1 rounded text-white font-medium",
    {
      "bg-red-500": rating <= 2,
      "bg-yellow-500": rating === 3,
      "bg-green-500": rating >= 4,
    }
  );

  return (
    <div className="p-4 border rounded-lg mb-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{reviewer_name}</h3>
        <span className="text-xs text-gray-500">
          {new Date(created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="mb-2">
        <span className={ratingColor}>Rating: {rating}/5</span>
      </div>
      {summary && <p className="italic text-gray-600 mb-2">“{summary}”</p>}
      <p className="text-gray-700 mb-2">{text}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Review;
