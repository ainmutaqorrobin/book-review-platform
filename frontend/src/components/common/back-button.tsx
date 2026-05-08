"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      className="h-10 rounded-full border-stone-300 bg-[#fffaf2] px-4 text-stone-700 hover:border-stone-500 hover:bg-white"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </Button>
  );
}
