"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      mode === "edit" ? "Book updated successfully!" : "Book created successfully!"
    );

    router.push(mode === "edit" && bookId ? `/books/${bookId}` : "/books");
    router.refresh();
  };

  if (isPageLoading || authLoading) {
    return (
      <div className="max-w-xl mx-auto flex items-center gap-3 py-10">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading book form...</span>
      </div>
    );
  }

  if (!canManageBook) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">
            {mode === "edit" ? "Edit Book" : "Add New Book"}
          </h1>
          <BackButton />
        </div>
        <p className="text-red-500">
          You do not have permission to {mode === "edit" ? "edit" : "create"} a
          book.
        </p>
      </div>
    );
  }

  if (formError) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">
            {mode === "edit" ? "Edit Book" : "Add New Book"}
          </h1>
          <BackButton />
        </div>
        <p className="text-red-500">{formError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          {mode === "edit" ? "Edit Book" : "Add New Book"}
        </h1>
        <BackButton />
      </div>

      <p className="text-gray-600">
        {mode === "edit"
          ? "Update the book details below."
          : "Fill out the details below to add a new book to the collection."}
      </p>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Book Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter book title" {...field} />
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
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Enter author name" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter book description (optional)"
                    {...field}
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
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL (optional)" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="default"
              className="transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving...
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
  );
}
