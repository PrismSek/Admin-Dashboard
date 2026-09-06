"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { acceptInvitationContent, authApiRoutes, authRoutes } from "@/features/auth/content";
import { acceptInvitationSchema, type AcceptInvitationValues } from "@/features/auth/schemas";

/**
 * Redeems an invitation. The `token` comes from the emailed link (via the page's
 * `?token=` query) and is the only credential — a valid form with no or a spent
 * token is refused server-side. On success the new account has no session, so we
 * hand off to sign-in.
 */
export function AcceptInvitationForm({ token }: { token?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ name, password }) => {
    setFormError(undefined);
    if (!token) {
      setFormError(acceptInvitationContent.linkInvalid);
      return;
    }
    let res: Response;
    try {
      res = await fetch(authApiRoutes.acceptInvitation, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
    } catch {
      setFormError(acceptInvitationContent.failed);
      return;
    }
    if (res.ok) {
      router.push(authRoutes.signIn);
      return;
    }
    if (res.status === 400) setFormError(acceptInvitationContent.linkInvalid);
    else setFormError(acceptInvitationContent.failed);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-6 text-left">
      <FormField id="invite-name" label={acceptInvitationContent.nameLabel} error={errors.name?.message}>
        {(field) => (
          <Input
            {...field}
            {...register("name")}
            autoComplete="name"
            autoFocus
            placeholder={acceptInvitationContent.namePlaceholder}
            icon={<User aria-hidden />}
          />
        )}
      </FormField>

      <FormField
        id="invite-password"
        label={acceptInvitationContent.passwordLabel}
        hint={acceptInvitationContent.passwordHint}
        error={errors.password?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register("password")}
            autoComplete="new-password"
            placeholder={acceptInvitationContent.passwordPlaceholder}
            icon={<Lock aria-hidden />}
          />
        )}
      </FormField>

      <FormField
        id="invite-confirm-password"
        label={acceptInvitationContent.confirmLabel}
        error={errors.confirmPassword?.message}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register("confirmPassword")}
            autoComplete="new-password"
            placeholder={acceptInvitationContent.confirmPlaceholder}
            icon={<Lock aria-hidden />}
          />
        )}
      </FormField>

      {formError ? <FieldError id="accept-invite-error">{formError}</FieldError> : null}

      <Button type="submit" disabled={isSubmitting}>
        {acceptInvitationContent.submit}
        <ArrowRight aria-hidden />
      </Button>

      <Link
        href={authRoutes.signIn}
        className="inline-flex items-center justify-center gap-1.5 rounded-sm text-body text-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {acceptInvitationContent.backToSignIn}
      </Link>
    </form>
  );
}
