"use client";

import Link from "next/link";
import AccountActionsMenu from "@/components/landing-page/account-actions-menu";

interface DesktopNavigationProps {
  canManageBooks: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  navLinkClassName: string;
  onLogout: () => Promise<void>;
  role: string;
  userName?: string;
}

export default function DesktopNavigation({
  canManageBooks,
  isAuthenticated,
  isLoading,
  navLinkClassName,
  onLogout,
  role,
  userName,
}: DesktopNavigationProps) {
  return (
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

      {!isLoading && isAuthenticated && userName && (
        <AccountActionsMenu
          role={role}
          userName={userName}
          onLogout={onLogout}
          variant="desktop"
        />
      )}
    </nav>
  );
}
