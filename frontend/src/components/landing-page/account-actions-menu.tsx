"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";

interface AccountActionsMenuProps {
  role: string;
  userName: string;
  onLogout: () => Promise<void>;
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
}

export default function AccountActionsMenu({
  role,
  userName,
  onLogout,
  onNavigate,
  variant,
}: AccountActionsMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = variant === "desktop";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDesktop || !isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDesktop, isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await onLogout();
  };

  if (isDesktop) {
    return (
      <div ref={accountMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((currentState) => !currentState)}
          aria-expanded={isOpen}
          aria-controls="account-actions-desktop"
          className="group flex items-center gap-3 rounded-full border border-stone-900/8 bg-white/70 px-3 py-2 text-left shadow-[0_14px_30px_rgba(64,38,24,0.08)] transition-[border-color,background-color,box-shadow] hover:border-stone-900/20 hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#201814] text-xs font-semibold uppercase tracking-[0.2em] text-stone-100">
            {userName.slice(0, 1)}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{userName}</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
              {role}
            </p>
          </div>
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          id="account-actions-desktop"
          className={`absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.5rem] border border-stone-900/10 bg-[#fffaf2]/95 p-3 shadow-[0_24px_70px_rgba(42,26,18,0.16)] backdrop-blur transition-[opacity,transform] duration-200 ${
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="rounded-[1.25rem] border border-stone-900/8 bg-white/70 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
              Signed in as
            </p>
            <p className="mt-2 font-[family-name:Georgia,serif] text-2xl text-stone-900">
              {userName}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Open your account actions from here.
            </p>
          </div>

          <div className="mt-3 grid gap-2">
            <Link
              href="/account/password"
              className="inline-flex items-center gap-3 rounded-[1.15rem] border border-stone-900/8 bg-white/70 px-4 py-3 text-sm font-medium text-stone-800 transition-[border-color,background-color,transform] hover:border-stone-900/20 hover:bg-white hover:translate-x-0.5"
              onClick={closeMenu}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3e7d8] text-stone-700">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              </span>
              Change password
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-3 rounded-[1.15rem] border border-stone-900/8 bg-white/70 px-4 py-3 text-sm font-medium text-stone-800 transition-[border-color,background-color,transform] hover:border-stone-900/20 hover:bg-white hover:translate-x-0.5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3e7d8] text-stone-700">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </span>
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-900/8 bg-white/65 p-2">
      <button
        type="button"
        onClick={() => setIsOpen((currentState) => !currentState)}
        aria-expanded={isOpen}
        aria-controls="account-actions-mobile"
        className="flex w-full items-center gap-3 rounded-[1.15rem] px-3 py-3 text-left transition-colors hover:bg-stone-100/70"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#201814] text-xs font-semibold uppercase tracking-[0.2em] text-stone-100">
          {userName.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-900">
            {userName}
          </p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
            Account actions
          </p>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id="account-actions-mobile"
        className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ${
          isOpen ? "max-h-60 opacity-100 pt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid gap-2 border-t border-stone-900/8 px-1 pt-3">
          <Link
            href="/account/password"
            className="inline-flex items-center gap-3 rounded-[1.15rem] bg-[#f8f1e4] px-4 py-3 text-sm font-medium text-stone-800 transition-colors hover:bg-[#efe0cf]"
            onClick={closeMenu}
          >
            <KeyRound className="h-4 w-4 text-stone-600" aria-hidden="true" />
            Change password
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-3 rounded-[1.15rem] bg-[#f8f1e4] px-4 py-3 text-sm font-medium text-stone-800 transition-colors hover:bg-[#efe0cf]"
          >
            <LogOut className="h-4 w-4 text-stone-600" aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
