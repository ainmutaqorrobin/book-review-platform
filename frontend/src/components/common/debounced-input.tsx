"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // shadcn input
import { Search } from "lucide-react";

interface DebouncedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
}

export default function DebouncedSearchInput({
  value,
  onChange,
  delay = 1000,
  placeholder = "Search…",
}: DebouncedSearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, delay, onChange, value]);

  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
