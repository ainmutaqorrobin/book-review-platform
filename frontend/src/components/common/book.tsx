"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteBook, Book as Model } from "@/utils/api/books";
import Image from "next/image";
import Link from "next/link";
import { FALLBACK_IMAGE } from "@/utils/const/image";
import { toast } from "sonner";
import ConfirmationDialog from "./confirmation-dialog";

interface IProps {
  book: Model;
  onBookDeleteCallback: () => void;
}

export default function Book({ book, onBookDeleteCallback }: IProps) {
  const { author, id, title, cover_image_url, created_at, description } = book;

  const handleDelete = async () => {
    try {
      const res = await deleteBook(id);
      if (res.success) {
        toast.success("Book deleted successfully");
        onBookDeleteCallback();
      }
    } catch (error) {
      console.error(error);
      toast.error(error);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
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
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {author}</p>
      </CardHeader>

      <CardContent className="grow">
        <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
        <p className="text-xs text-gray-500 mt-3">
          Added on {new Date(created_at || "").toLocaleDateString()}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between px-6 py-4">
        <ConfirmationDialog
          title={`Delete "${title}"?`}
          description="This action cannot be undone."
          actionText="Confirm Delete"
          onConfirm={handleDelete}
        >
          <Button
            variant="destructive"
            className="w-auto transition-transform duration-200 hover:scale-105 hover:shadow-lg"
          >
            Delete
          </Button>
        </ConfirmationDialog>

        <Link href={`/books/${id}`}>
          <Button
            variant="secondary"
            className="w-auto transition-transform duration-200 hover:scale-105 hover:shadow-lg"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
