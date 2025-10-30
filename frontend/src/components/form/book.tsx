"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import BackButton from "../common/back-button";
import { useRouter } from "next/navigation";
import { createBook } from "@/utils/api/books";
import { toast } from "sonner";

interface BookFormData {
  title: string;
  author: string;
  description?: string;
  cover_image_url?: string;
}

export default function BookForm() {
  const router = useRouter();

  const form = useForm<BookFormData>({
    defaultValues: {
      title: "",
      author: "",
      description: "",
      cover_image_url: "",
    },
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: BookFormData) => {
    try {
      const res = await createBook(data);
      if (res.success) {
        toast.success("Book created successfully!");
        router.push("/books");
      } else {
        toast.error("Failed to create book.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Add New Book</h1>
        <BackButton />
      </div>

      <p className="text-gray-600">
        Fill out the details below to add a new book to the collection.
      </p>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
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

          {/* Author */}
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

          {/* Description */}
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

          {/* Cover Image URL */}
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

          {/* Submit Button */}
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
                  Submitting…
                </>
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
