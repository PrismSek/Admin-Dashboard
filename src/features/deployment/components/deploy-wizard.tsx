"use client";

import { Rocket } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

// Static wizard content lives here rather than in the server-only data module,
// so this Client Component can import it (Figma steps 2069:12702 / 2025:6644).
type WizardOption = { id: string; title: string; description: string; recommended?: boolean };

const DEPLOY_METHODS: WizardOption[] = [
  { id: "self-install", title: "Send a self-install link", description: "Each person opens their own link and approves one Windows prompt. No MDM needed.", recommended: true },
  { id: "intune", title: "Microsoft Intune", description: "Silent install on enrolled Windows devices. We generate the .intunewin package." },
  { id: "google-workspace", title: "Google Workspace", description: "Force-install the PrismSek extension on every managed Chrome browser." },
];

const RECIPIENT_OPTIONS: WizardOption[] = [
  { id: "all", title: "All 50 employees", description: "Everyone in the Northwind directory. Finance · HR · Sales · Engineering." },
  { id: "department", title: "By department", description: "Pick one or more departments from your directory." },
  { id: "individual", title: "Individual people", description: "Search and select named employees." },
  { id: "import", title: "Import a list", description: "Upload a CSV of work email addresses." },
];

/**
 * "Deploy Agent" launch wizard (Figma steps 2069:12702 / 2025:6644 / 2025:7102).
 * A 3-step modal: choose install method → choose recipients → review & launch.
 * Trigger + modal are one client island; step and selections are local state,
 * reset each time the modal opens.
 */
export function DeployWizard() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<string>(DEPLOY_METHODS[0].id);
  const [recipients, setRecipients] = useState<string>(RECIPIENT_OPTIONS[0].id);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function start() {
    setStep(1);
    setMethod(DEPLOY_METHODS[0].id);
    setRecipients(RECIPIENT_OPTIONS[0].id);
    setOpen(true);
  }

  return (
    <>
      <button type="button" onClick={start} className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto", className: "gap-2" })}>
        <Rocket aria-hidden className="size-4" />
        Deploy Agent
      </button>

      <dialog
        ref={ref}
        aria-labelledby="deploy-wizard-title"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        className="m-auto w-[calc(100vw-2rem)] max-w-[37.5rem] rounded-panel border-0 bg-chrome p-0 text-strong backdrop:bg-black/40"
      >
        {open ? (
          <div className="flex flex-col">
            <div className="px-6 pt-6">
              <p className="text-micro font-semibold uppercase tracking-wide text-brand">Step {step} of 3</p>
              <h2 id="deploy-wizard-title" className="mt-2 text-app-heading font-medium text-strong">
                {step === 1 ? "How do you want to deploy?" : step === 2 ? "Who gets an invitation?" : "Review and launch"}
              </h2>
              <p className="mt-1.5 text-meta text-subtle-alt">
                {step === 1
                  ? "PrismSek installs the same agent either way — this only changes who runs it."
                  : step === 2
                    ? "Each person opens their own link and installs PrismSek on their Windows device."
                    : "Confirm the campaign before it goes out."}
              </p>
            </div>

            <div className="flex flex-col gap-3 px-6 py-5">
              {step === 1
                ? DEPLOY_METHODS.map((option) => (
                    <RadioCard
                      key={option.id}
                      selected={method === option.id}
                      onSelect={() => setMethod(option.id)}
                      title={option.title}
                      description={option.description}
                      badge={option.recommended ? "Recommended" : undefined}
                    />
                  ))
                : null}

              {step === 2
                ? RECIPIENT_OPTIONS.map((option) => (
                    <RadioCard
                      key={option.id}
                      selected={recipients === option.id}
                      onSelect={() => setRecipients(option.id)}
                      title={option.title}
                      description={option.description}
                    />
                  ))
                : null}

              {step === 3 ? <ReviewStep /> : null}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-hair px-6 py-4">
              <button
                type="button"
                onClick={() => (step === 1 ? setOpen(false) : setStep((step - 1) as Step))}
                className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>
              {step === 2 ? <p className="ml-auto mr-2 text-meta text-subtle">50 recipients selected</p> : null}
              <button
                type="button"
                onClick={() => (step === 3 ? setOpen(false) : setStep((step + 1) as Step))}
                className={cn(buttonVariants({ variant: "appPrimary", size: "app", width: "auto" }), step === 2 ? "" : "ml-auto")}
              >
                {step === 3 ? "Launch deployment" : "Continue"}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function RadioCard({
  selected,
  onSelect,
  title,
  description,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-card border p-4 text-left transition-colors",
        selected ? "border-brand bg-brand-halo" : "border-hair-strong hover:bg-hover",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-brand" : "border-line-strong",
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-brand" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-app font-medium text-strong">{title}</span>
          {badge ? (
            <span className="rounded-sm border border-badge-green-line bg-badge-green-bg px-1.5 py-0.5 text-fine font-medium text-badge-green-fg">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-meta text-subtle">{description}</span>
      </span>
    </button>
  );
}

function ReviewStep() {
  const rows = [
    { label: "Campaign name", value: "Windows agent rollout" },
    { label: "Recipients", value: "50 employees" },
    { label: "Link expires", value: "In 7 days" },
    { label: "IT contact", value: "it-help@northwind.com" },
  ];
  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 border-b border-hair py-3">
          <span className="text-app text-subtle-alt">{row.label}</span>
          <span className="text-app font-medium text-strong">{row.value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 py-3">
        <span className="text-app text-subtle-alt">Browser protection</span>
        <span className="flex items-center gap-3 text-app">
          <span className="text-pill-warn-fg">Chrome</span>
          <span className="text-pill-warn-fg">Edge</span>
          <span className="text-copy">Firefox</span>
        </span>
      </div>
      <p className="mt-2 text-meta text-subtle">
        Each employee opens their own link and approves the installation once.
      </p>
    </div>
  );
}
