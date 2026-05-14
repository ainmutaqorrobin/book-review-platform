"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
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
import { shouldBypassImageOptimization } from "@/lib/image";
import ConfirmationDialog from "./confirmation-dialog";
import { useAuth } from "../providers/auth-provider";

interface IProps {
  book: Model;
  onBookDeleteCallback: () => void;
}

export default function Book({ book, onBookDeleteCallback }: IProps) {
  const { author, id, title, cover_image_url, created_at, description } = book;
  const { isLoading, role, user } = useAuth();
  const shouldBypassOptimization =
    shouldBypassImageOptimization(cover_image_url);
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
          unoptimized={shouldBypassOptimization}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#201814]/82 via-[#201814]/18 to-transparent" />

        {canManageBook && (
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-[#201814]/55 p-1.5 shadow-[0_10px_30px_rgba(32,24,20,0.24)] backdrop-blur-md">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="rounded-full bg-white/92 text-stone-800 hover:bg-white hover:text-stone-950"
            >
              <Link href={`/books/${id}/edit`} aria-label={`Edit ${title}`}>
                <Pencil aria-hidden="true" className="size-4" />
              </Link>
            </Button>

            <ConfirmationDialog
              title={`Delete "${title}"?`}
              description="This action cannot be undone."
              actionText="Confirm Delete"
              onConfirm={handleDelete}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${title}`}
                className="rounded-full bg-[#2d1612]/90 text-stone-50 hover:bg-[#1f0f0b] hover:text-white"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </ConfirmationDialog>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5">
          <p className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-100 backdrop-blur-sm">
            Added {formatDate(created_at || "")}
          </p>
        </div>
      </div>

      <CardHeader className="gap-3 px-6 pt-6">
        <div className="space-y-2">
          <CardTitle className="font-[family-name:Georgia,serif] text-3xl leading-tight text-stone-900">
            {title}
          </CardTitle>
          <p className="text-sm tracking-[0.08em] text-stone-600">
            by {author}
          </p>
        </div>
      </CardHeader>

      <CardContent className="grow px-6 pb-0">
        <p className="line-clamp-4 text-sm leading-7 text-stone-600">
          {description || "No description has been added for this book yet."}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
            Shelf Entry
          </p>
          <p className="text-sm text-stone-600">
            Open the full page to read reviews and manage the record.
          </p>
        </div>

        <Button
          asChild
          variant="secondary"
          className="group h-11 rounded-full bg-stone-900 px-5 text-stone-50 hover:bg-stone-800"
        >
          <Link href={`/books/${id}`}>
            Read Details
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
