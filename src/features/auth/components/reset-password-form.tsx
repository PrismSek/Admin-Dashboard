"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError, FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { authApiRoutes, authRoutes, resetPasswordContent } from "@/features/auth/content";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";

/**
 * Sets a password from a reset link. The `token` comes from the email (via the
 * page's `?token=` query) and is the credential — a valid password with no or a
 * spent token is refused server-side. On success the account has no session
 * (the reset ends every prior one), so we hand off to sign-in.
 */
export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(undefined);
    if (!token) {
      setFormError(resetPasswordContent.linkInvalid);
      return;
    }
    let res: Response;
    try {
      res = await fetch(authApiRoutes.resetPassword, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
    } catch {
      setFormError(resetPasswordContent.failed);
      return;
    }
    if (res.ok) {
      router.push(authRoutes.signIn);
      return;
    }
    if (res.status === 401) setFormError(resetPasswordContent.linkInvalid);
    else if (res.status === 422) setFormError(resetPasswordContent.weakPassword);
    else setFormError(resetPasswordContent.failed);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-6 text-left">
      <FormField
        id="new-password"
        label={resetPasswordContent.newPasswordLabel}
        hint={resetPasswordContent.passwordHint}
        error={errors.password?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register("password")}
            autoComplete="new-password"
            autoFocus
            placeholder={resetPasswordContent.newPasswordPlaceholder}
            icon={<Lock aria-hidden />}
          />
        )}
      </FormField>

      <FormField
        id="confirm-password"
        label={resetPasswordContent.confirmLabel}
        error={errors.confirmPassword?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register("confirmPassword")}
            autoComplete="new-password"
            placeholder={resetPasswordContent.confirmPlaceholder}
            icon={<Lock aria-hidden />}
          />
        )}
      </FormField>

      {formError ? <FieldError id="reset-error">{formError}</FieldError> : null}

      <Button type="submit" disabled={isSubmitting}>
        {resetPasswordContent.submit}
        <ArrowRight aria-hidden />
      </Button>

      <Link
        href={authRoutes.signIn}
        className="inline-flex items-center justify-center gap-1.5 rounded-sm text-body text-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {resetPasswordContent.backToSignIn}
      </Link>
    </form>
  );
}
