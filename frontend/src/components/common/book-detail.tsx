"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Review from "./review";
import {
  getBookById,
  BookDetail as Model,
  Review as ReviewModel,
} from "@/utils/api/books";
import { FALLBACK_IMAGE } from "@/utils/const/image";

interface BookDetailProps {
  bookId: number;
}

export default function BookDetail({ bookId }: BookDetailProps) {
  const [book, setBook] = useState<Model | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getBookById(bookId);
        if (res.success && res.data) {
          setBook(res.data);
        } else {
          setError(res.message || "Book not found.");
        }
      } catch (err) {
        setError("An error occurred while fetching the book.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading book details…</div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-6 text-center text-red-500">
        {error || "Book not found."}
      </div>
    );
  }

  const {
    id,
    title,
    author,
    description,
    cover_image_url,
    created_at,
    reviews,
  } = book;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 mb-6 flex flex-col">
        <div className="relative w-full h-64 overflow-hidden rounded-md">
          <Image
            src={cover_image_url || FALLBACK_IMAGE}
            alt={title}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">by {author}</p>
        </CardHeader>

        <CardContent className="grow">
          <p className="text-sm text-gray-700 mb-4">{description}</p>
          <p className="text-xs text-gray-500">
            Added on {new Date(created_at || "").toLocaleDateString()}
          </p>
        </CardContent>

        <CardFooter className="flex justify-end px-6 py-4">
          <Link href="/books" passHref>
            <Button variant="outline" className="w-auto">
              Back to list
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <section>
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((r: ReviewModel) => <Review key={r.id} review={r} />)
        )}
      </section>
    </>
  );
}
