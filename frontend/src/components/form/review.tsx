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
import BackButton from "../common/back-button";
import { createReview } from "@/utils/api/reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewFormData {
  reviewer_name: string;
  text: string;
  rating: number;
}

interface IProps {
  bookId: string;
}

export default function ReviewForm({ bookId }: IProps) {
  const router = useRouter();

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

  const onSubmit = async (data: ReviewFormData) => {
    try {
      const response = await createReview(data, bookId);
      if (response.success) {
        router.back();
        toast.success("Review submitted");
      } else toast.error(response.message);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Submit Your Review</h1>
        <BackButton />
      </div>

      <p className="text-gray-600">
        We’d love to hear your thoughts about this book.
      </p>

      {/* Form section */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            rules={{ required: "Please enter your name", minLength: 1 }}
            name="reviewer_name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    id="reviewer_name"
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
                <FormLabel>Your Opinion</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What do you think?"
                    {...field}
                    id="text"
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
                <FormLabel>Rate (1-5)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Rating"
                    {...field}
                    id="rating"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
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
                  Submitting…
                </>
              ) : (
                "Submit a review"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
