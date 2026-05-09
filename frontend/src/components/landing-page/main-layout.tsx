"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, role, user } = useAuth();
  const canManageBooks = role === "admin" || role === "user";

  const navLinkClassName = buttonVariants({
    variant: "ghost",
    size: "sm",
  });

  const handleLogout = async () => {
    const response = await logout();

    if (!response.success) {
      toast.error(response.message || "Failed to log out.");
      return;
    }

    toast.success("Logged out");
    router.push("/");
    router.refresh();
    setIsOpen(false);
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,120,74,0.22),_transparent_28%),linear-gradient(180deg,_#f8f2e8_0%,_#ede0cf_100%)] text-stone-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-stone-50"
        >
          Skip to main content
        </a>

        <header className="sticky top-0 z-50 border-b border-stone-900/10 bg-[#fffaf2]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-900/10 bg-[#201814] text-[#f8f2e8] shadow-[0_10px_30px_rgba(32,24,20,0.18)]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">
                  BookReview
                </p>
                <p className="font-[family-name:Georgia,serif] text-xl text-stone-900 transition-colors group-hover:text-[#7c5233]">
                  Editorial Shelf
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {canManageBooks && (
                <Link href="/create-book" className={navLinkClassName}>
                  Add a Book
                </Link>
              )}
              <Link href="/books" className={navLinkClassName}>
                Browse Books
              </Link>
              {!isLoading && !isAuthenticated && (
                <>
                  <Link href="/login" className={navLinkClassName}>
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-9 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-medium text-stone-50 shadow-[0_12px_30px_rgba(42,26,18,0.18)] transition-colors hover:bg-stone-800"
                  >
                    Join Free
                  </Link>
                </>
              )}
              {!isLoading && isAuthenticated && (
                <div className="flex items-center gap-3 rounded-full border border-stone-900/8 bg-white/60 px-4 py-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-stone-900">
                      {user?.name}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                      {role}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-stone-300 bg-transparent text-stone-700 hover:border-stone-500 hover:bg-stone-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </nav>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen((currentState) => !currentState)}
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="rounded-full border border-stone-900/10 bg-white/60 md:hidden"
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>

          <div
            id="mobile-navigation"
            className={`overflow-hidden border-t border-stone-900/8 bg-[#fffaf2] transition-[max-height,opacity] duration-300 ease-in-out md:hidden ${
              isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              {canManageBooks && (
                <Link
                  href="/create-book"
                  className={navLinkClassName}
                  onClick={() => setIsOpen(false)}
                >
                  Add a Book
                </Link>
              )}
              <Link
                href="/books"
                className={navLinkClassName}
                onClick={() => setIsOpen(false)}
              >
                Browse Books
              </Link>
              {!isLoading && !isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className={navLinkClassName}
                    onClick={() => setIsOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-medium text-stone-50 shadow-[0_12px_30px_rgba(42,26,18,0.18)] transition-colors hover:bg-stone-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Join Free
                  </Link>
                </>
              )}
              {!isLoading && isAuthenticated && (
                <Button
                  variant="outline"
                  className="rounded-full border-stone-300 bg-transparent text-stone-700 hover:border-stone-500 hover:bg-stone-100"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </nav>
          </div>
        </header>

        <main id="main-content" className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <Toaster />
      </body>
    </html>
  );
}
