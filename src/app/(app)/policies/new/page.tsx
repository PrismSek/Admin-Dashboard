import { ArrowRight, ArrowUp, ChevronDown, Plus, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppInput } from "@/components/app/field";
import { Button, buttonVariants } from "@/components/ui/button";
import { listPolicyChannels } from "@/features/policies/api";
import { DescriptionField } from "@/features/policies/components/description-field";
import { StepRail } from "@/features/policies/components/step-rail";
import { channelLabel } from "@/features/policies/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Create a policy" };

/**
 * Create-policy form. Rendered as one page with the seven-step rail beside it
 * (the design is a single scrollable form, not a paged wizard). The Channel
 * list is populated from the policy-channels API (`authorable` only — `Other`
 * is never authorable); the remaining controls stay presentational until the
 * rest of the policy API is wired.
 */
export default async function CreatePolicyPage() {
  const { authorable } = await listPolicyChannels();

  return (
    <div className="flex min-h-full">
      <aside className="hidden shrink-0 border-r border-hair-strong bg-chrome px-8 py-10 lg:block">
        <StepRail />
      </aside>

      <div className="min-w-0 flex-1 px-8 py-10 xl:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-page-title font-normal text-strong">Create a policy</h1>
              <p className="mt-2 max-w-xl text-meta text-dim">
                Applies to every device in the compiled scope — who it covers is decided upstream.
              </p>
            </div>
            <Button variant="appSecondary" size="app" width="auto" type="button">
              Bundle JSON
            </Button>
          </div>

          {/* Start — name */}
          <Field className="mt-8" label="Policy name">
            <AppInput defaultValue="Block Aadhaar to personal cloud" />
          </Field>
          <DescriptionField />

          {/* Who — audience */}
          <Field className="mt-6" label="Applies to">
            <div className="flex flex-wrap items-center gap-3">
              <NativeSelect className="w-72">
                <option>Finance — all staff</option>
                <option>Legal — all staff</option>
                <option>Engineering — all staff</option>
                <option>Everyone</option>
              </NativeSelect>
              <code className="text-meta text-subtle">scope_finance_broad</code>
            </div>
            <p className="mt-2 max-w-md text-meta text-dim">
              184 users · group-derived, refreshed hourly. Membership is resolved by the backend,
              not written into the rule.
            </p>
          </Field>

          {/* Where — channel */}
          <Field className="mt-6" label="Channel">
            <div className="flex flex-wrap items-center gap-3">
              <NativeSelect className="w-72" leading={<ArrowUp className="size-4 text-dim" />}>
                {authorable.map((id) => (
                  <option key={id} value={id}>
                    {channelLabel(id)}
                  </option>
                ))}
              </NativeSelect>
              <OutlinePill>Enforced today</OutlinePill>
              <span className="text-meta text-subtle">One channel per policy</span>
            </div>
          </Field>

          <Divider />

          {/* Data — conditions */}
          <SectionLabel
            title="Conditions"
            help="What has to be true for this policy to fire. Name the content, or make it a blind rule that ignores content entirely."
          />
          <BuilderCard>
            <div className="flex flex-wrap items-center gap-3">
              <Chip>CONTENT</Chip>
              <Segmented options={["Matches conditions", "Any content"]} />
              <span className="text-meta text-subtle">1/32</span>
            </div>

            <Connector>
              <FieldTag>Finding</FieldTag>
              <ValueBox>Aadhaar number</ValueBox>
              <ValueBox>High confidence</ValueBox>
              <IconChip label="Remove finding">
                <X className="size-3.5" />
              </IconChip>
              <IconChip label="Add finding" tone="brand">
                <Plus className="size-3.5" />
              </IconChip>
            </Connector>

            <Chip className="mt-6">DESTINATION</Chip>
            <Connector>
              <FieldTag>Class is</FieldTag>
              <ValueBox>Personal or foreign</ValueBox>
            </Connector>
            <Hint>Whose account the data is going to — ownership, not identity of the site.</Hint>

            <Connector>
              <FieldTag>Collection is</FieldTag>
              <FieldTag>one of</FieldTag>
              <NativeSelect className="w-44">
                <option>any collection</option>
                <option>Corporate sanctioned</option>
                <option>Personal cloud storage</option>
                <option>Generative AI</option>
              </NativeSelect>
              <Link
                href="/manage/domains"
                className="inline-flex items-center gap-1 text-meta font-medium text-brand hover:text-brand-hover"
              >
                Manage <ArrowRight className="size-3.5" />
              </Link>
            </Connector>
            <Hint>Left on &quot;any collection&quot; the rule matches on ownership alone.</Hint>
          </BuilderCard>

          <p className="mt-4 max-w-2xl text-meta text-dim">
            Reads as — When data leaves through the browser to a personal or foreign destination and
            contains Aadhaar numbers block it. If we can&apos;t tell, not decided yet.
          </p>

          <Divider />

          {/* Enforcement & Message */}
          <SectionLabel
            title="Enforcement"
            help="What happens when the conditions above are met — and what happens when we can't tell."
          />
          <BuilderCard>
            <Chip>ACTION</Chip>
            <Connector>
              <FieldTag>Do this</FieldTag>
              <ValueBox>Block</ValueBox>
            </Connector>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Chip>IF WE CAN&apos;T TELL</Chip>
              <OutlinePill>REQUIRED</OutlinePill>
            </div>
            <Connector>
              <FieldTag>Do this instead</FieldTag>
              <NativeSelect className="w-56">
                <option>Choose one…</option>
                <option>Allow</option>
                <option>Warn &amp; justify</option>
                <option>Block</option>
              </NativeSelect>
            </Connector>

            <Chip className="mt-6">MESSAGE</Chip>
            <Connector>
              <FieldTag>Reason code</FieldTag>
              <ValueBox>DLP-PII-EGRESS</ValueBox>
            </Connector>
            <Connector>
              <FieldTag>They see</FieldTag>
              <ValueBox className="max-w-lg flex-1">
                Aadhaar information cannot be uploaded to this destination.
              </ValueBox>
            </Connector>
          </BuilderCard>

          <Divider />

          {/* Finish */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <label className="flex items-center gap-3 text-meta text-dim">
              Deploy as:
              <NativeSelect className="w-32">
                <option>Draft</option>
                <option>Simulation</option>
                <option>Enforced</option>
              </NativeSelect>
            </label>
            <div className="flex items-center gap-3">
              <Link
                href="/policies"
                className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
              >
                Cancel
              </Link>
              <Button variant="appPrimary" size="app" width="auto" type="button" disabled>
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- local presentational pieces ---------------------------------------- */

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-meta font-medium text-label">{label}</p>
      {children}
    </div>
  );
}

function SectionLabel({ title, help }: { title: string; help: string }) {
  return (
    <div className="mt-8">
      <h2 className="text-section font-medium text-strong">{title}</h2>
      <p className="mt-1 max-w-2xl text-meta text-dim">{help}</p>
    </div>
  );
}

function BuilderCard({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-card border border-hair-strong bg-chrome p-6">{children}</div>
  );
}

function Divider() {
  return <hr className="mt-8 border-hair" />;
}

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-app bg-hair px-2 py-1 text-micro font-medium tracking-wide text-dim uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A sub-row with a small corner connector on the left, as drawn in the design. */
function Connector({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 flex items-center gap-2 pl-3">
      <span
        aria-hidden
        className="mb-1.5 size-3 shrink-0 rounded-bl-[3px] border-b border-l border-hair-strong"
      />
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function FieldTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-app bg-hair px-2.5 py-1.5 text-meta text-copy">
      {children}
    </span>
  );
}

function ValueBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-app border border-hair-strong bg-chrome px-3 py-1.5 text-meta text-strong",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-2 pl-3 text-meta text-dim">{children}</p>;
}

