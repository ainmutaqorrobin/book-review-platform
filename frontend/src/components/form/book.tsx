"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ImagePlus, Link2, Loader2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type CoverSourceOption = "none" | "url" | "upload";

interface BookFormData {
  title: string;
  author: string;
  description: string;
  cover_image_url: string;
  cover_source: CoverSourceOption;
  cover_file: File | null;
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
  cover_source: "none",
  cover_file: null,
};

const fieldLabelClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600";
const fieldInputClassName =
  "h-12 rounded-2xl border-stone-300/80 bg-white/85 px-4 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";
const fieldTextareaClassName =
  "min-h-36 rounded-[1.5rem] border-stone-300/80 bg-white/85 px-4 py-3 text-sm leading-7 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";

const coverSourceOptions: Array<{
  value: CoverSourceOption;
  label: string;
  description: string;
  icon: typeof XCircle;
}> = [
  {
    value: "none",
    label: "No Cover",
    description: "Save the book without any cover image.",
    icon: XCircle,
  },
  {
    value: "url",
    label: "Image URL",
    description: "Use a direct image link from another site.",
    icon: Link2,
  },
  {
    value: "upload",
    label: "Upload Image",
    description: "Choose an image file from your device.",
    icon: Upload,
  },
];

function getCoverSourceOption(
  source: "upload" | "external" | null | undefined,
): CoverSourceOption {
  if (source === "upload") {
    return "upload";
  }

  if (source === "external") {
    return "url";
  }

  return "none";
}

function createBookPayload(data: BookFormData, isEditMode: boolean) {
  const payload = {
    title: data.title,
    author: data.author,
    description: data.description,
  };

  if (data.cover_source === "url") {
    return {
      ...payload,
      cover_image_url: data.cover_image_url.trim(),
    };
  }

  if (data.cover_source === "none") {
    return isEditMode
      ? {
          ...payload,
          cover_image_url: "",
        }
      : payload;
  }

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("author", data.author);
  formData.append("description", data.description);

  if (data.cover_file) {
    formData.append("cover", data.cover_file);
  }

  return formData;
}

