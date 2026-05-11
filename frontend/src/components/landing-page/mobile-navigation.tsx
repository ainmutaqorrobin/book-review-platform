"use client";

import Link from "next/link";
import AccountActionsMenu from "@/components/landing-page/account-actions-menu";

interface MobileNavigationProps {
  canManageBooks: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOpen: boolean;
  navLinkClassName: string;
  onClose: () => void;
  onLogout: () => Promise<void>;
  role: string;
  userName?: string;
}

export default function MobileNavigation({
  canManageBooks,
  isAuthenticated,
  isLoading,
  isOpen,
  navLinkClassName,
  onClose,
  onLogout,
  role,
  userName,
}: MobileNavigationProps) {
  return (
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
            onClick={onClose}
          >
            Add a Book
          </Link>
        )}

        <Link href="/books" className={navLinkClassName} onClick={onClose}>
          Browse Books
        </Link>

        {!isLoading && !isAuthenticated && (
          <>
            <Link href="/login" className={navLinkClassName} onClick={onClose}>
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-medium text-stone-50 shadow-[0_12px_30px_rgba(42,26,18,0.18)] transition-colors hover:bg-stone-800"
              onClick={onClose}
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
            onNavigate={onClose}
            variant="mobile"
          />
        )}
      </nav>
    </div>
  );
}
