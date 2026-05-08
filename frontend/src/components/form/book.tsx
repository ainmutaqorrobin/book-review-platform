"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import BackButton from "../common/back-button";
import { useAuth } from "../providers/auth-provider";
import { createBook, getBookById, updateBook } from "@/utils/api/books";

interface BookFormData {
  title: string;
  author: string;
  description: string;
  cover_image_url: string;
}

interface BookFormProps {
  mode?: "create" | "edit";
  bookId?: number;
}

const EMPTY_VALUES: BookFormData = {
  title: "",
  author: "",
  description: "",
  cover_image_url: "",
};

const fieldLabelClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600";
const fieldInputClassName =
  "h-12 rounded-2xl border-stone-300/80 bg-white/85 px-4 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";

export default function BookForm({
  mode = "create",
  bookId,
}: BookFormProps) {
  const router = useRouter();
  const { isLoading: authLoading, role, user } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(mode === "edit");
  const [formError, setFormError] = useState<string | null>(null);
  const [ownerUserId, setOwnerUserId] = useState<number | null>(null);

  const form = useForm<BookFormData>({
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    if (mode !== "edit" || !bookId) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;

    const loadBook = async () => {
      setIsPageLoading(true);
      const response = await getBookById(bookId);

      if (!isMounted) return;

      if (!response.success || !response.data) {
        setFormError(response.message || "Failed to load book.");
        setIsPageLoading(false);
        return;
      }

      setOwnerUserId(response.data.owner_user_id ?? null);
      reset({
        title: response.data.title,
        author: response.data.author,
        description: response.data.description ?? "",
        cover_image_url: response.data.cover_image_url ?? "",
      });
      setFormError(null);
      setIsPageLoading(false);
    };

    void loadBook();

    return () => {
      isMounted = false;
    };
  }, [bookId, mode, reset]);

  const canManageBook =
    role === "admin" ||
    (role === "user" && (mode === "create" || ownerUserId === user?.id));

  const onSubmit = async (data: BookFormData) => {
    const response =
      mode === "edit" && bookId
        ? await updateBook(bookId, data)
        : await createBook(data);

    if (!response.success) {
      toast.error(response.message || "Failed to save book.");
      return;
    }

    toast.success(
      mode === "edit"
        ? "Book updated successfully!"
        : "Book created successfully!"
    );

    router.push(mode === "edit" && bookId ? `/books/${bookId}` : "/books");
    router.refresh();
  };

  if (isPageLoading || authLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-[1.75rem] border border-stone-900/10 bg-white/60 px-5 py-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
        <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-stone-700" />
        <span aria-live="polite" className="text-sm text-stone-600">
          Loading book form…
        </span>
      </div>
    );
  }

  if (!canManageBook || formError) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-[2rem] border border-stone-900/10 bg-white/65 p-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Book Editor
            </p>
            <h1 className="mt-2 font-[family-name:Georgia,serif] text-4xl text-stone-900">
              {mode === "edit" ? "Edit Book" : "Add New Book"}
            </h1>
          </div>
          <BackButton />
        </div>

        <p className="rounded-[1.5rem] border border-red-300/70 bg-red-50 px-4 py-4 text-sm text-red-700">
          {formError ||
            `You do not have permission to ${
              mode === "edit" ? "edit" : "create"
            } a book.`}
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:grid lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="rounded-[2rem] border border-stone-900/10 bg-[#201814] p-8 text-stone-100 shadow-[0_24px_70px_rgba(42,26,18,0.24)]">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
          {mode === "edit" ? "Refine The Entry" : "Add To The Shelf"}
        </p>
        <h1 className="mt-5 font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-50">
          {mode === "edit"
            ? "Update the book card with cleaner context."
            : "Introduce a title with enough detail to invite attention."}
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          Strong entries make the collection easier to scan. Keep the title,
          author, and description sharp enough that another reader instantly
          understands why the book belongs here.
        </p>
        <div className="mt-8">
          <BackButton />
        </div>
      </aside>

      <div className="rounded-[2rem] border border-stone-900/10 bg-[#fffaf2]/90 p-6 shadow-[0_20px_60px_rgba(64,38,24,0.1)] sm:p-8">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
            Book Details
          </p>
          <p className="text-sm leading-7 text-stone-600">
            {mode === "edit"
              ? "Update the metadata below and keep the record consistent."
              : "Fill in the essentials so the book feels legible the moment it appears."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>Book Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="title"
                      autoComplete="off"
                      placeholder="Enter book title"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              rules={{ required: "Author is required" }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>Author</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="author"
                      autoComplete="off"
                      placeholder="Enter author name"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>Description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="description"
                      autoComplete="off"
                      placeholder="Enter book description"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>
                    Cover Image URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      inputMode="url"
                      name="cover_image_url"
                      autoComplete="off"
                      placeholder="Enter image URL"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                className="h-12 rounded-full bg-stone-900 px-6 text-stone-50 shadow-[0_12px_30px_rgba(42,26,18,0.18)] hover:bg-stone-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Saving…
                  </>
                ) : mode === "edit" ? (
                  "Update Book"
                ) : (
                  "Create Book"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