export default function BookForm({ mode = "create", bookId }: BookFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit" && Boolean(bookId);
  const fallbackHref =
    mode === "edit" && bookId ? `/books/${bookId}` : "/books";
  const { isLoading: authLoading, role, user } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [ownerUserId, setOwnerUserId] = useState<number | null>(null);
  const [loadedBookId, setLoadedBookId] = useState<number | null>(null);
  const [failedBookId, setFailedBookId] = useState<number | null>(null);
  const [existingCoverSource, setExistingCoverSource] = useState<
    "upload" | "external" | null
  >(null);
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState<
    string | null
  >(null);

  const form = useForm<BookFormData>({
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
  });

  const {
    clearErrors,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting },
  } = form;

  const selectedCoverSource = watch("cover_source");
  const selectedCoverFile = watch("cover_file");

  useEffect(() => {
    if (!isEditMode || !bookId) {
      return;
    }

    let isMounted = true;

    const loadBook = async () => {
      const response = await getBookById(bookId);

      if (!isMounted) return;

      if (!response.success || !response.data) {
        setFailedBookId(bookId);
        setFormError(response.message || "Failed to load book.");
        return;
      }

      const coverSource = getCoverSourceOption(
        response.data.cover_image_source,
      );

      setOwnerUserId(response.data.owner_user_id ?? null);
      setExistingCoverSource(response.data.cover_image_source);
      setExistingCoverImageUrl(response.data.cover_image_url ?? null);
      reset({
        title: response.data.title,
        author: response.data.author,
        description: response.data.description ?? "",
        cover_source: coverSource,
        cover_image_url:
          response.data.cover_image_source === "external"
            ? (response.data.cover_image_storage_value ?? "")
            : "",
        cover_file: null,
      });
      setLoadedBookId(bookId);
      setFailedBookId(null);
      setFormError(null);
    };

    void loadBook();

    return () => {
      isMounted = false;
    };
  }, [bookId, isEditMode, reset]);

  const isPageLoading =
    isEditMode && loadedBookId !== bookId && failedBookId !== bookId;

  const canManageBook =
    role === "admin" ||
    (role === "user" && (mode === "create" || ownerUserId === user?.id));

  const onSubmit = async (data: BookFormData) => {
    clearErrors("cover_file");

    const trimmedCoverUrl = data.cover_image_url.trim();
    const isKeepingExistingUploadedCover =
      isEditMode &&
      data.cover_source === "upload" &&
      existingCoverSource === "upload" &&
      !data.cover_file;

    if (data.cover_source === "url" && trimmedCoverUrl.length === 0) {
      setError("cover_image_url", {
        type: "manual",
        message: "Enter a direct image URL or choose another cover option.",
      });
      return;
    }

    if (
      data.cover_source === "upload" &&
      !data.cover_file &&
      !isKeepingExistingUploadedCover
    ) {
      setError("cover_file", {
        type: "manual",
        message: "Choose an image file to upload.",
      });
      return;
    }

    const payload = isKeepingExistingUploadedCover
      ? {
          title: data.title,
          author: data.author,
          description: data.description,
        }
      : createBookPayload(data, isEditMode);

    const response =
      mode === "edit" && bookId
        ? await updateBook(bookId, payload)
        : await createBook(payload);

    if (!response.success) {
      toast.error(response.message || "Failed to save book.");
      return;
    }

    toast.success(
      mode === "edit"
        ? "Book updated successfully!"
        : "Book created successfully!",
    );

    router.replace(mode === "edit" && bookId ? `/books/${bookId}` : "/books");
    router.refresh();
  };

  if (isPageLoading || authLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-[1.75rem] border border-stone-900/10 bg-white/60 px-5 py-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
        <Loader2
          aria-hidden="true"
          className="h-5 w-5 animate-spin text-stone-700"
        />
        <span aria-live="polite" className="text-sm text-stone-600">
          Loading book form...
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
          <BackButton fallbackHref={fallbackHref} />
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
          <BackButton fallbackHref={fallbackHref} />
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
                  <FormLabel className={fieldLabelClassName}>
                    Book Title
                  </FormLabel>
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
                  <FormLabel className={fieldLabelClassName}>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      name="description"
                      autoComplete="off"
                      placeholder="Write a short summary, context, or longer description for the book"
                      className={fieldTextareaClassName}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>
                    Cover Source
                  </FormLabel>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {coverSourceOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = field.value === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            field.onChange(option.value);
                            clearErrors(["cover_image_url", "cover_file"]);
                          }}
                          className={`rounded-[1.5rem] border px-4 py-4 text-left transition-[border-color,background-color,box-shadow] ${
                            isActive
                              ? "border-stone-900 bg-white shadow-[0_12px_30px_rgba(64,38,24,0.1)]"
                              : "border-stone-300/80 bg-white/65 hover:border-stone-500"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e7d8] text-stone-800">
                              <Icon aria-hidden="true" className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-stone-900">
                                {option.label}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-stone-600">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />

            {selectedCoverSource === "url" && (
              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field, fieldState }) => (
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
                        placeholder="https://example.com/cover.jpg"
                        className={fieldInputClassName}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            )}

            {selectedCoverSource === "upload" && (
              <FormField
                control={form.control}
                name="cover_file"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className={fieldLabelClassName}>
                      Cover File
                    </FormLabel>
                    <FormControl>
                      <div className="rounded-[1.5rem] border border-dashed border-stone-300/90 bg-white/80 p-4">
                        <label className="block cursor-pointer rounded-[1.25rem] border border-stone-300/70 bg-[#fffaf2] p-4 transition-colors hover:border-stone-500 hover:bg-white">
                          <Input
                            name={field.name}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              field.onChange(file);
                              clearErrors("cover_file");
                            }}
                          />

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <span className="flex items-center gap-2 text-sm font-medium text-stone-900">
                                <ImagePlus
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                />
                                Choose a cover image
                              </span>
                              <p className="text-xs leading-5 text-stone-600">
                                JPEG, PNG, or WebP up to 5 MB
                              </p>
                            </div>

                            <span className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-5 text-sm font-medium text-stone-800 shadow-[0_8px_20px_rgba(64,38,24,0.08)] transition-colors hover:border-stone-500">
                              {selectedCoverFile
                                ? "Choose Another File"
                                : "Choose File"}
                            </span>
                          </div>
                        </label>

                        <div className="mt-4 flex flex-col gap-3 rounded-[1rem] border border-stone-200/80 bg-stone-50/80 px-4 py-3">
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="font-medium text-stone-900">
                              {selectedCoverFile
                                ? selectedCoverFile.name
                                : existingCoverSource === "upload" &&
                                    existingCoverImageUrl
                                  ? "Current uploaded cover will be kept"
                                  : "No file selected"}
                            </span>
                            <span className="text-stone-600">
                              {selectedCoverFile
                                ? "This file will replace the current cover when you save."
                                : existingCoverSource === "upload" &&
                                    existingCoverImageUrl
                                  ? "Choose a new file only if you want to replace it."
                                  : "Select a file to upload a cover for this book."}
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            )}

            {selectedCoverSource === "none" && existingCoverImageUrl && (
              <div className="rounded-[1.5rem] border border-amber-300/70 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                Saving with "No Cover" will remove the current cover from this
                book.
              </div>
            )}

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
    </section>
  );
}
