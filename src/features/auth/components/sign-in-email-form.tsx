"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { ProviderButtons } from "@/features/auth/components/provider-buttons";
import { authRoutes, signInContent } from "@/features/auth/content";
import { signInEmailSchema, type SignInEmailValues } from "@/features/auth/schemas";

/**
 * Step one of the identifier-first flow: collect the work email, then route to
 * the password step.
 *
 * No auth API exists yet, so submission just advances the flow. When the API
 * lands, this should call a Server Action that looks up the identity and
 * redirects to the password screen, the SSO handoff, or the suspended screen
 * as appropriate — and that action must re-validate with `signInEmailSchema`.
 */
export function SignInEmailForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInEmailValues>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((values) => {
    router.push(`${authRoutes.password}?email=${encodeURIComponent(values.email)}`);
  });

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading title={signInContent.title} />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="email" label={signInContent.emailLabel} error={errors.email?.message}>
          {(field) => (
            <Input
              {...field}
              {...register("email")}
              type="email"
              autoComplete="email"
              autoFocus
              placeholder={signInContent.emailPlaceholder}
              icon={<Mail aria-hidden />}
            />
          )}
        </FormField>

        <Button type="submit" disabled={isSubmitting}>
          {signInContent.submit}
          <ArrowRight aria-hidden />
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-fine text-muted">{signInContent.dividerLabel}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <ProviderButtons ssoHref={authRoutes.sso} />

      <p className="border-t border-line pt-6 text-center text-body text-ink">
        {signInContent.noAccount}{" "}
        <Link href={authRoutes.signUp} className="rounded-sm font-medium text-brand hover:underline">
          {signInContent.createAccount}
        </Link>
      </p>
    </div>
  );
}