function OutlinePill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-app border border-brand/50 bg-brand-halo px-2.5 py-1 text-micro font-medium text-brand">
      {children}
    </span>
  );
}

function IconChip({
  children,
  label,
  tone = "muted",
}: {
  children: ReactNode;
  label: string;
  tone?: "muted" | "brand";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-app border transition-colors",
        tone === "brand"
          ? "border-brand text-brand hover:bg-brand-halo"
          : "border-hair-strong text-dim hover:bg-hover",
      )}
    >
      {children}
    </button>
  );
}

function Segmented({ options }: { options: [string, string] }) {
  return (
    <div className="inline-flex rounded-app border border-hair-strong bg-chrome p-0.5">
      {options.map((option, index) => (
        <span
          key={option}
          className={cn(
            "rounded-[4px] px-3 py-1 text-meta transition-colors",
            index === 0 ? "bg-brand-accent font-medium text-brand-fg" : "text-copy",
          )}
        >
          {option}
        </span>
      ))}
    </div>
  );
}

function NativeSelect({
  children,
  className,
  leading,
}: {
  children: ReactNode;
  className?: string;
  leading?: ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      {leading ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {leading}
        </span>
      ) : null}
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-app border border-hair-strong bg-chrome py-0 pr-9 text-app text-strong outline-none focus:border-brand-accent",
          leading ? "pl-9" : "pl-3.5",
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-dim"
      />
    </div>
  );
}
