"use client";

import { useEffect } from "react";
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
import { createReview } from "@/utils/api/reviews";
import { useAuth } from "../providers/auth-provider";

interface ReviewFormData {
  reviewer_name: string;
  text: string;
  rating: number;
}

interface IProps {
  bookId: string;
}

const fieldLabelClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600";
const fieldInputClassName =
  "h-12 rounded-2xl border-stone-300/80 bg-white/85 px-4 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";

export default function ReviewForm({ bookId }: IProps) {
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<ReviewFormData>({
    defaultValues: {
      reviewer_name: "",
      text: "",
      rating: 0,
    },
    mode: "onTouched",
  });

  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  useEffect(() => {
    if (user?.name) {
      form.setValue("reviewer_name", user.name);
    }
  }, [form, user?.name]);

  const onSubmit = async (data: ReviewFormData) => {
    try {
      const response = await createReview(data, bookId);

      if (!response.success) {
        toast.error(response.message || "Please update the review and try again.");
        return;
      }

      router.back();
      toast.success("Review submitted");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:grid lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="rounded-[2rem] border border-stone-900/10 bg-[#201814] p-8 text-stone-100 shadow-[0_24px_70px_rgba(42,26,18,0.24)]">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
          Reader Note
        </p>
        <h1 className="mt-5 font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-50">
          Add a review that feels worth rereading.
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          Aim for clarity, not volume. A good review should help another reader
          understand the tone, quality, and aftertaste of the book.
        </p>
        <div className="mt-8">
          <BackButton />
        </div>
      </aside>

      <div className="rounded-[2rem] border border-stone-900/10 bg-[#fffaf2]/90 p-6 shadow-[0_20px_60px_rgba(64,38,24,0.1)] sm:p-8">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
            Review Form
          </p>
          <p className="text-sm leading-7 text-stone-600">
            Keep the review direct and useful. The AI layer can help with
            summaries and tags after your voice is already on the page.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              rules={{ required: "Please enter your name", minLength: 1 }}
              name="reviewer_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="reviewer_name"
                      autoComplete="name"
                      placeholder="Enter your name"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              rules={{
                required: "Please enter your opinion about this book",
                minLength: 1,
              }}
              name="text"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>
                    Your Opinion
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="text"
                      autoComplete="off"
                      placeholder="Share your thoughts"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              rules={{ required: "Please enter your rate", min: 1, max: 5 }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClassName}>Rate (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      name="rating"
                      min={1}
                      max={5}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Choose a rating from 1 to 5"
                      className={fieldInputClassName}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
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
                    Submitting…
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
