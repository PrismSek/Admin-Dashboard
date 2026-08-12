"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { authRoutes, resetPasswordContent } from "@/features/auth/content";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";

/** Used both for invited users setting a first password and for resets. */
export function ResetPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(() => {
    router.push(authRoutes.signedIn);
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
