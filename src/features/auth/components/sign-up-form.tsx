"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { authRoutes, footerLinks, signUpContent } from "@/features/auth/content";
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas";

const termsHref = footerLinks.find((link) => link.label === "Terms of Service")?.href ?? "#";
const privacyHref = footerLinks.find((link) => link.label === "Privacy Policy")?.href ?? "#";

export function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(() => {
    router.push(authRoutes.signedIn);
  });

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading title={signUpContent.title} subtitle={signUpContent.subtitle} />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="firstName"
            label={signUpContent.firstNameLabel}
            error={errors.firstName?.message}
          >
            {(field) => (
              <Input
                {...field}
                {...register("firstName")}
                autoComplete="given-name"
                placeholder={signUpContent.firstNamePlaceholder}
              />
            )}
          </FormField>

          <FormField
            id="lastName"
            label={signUpContent.lastNameLabel}
            error={errors.lastName?.message}
          >
            {(field) => (
              <Input
                {...field}
                {...register("lastName")}
                autoComplete="family-name"
                placeholder={signUpContent.lastNamePlaceholder}
              />
            )}
          </FormField>
        </div>

        <FormField id="signup-email" label={signUpContent.emailLabel} error={errors.email?.message}>
          {(field) => (
            <Input
              {...field}
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder={signUpContent.emailPlaceholder}
              icon={<Mail aria-hidden />}
            />
          )}
        </FormField>

        <FormField
          id="signup-password"
          label={signUpContent.passwordLabel}
          hint={signUpContent.passwordHint}
          error={errors.password?.message}
        >
          {(field) => (
            <PasswordInput
              {...field}
              {...register("password")}
              autoComplete="new-password"
              placeholder={signUpContent.passwordPlaceholder}
              icon={<Lock aria-hidden />}
            />
          )}
        </FormField>

        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              aria-invalid={Boolean(errors.acceptedTerms)}
              aria-describedby={errors.acceptedTerms ? "terms-error" : undefined}
              className="mt-0.5"
              {...register("acceptedTerms")}
            />
            <label htmlFor="terms" className="text-help text-ink">
              {signUpContent.termsPrefix}{" "}
              <Link href={termsHref} className="rounded-sm text-brand hover:underline">
                {signUpContent.termsLabel}
              </Link>{" "}
              {signUpContent.termsJoin}{" "}
              <Link href={privacyHref} className="rounded-sm text-brand hover:underline">
                {signUpContent.privacyLabel}
              </Link>
            </label>
          </div>
          {errors.acceptedTerms ? (
            <FieldError id="terms-error">{errors.acceptedTerms.message}</FieldError>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {signUpContent.submit}
          <ArrowRight aria-hidden />
        </Button>
      </form>

      <p className="text-body text-muted">
        {signUpContent.haveAccount}{" "}
        <Link href={authRoutes.signIn} className="rounded-sm font-semibold text-brand hover:underline">
          {signUpContent.signIn}
        </Link>
      </p>
    </div>
  );
}
