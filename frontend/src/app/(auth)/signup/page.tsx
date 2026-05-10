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
const FALLBACK_ERROR_MESSAGE = "Check the form details and try again.";

const fieldLabelClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600";
const fieldInputClassName =
  "h-12 rounded-2xl border-stone-300/80 bg-white/85 px-4 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";
const secondaryPanelClassName =
  "rounded-3xl border border-stone-900/8 bg-white/55 p-4 text-sm text-stone-600";

interface SignupFormState {
  name: string;
  username: string;
  password: string;
}

const INITIAL_FORM_STATE: SignupFormState = {
  name: "",
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

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, signup } = useAuth();
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
    (field: keyof SignupFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
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

    const signupResponse = await signup(form);

    if (!signupResponse.success) {
      setIsSubmitting(false);
      const message = signupResponse.message || FALLBACK_ERROR_MESSAGE;
      setSubmitError(message);
      toast.error(message);
      return;
    }

    const loginResponse = await login(form.username, form.password);
    setIsSubmitting(false);

    if (!loginResponse.success) {
      toast.success("Account created. Please log in.");
      router.replace("/login");
      return;
    }

    toast.success("Account created successfully.");
    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
          Join The Shelf
        </p>
        <h1 className="font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-900 sm:text-5xl">
          Create your reader profile.
        </h1>
        <p className="max-w-md text-sm leading-6 text-stone-600">
          Start tracking titles, publishing reviews, and building a reading
          record that feels like yours.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name" className={fieldLabelClassName}>
            Name
          </Label>
          <Input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={updateField("name")}
            className={fieldInputClassName}
            required
          />
        </div>

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
            placeholder="jane-doe"
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={updateField("password")}
            className={fieldInputClassName}
            minLength={6}
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
          {isSubmitting ? "Creating Account\u2026" : "Create Account"}
        </Button>
      </form>

      <div className="space-y-3">
        <div className={secondaryPanelClassName}>
          <p className="font-medium text-stone-800">Already have an account?</p>
          <p className="mt-1 leading-6">
            Sign in to continue writing reviews and managing your shelf.
          </p>
          <Link
            className="mt-3 inline-flex text-sm font-medium text-[#7c5233] underline decoration-[#c8a17c] underline-offset-4 transition-colors hover:text-stone-900"
            href="/login"
          >
            Go to sign in
          </Link>
        </div>

        <div className={secondaryPanelClassName}>
          <p className="font-medium text-stone-800">Still deciding?</p>
          <p className="mt-1 leading-6">
            Browse the collection as a guest before you commit to an account.
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
