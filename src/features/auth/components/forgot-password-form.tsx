"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { authRoutes, forgotPasswordContent } from "@/features/auth/content";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";

/**
 * This screen does not exist in the Figma file — the flow jumped straight from
 * the "Forgot password?" link to the confirmation. Built in the established
 * split-layout style. See docs/FIGMA-DEVIATIONS.md.
 *
 * Note for the API wiring: always advance to the confirmation screen, whether
 * or not the address matches an account. Branching here would turn the form
 * into an account-existence oracle.
 */
export function ForgotPasswordForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = handleSubmit((values) => {
    router.push(`${authRoutes.forgotPasswordSent}?email=${encodeURIComponent(values.email)}`);
  });

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title={forgotPasswordContent.title}
        subtitle={forgotPasswordContent.subtitle}
      />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="reset-email"
          label={forgotPasswordContent.emailLabel}
          error={errors.email?.message}
        >
          {(field) => (
            <Input
              {...field}
              {...register("email")}
              type="email"
              autoComplete="email"
              autoFocus
              placeholder={forgotPasswordContent.emailPlaceholder}
              icon={<Mail aria-hidden />}
            />
          )}
        </FormField>

        <Button type="submit" disabled={isSubmitting}>
          {forgotPasswordContent.submit}
        </Button>
      </form>

      <div className="border-t border-line pt-6 text-center">
        <Link
          href={authRoutes.signIn}
          className="inline-flex items-center gap-1.5 rounded-sm text-body font-medium text-ink hover:text-brand"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {forgotPasswordContent.backToSignIn}
        </Link>
      </div>
    </div>
  );
}
