"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteBook, Book as Model } from "@/utils/api/books";
import { FALLBACK_IMAGE } from "@/utils/const/image";
import { formatDate } from "@/lib/format";
import ConfirmationDialog from "./confirmation-dialog";
import { useAuth } from "../providers/auth-provider";

interface IProps {
  book: Model;
  onBookDeleteCallback: () => void;
}

export default function Book({ book, onBookDeleteCallback }: IProps) {
  const { author, id, title, cover_image_url, created_at, description } = book;
  const { isLoading, role, user } = useAuth();
  const canManageBook =
    !isLoading &&
    (role === "admin" || (role === "user" && user?.id === book.owner_user_id));

  const handleDelete = async () => {
    const response = await deleteBook(id);

    if (!response.success) {
      toast.error(response.message || "Failed to delete book.");
      return;
    }

    toast.success("Book deleted successfully");
    onBookDeleteCallback();
  };

  return (
    <Card className="overflow-hidden rounded-[1.9rem] border border-stone-900/10 bg-[#fffaf2]/88 py-0 shadow-[0_18px_40px_rgba(64,38,24,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(64,38,24,0.14)] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={cover_image_url || FALLBACK_IMAGE}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#201814]/65 to-transparent" />
      </div>

      <CardHeader className="gap-3 px-6 pt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
          Added {formatDate(created_at || "")}
        </p>
        <div className="space-y-2">
          <CardTitle className="font-[family-name:Georgia,serif] text-3xl leading-tight text-stone-900">
            {title}
          </CardTitle>
          <p className="text-sm tracking-[0.08em] text-stone-600">by {author}</p>
        </div>
      </CardHeader>

      <CardContent className="grow px-6 pb-0">
        <p className="line-clamp-4 text-sm leading-7 text-stone-600">
          {description || "No description has been added for this book yet."}
        </p>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3 px-6 py-6">
        <Button
          asChild
          variant="secondary"
          className="h-10 rounded-full bg-stone-900 px-5 text-stone-50 hover:bg-stone-800"
        >
          <Link href={`/books/${id}`}>Read Details</Link>
        </Button>

        {canManageBook && (
          <>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-stone-300 bg-white/70 px-5 text-stone-700 hover:border-stone-500 hover:bg-white"
            >
              <Link href={`/books/${id}/edit`}>Edit</Link>
            </Button>
            <ConfirmationDialog
              title={`Delete "${title}"?`}
              description="This action cannot be undone."
              actionText="Confirm Delete"
              onConfirm={handleDelete}
            >
              <Button
                variant="destructive"
                className="h-10 rounded-full px-5 shadow-none"
              >
                Delete
              </Button>
            </ConfirmationDialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
