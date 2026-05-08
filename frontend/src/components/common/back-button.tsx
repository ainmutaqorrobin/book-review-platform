"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackHref?: string;
}

export default function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!fallbackHref || typeof window === "undefined") {
      router.back();
      return;
    }

    const referrer = document.referrer;
    const hasInAppReferrer =
      !!referrer && new URL(referrer).origin === window.location.origin;

    if (hasInAppReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      variant="outline"
      className="h-10 rounded-full border-stone-300 bg-[#fffaf2] px-4 text-stone-700 hover:border-stone-500 hover:bg-white"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </Button>
  );
}
