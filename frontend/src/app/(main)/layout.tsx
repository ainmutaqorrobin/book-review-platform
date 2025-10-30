import "../globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Book Review Platform",
  description: "Discover and review books you love",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {/* Navbar */}
        <header className="border-b bg-card">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <Link href="/" className="text-2xl font-bold">
              BookReview
            </Link>
            <nav className="flex gap-4">
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
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-6 py-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
