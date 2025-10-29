"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Book as Model } from "@/utils/api/books";
import Image from "next/image";

interface IProps {
  book: Model;
}
export default function Book({ book }: IProps) {
  const { author, id, title, cover_image_url, created_at, description } = book;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="relative w-full h-64">
        <Image
          src={cover_image_url}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {author}</p>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
        <p className="text-xs text-gray-500 mt-3">
          Added on {new Date(created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
