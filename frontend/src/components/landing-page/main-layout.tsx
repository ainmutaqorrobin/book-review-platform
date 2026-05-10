"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import DesktopNavigation from "@/components/landing-page/desktop-navigation";
import MobileNavigation from "@/components/landing-page/mobile-navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

interface RootLayoutProps {
  children: ReactNode;
}

function BrandMark() {
  return (
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
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, role, user } = useAuth();
  const canManageBooks = role === "admin" || role === "user";

  const navLinkClassName = buttonVariants({
    variant: "ghost",
    size: "sm",
  });

  useEffect(() => {
    setIsMobileNavigationOpen(false);
  }, [pathname]);

  const closeMobileNavigation = () => {
    setIsMobileNavigationOpen(false);
  };

  const handleLogout = async () => {
    const response = await logout();

    if (!response.success) {
      toast.error(response.message || "Failed to log out.");
      return;
    }

    toast.success("Logged out");
    closeMobileNavigation();
    router.push("/");
    router.refresh();
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
            <BrandMark />

            <DesktopNavigation
              canManageBooks={canManageBooks}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              navLinkClassName={navLinkClassName}
              onLogout={handleLogout}
              role={role}
              userName={user?.name}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setIsMobileNavigationOpen((currentState) => !currentState)
              }
              aria-label={
                isMobileNavigationOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileNavigationOpen}
              aria-controls="mobile-navigation"
              className="rounded-full border border-stone-900/10 bg-white/60 md:hidden"
            >
              {isMobileNavigationOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>

          <MobileNavigation
            canManageBooks={canManageBooks}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            isOpen={isMobileNavigationOpen}
            navLinkClassName={navLinkClassName}
            onClose={closeMobileNavigation}
            onLogout={handleLogout}
            role={role}
            userName={user?.name}
          />
        </header>

        <main id="main-content" className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <Toaster />
      </body>
    </html>
  );
}
