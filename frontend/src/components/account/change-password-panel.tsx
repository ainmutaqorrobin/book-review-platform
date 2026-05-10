"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/common/back-button";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldLabelClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600";
const fieldInputClassName =
  "h-12 rounded-2xl border-stone-300/80 bg-white/85 px-4 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-stone-500/20";
const LOGIN_NEXT_PATH = "/account/password";

interface ChangePasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_FORM_STATE: ChangePasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordPanel() {
  const { changePassword, isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField =
    (field: keyof ChangePasswordFormState) =>
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

    if (form.newPassword.length < 6) {
      setSubmitError("New password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setSubmitError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const response = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });

    setIsSubmitting(false);

    if (!response.success) {
      const message =
        response.message || "We could not update your password right now.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setForm(INITIAL_FORM_STATE);
    toast.success("Password updated successfully.");
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-[1.75rem] border border-stone-900/10 bg-white/60 px-5 py-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
        <Loader2
          aria-hidden="true"
          className="h-5 w-5 animate-spin text-stone-700"
        />
        <span aria-live="polite" className="text-sm text-stone-600">
          Loading account settings...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[2rem] border border-stone-900/10 bg-white/65 p-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Account Security
            </p>
            <h1 className="mt-2 font-[family-name:Georgia,serif] text-4xl text-stone-900">
              Change Password
            </h1>
          </div>
          <BackButton fallbackHref="/books" />
        </div>

        <div className="rounded-[1.75rem] border border-stone-900/8 bg-[#fffaf2] p-6">
          <p className="font-[family-name:Georgia,serif] text-3xl text-stone-900">
            Sign in to update your password.
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Password changes belong to your account settings, so you need to be
            signed in before we can verify your current password.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-full bg-stone-900 px-5 text-stone-50 hover:bg-stone-800"
            >
              <Link href={`/login?next=${encodeURIComponent(LOGIN_NEXT_PATH)}`}>
                Log In
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-stone-300 bg-[#fffaf2] px-5 text-stone-700 hover:border-stone-500 hover:bg-white"
            >
              <Link href="/">Browse Home</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:grid lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="rounded-[2rem] border border-stone-900/10 bg-[#201814] p-8 text-stone-100 shadow-[0_24px_70px_rgba(42,26,18,0.24)]">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
          Account Security
        </p>
        <h1 className="mt-5 font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-50">
          Update your password without losing your place.
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          Use your current password to confirm the change, then set a stronger
          replacement you will remember. This keeps account access in your
          hands without adding unnecessary friction.
        </p>
        <div className="mt-8">
          <BackButton fallbackHref="/books" />
        </div>
      </aside>

      <div className="rounded-[2rem] border border-stone-900/10 bg-[#fffaf2]/90 p-6 shadow-[0_20px_60px_rgba(64,38,24,0.1)] sm:p-8">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
            Password Update
          </p>
          <p className="text-sm leading-7 text-stone-600">
            Confirm your current password first, then choose a new one with at
            least six characters.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="currentPassword" className={fieldLabelClassName}>
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              placeholder="Enter your current password"
              value={form.currentPassword}
              onChange={updateField("currentPassword")}
              className={fieldInputClassName}
              required
            />
          </div>

          <div>
            <Label htmlFor="newPassword" className={fieldLabelClassName}>
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              placeholder="Choose a new password"
              value={form.newPassword}
              onChange={updateField("newPassword")}
              className={fieldInputClassName}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className={fieldLabelClassName}>
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter the new password"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
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

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              className="h-12 rounded-full bg-stone-900 px-6 text-stone-50 shadow-[0_12px_30px_rgba(42,26,18,0.18)] hover:bg-stone-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
