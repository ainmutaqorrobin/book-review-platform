"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

const DEFAULT_NEXT_PATH = "/books";
const FALLBACK_ERROR_MESSAGE =
  "Check your username and password and try again.";

const fieldLabelClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600";
const fieldInputClassName =
  "h-12 rounded-2xl border-stone-300/80 bg-white/85 px-4 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";
const secondaryPanelClassName =
  "rounded-3xl border border-stone-900/8 bg-white/55 p-4 text-sm text-stone-600";

interface LoginFormState {
  username: string;
  password: string;
}

const INITIAL_FORM_STATE: LoginFormState = {
  username: "",
  password: "",
};

function getInitialNextPath() {
  if (typeof window === "undefined") {
    return DEFAULT_NEXT_PATH;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("next") || DEFAULT_NEXT_PATH;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nextPath] = useState(getInitialNextPath);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  const updateField =
    (field: keyof LoginFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));

      if (submitError) {
        setSubmitError(null);
      }
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const response = await login(form.username, form.password);

    setIsSubmitting(false);

    if (!response.success) {
      const message = response.message || FALLBACK_ERROR_MESSAGE;
      setSubmitError(message);
      toast.error(message);
      return;
    }

    toast.success("Logged in successfully.");
    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
          Welcome Back
        </p>
        <h1 className="font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-900 sm:text-5xl">
          Sign in to your shelf.
        </h1>
        <p className="max-w-md text-sm leading-6 text-stone-600">
          Manage books, write reviews, and keep every reading note connected to
          your account.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="username" className={fieldLabelClassName}>
            Username
          </Label>
          <Input
            id="username"
            type="text"
            name="username"
            autoComplete="username"
            spellCheck={false}
            placeholder="Enter your username"
            value={form.username}
            onChange={updateField("username")}
            className={fieldInputClassName}
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className={fieldLabelClassName}>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={updateField("password")}
            className={fieldInputClassName}
            required
          />
        </div>

        {submitError && (
          <p
            aria-live="polite"
            className="rounded-2xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-stone-900 text-stone-50 shadow-[0_12px_30px_rgba(42,26,18,0.18)] hover:bg-stone-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In\u2026" : "Sign In"}
        </Button>
      </form>

      <div className="space-y-3">
        <div className={secondaryPanelClassName}>
          <p className="font-medium text-stone-800">Need an account?</p>
          <p className="mt-1 leading-6">
            Create one to publish reviews and manage the books you add.
          </p>
          <Link
            className="mt-3 inline-flex text-sm font-medium text-[#7c5233] underline decoration-[#c8a17c] underline-offset-4 transition-colors hover:text-stone-900"
            href="/signup"
          >
            Go to sign up
          </Link>
        </div>

        <div className={secondaryPanelClassName}>
          <p className="font-medium text-stone-800">Prefer to browse first?</p>
          <p className="mt-1 leading-6">
            Explore the collection as a guest and come back when you are ready
            to leave notes.
          </p>
          <Link
            className="mt-3 inline-flex text-sm font-medium text-[#7c5233] underline decoration-[#c8a17c] underline-offset-4 transition-colors hover:text-stone-900"
            href="/"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
