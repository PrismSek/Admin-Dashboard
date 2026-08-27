"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { authApiRoutes, authRoutes, passwordContent } from "@/features/auth/content";
import { passwordSchema, type PasswordValues } from "@/features/auth/schemas";
import { maskEmail } from "@/features/auth/utils";

/**
 * Step two of the identifier-first flow.
 *
 * The address is echoed back masked — the visitor has not yet proved they own
 * it, so the full address is never displayed here.
 *
 * `initialError` renders the invalid-credentials state from the design. Once
 * the auth API exists, a failed sign-in should set the same state, and the
 * message must stay deliberately vague ("invalid email or password") so the
 * screen never reveals whether an account exists.
 */
export function PasswordForm({
  email,
  initialError,
}: {
  email: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>(initialError);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(undefined);
    let res: Response;
    try {
      res = await fetch(authApiRoutes.login, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      setFormError(passwordContent.invalidCredentials);
      return;
    }
    if (res.ok) {
      router.push(authRoutes.signedIn);
      return;
    }
    // 401 is the uniform invalid-credentials response; the copy stays vague on
    // purpose so the screen never reveals whether an account exists.
    setFormError(passwordContent.invalidCredentials);
  });

  const message = formError ?? errors.password?.message;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <AuthHeading title={passwordContent.title} />
        <p className="text-body text-muted">{maskEmail(email)}</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-body font-medium text-label">
            {passwordContent.passwordLabel}
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            autoFocus
            placeholder={passwordContent.passwordPlaceholder}
            aria-invalid={Boolean(message)}
            aria-describedby={message ? "password-error" : undefined}
            {...register("password")}
          />
          {message ? <FieldError id="password-error">{message}</FieldError> : null}
        </div>

        <Link
          href={`${authRoutes.forgotPassword}?email=${encodeURIComponent(email)}`}
          className="self-end rounded-sm text-help font-medium text-brand hover:underline"
        >
          {passwordContent.forgot}
        </Link>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {passwordContent.submit}
          <ArrowRight aria-hidden />
        </Button>
      </form>

      <div className="border-t border-line pt-6 text-center">
        <Link
          href={authRoutes.signIn}
          className="inline-flex items-center gap-1.5 rounded-sm text-body font-medium text-ink hover:text-brand"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {passwordContent.useDifferentEmail}
        </Link>
      </div>
    </div>
  );
}
