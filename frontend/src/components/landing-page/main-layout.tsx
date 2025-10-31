"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Menu, X } from "lucide-react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Book Review Platform",
  description: "Discover and review books you love",
};

export default function RootLayout({ children }: RootLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {/* Navbar */}
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <Link href="/" className="text-2xl font-bold">
              BookReview
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-4">
              <Link
                href="/create-book"
                className={buttonVariants({ variant: "ghost" })}
              >
                Create Your Book
              </Link>
              <Link
                href="/books"
                className={buttonVariants({ variant: "ghost" })}
              >
                Books List
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded hover:bg-accent focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown Menu with smooth transition */}
          <div
            className={`
              md:hidden
              overflow-hidden
              transition-[max-height,opacity]
              duration-300
              ease-in-out
              ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            <nav className="flex flex-col items-start p-4 space-y-3">
              <Link
                href="/create-book"
                className={buttonVariants({ variant: "ghost" })}
                onClick={() => setIsOpen(false)}
              >
                Create Your Book
              </Link>
              <Link
                href="/books"
                className={buttonVariants({ variant: "ghost" })}
                onClick={() => setIsOpen(false)}
              >
                Books List
              </Link>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-6 py-10">{children}</main>

        <Toaster />
      </body>
    </html>
  );
}
