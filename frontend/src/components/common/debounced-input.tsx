"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DebouncedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  label?: string;
}

export default function DebouncedSearchInput({
  value,
  onChange,
  delay = 1000,
  placeholder = "Search by title or author…",
  label = "Search books",
}: DebouncedSearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, internalValue, onChange, value]);

  return (
    <div className="relative w-full sm:min-w-[320px] sm:max-w-[420px]">
      <Label htmlFor="book-search" className="sr-only">
        {label}
      </Label>
      <Search
        aria-hidden="true"
        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
      />
      <Input
        id="book-search"
        name="search"
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-full border-stone-300 bg-[#fffaf2] pl-11 pr-4 text-stone-700 placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20"
        aria-label={label}
        autoComplete="off"
      />
    </div>
  );
}
