"use client";

import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { AppInput, AppSelect } from "@/components/app/field";
import { buttonVariants } from "@/components/ui/button";
import type { EvidenceTone, IncidentDetail } from "@/features/issues/data";
import { SeverityLabel } from "@/features/issues/components/severity";
import { SoftBadge, type BadgeTone } from "@/features/issues/components/soft-badge";
import { cn } from "@/lib/utils";

type Tab = "overview" | "evidence" | "trail";

const statusTone: Record<IncidentDetail["statusTone"], BadgeTone> = {
  green: "green",
  amber: "amber",
  neutral: "neutral",
};

const evidenceAccent: Record<EvidenceTone, string> = {
  neutral: "border-l-line-strong",
  amber: "border-l-badge-amber-line",
  blue: "border-l-badge-blue-line",
  green: "border-l-badge-green-line",
};

const DISPOSITIONS = [
  "False positive",
  "Confirmed — contained",
  "Confirmed — data left",
  "Business-approved exception",
];

/**
 * Incident case drawer (Figma severity side panels 597:*), opened as a right
 * drawer over the list. Open state lives in the URL (`?case=<id>`) so the
 * server fetches the case and the link is shareable; only the tabs, the
 * contain menu, the raw-log toggle and the resolve form are client state.
 */
export function IncidentDrawer({
  incident,
  closeHref,
  prevHref,
  nextHref,
}: {
  incident: IncidentDetail;
  closeHref: string;
  prevHref?: string;
  nextHref?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [rawLogOpen, setRawLogOpen] = useState(false);
  const [containOpen, setContainOpen] = useState(false);
  const [disposition, setDisposition] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "What happened & evidence", count: incident.evidence.length },
    { id: "trail", label: "Trail", count: incident.trail.length },
  ];

  return (
    <dialog
      ref={ref}
      aria-labelledby="case-drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        router.push(closeHref);
      }}
      className="m-0 ml-auto h-dvh max-h-dvh w-[calc(100vw-3rem)] max-w-[60rem] rounded-none border-0 bg-chrome p-0 text-strong backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-hair bg-surface px-8 py-4">
          <p className="text-app text-dim">
            Case <span className="ml-1 font-medium text-strong">{incident.id}</span>
          </p>
          <div className="flex items-center gap-2">
            <NavIconButton label="Previous incident" href={prevHref}>
              <ArrowUp aria-hidden className="size-4" />
            </NavIconButton>
            <NavIconButton label="Next incident" href={nextHref}>
              <ArrowDown aria-hidden className="size-4" />
            </NavIconButton>
            <Link href={closeHref} className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}>
              Close
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-center gap-3">
            <SeverityLabel severity={incident.severity} />
            <SoftBadge tone={statusTone[incident.statusTone]}>{incident.statusLabel}</SoftBadge>
          </div>

          <div className="mt-4 flex items-start justify-between gap-6">
            <h2 id="case-drawer-title" className="max-w-md text-page-title font-normal text-strong">
              {incident.policy}
            </h2>
            <div className="relative flex shrink-0 items-center gap-3">
              <button
                type="button"
                aria-expanded={containOpen}
                onClick={() => setContainOpen((open) => !open)}
                className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto", className: "gap-2" })}
              >
                Containment
                <ChevronDown aria-hidden className={cn("size-4 transition-transform", containOpen && "rotate-180")} />
              </button>
              <button type="button" className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}>
                Open lineage map
              </button>

              {containOpen ? (
                <div className="absolute right-0 top-full z-10 mt-2 w-80 overflow-hidden rounded-card border border-hair-strong bg-chrome shadow-dropdown">
                  <p className="border-b border-hair bg-surface px-4 py-2.5 text-meta text-dim">
                    Containment · logged to the trail
                  </p>
                  <ul>
                    {incident.containActions.map((action) => (
                      <li key={action.title}>
                        <button
                          type="button"
                          onClick={() => setContainOpen(false)}
                          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-hover"
                        >
                          <span className="min-w-0">
                            <span className="block text-app text-strong">{action.title}</span>
                            <span className="mt-0.5 block text-meta text-dim">{action.description}</span>
                          </span>
                          <SoftBadge tone="neutral" className="shrink-0">
                            {action.badge}
                          </SoftBadge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-app leading-relaxed text-copy">{incident.summary}</p>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-8 border-b border-hair">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={tab === item.id ? "page" : undefined}
                onClick={() => setTab(item.id)}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 pb-3 text-app transition-colors",
                  tab === item.id
                    ? "border-brand-accent font-medium text-strong"
                    : "border-transparent text-dim hover:text-strong",
                )}
              >
                {item.label}
                {item.count !== undefined ? <span className="text-meta text-subtle">{item.count}</span> : null}
              </button>
            ))}
          </div>

          <div className="py-6">
            {tab === "overview" ? (
              <OverviewTab incident={incident} rawLogOpen={rawLogOpen} onToggleRawLog={() => setRawLogOpen((v) => !v)} />
            ) : null}
            {tab === "evidence" ? <EvidenceTab incident={incident} /> : null}
            {tab === "trail" ? <TrailTab incident={incident} /> : null}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-hair bg-surface px-8 py-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="min-w-[12rem] flex-1">
              <span className="mb-1.5 block text-meta text-dim">Disposition</span>
              <AppSelect value={disposition} onChange={(event) => setDisposition(event.target.value)}>
                <option value="">Choose…</option>
                {DISPOSITIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </AppSelect>
            </label>
            <label className="min-w-[16rem] flex-[2]">
              <span className="mb-1.5 block text-meta text-dim">Reason for the audit log</span>
              <AppInput
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Cite the evidence you relied on."
              />
            </label>
            <button
              type="button"
              disabled={!disposition}
              onClick={() => router.push(closeHref)}
              className={buttonVariants({
                variant: "appPrimary",
                size: "app",
                width: "auto",
                className: "disabled:opacity-50",
              })}
            >
              Resolve incident
            </button>
          </div>
          <p className="mt-2 text-meta text-dim">
            {disposition ? "Ready to resolve." : "Pick a disposition first."}
          </p>
        </div>
      </div>
    </dialog>
  );
}

function NavIconButton({ label, href, children }: { label: string; href?: string; children: ReactNode }) {
  const className =
    "flex size-9 items-center justify-center rounded-app border border-hair-strong bg-chrome text-dim transition-colors hover:bg-hover disabled:opacity-40";
  if (!href) {
    return (
      <button type="button" aria-label={label} disabled className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

function OverviewTab({
  incident,
  rawLogOpen,
  onToggleRawLog,
}: {
  incident: IncidentDetail;
  rawLogOpen: boolean;
  onToggleRawLog: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="mb-2 text-meta text-dim">Case record</p>
        <div className="overflow-hidden rounded-card border border-hair-strong">
          {incident.caseRecord.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-[6rem_1fr] gap-4 px-5 py-4",
                index < incident.caseRecord.length - 1 && "border-b border-hair",
              )}
            >
              <span className="pt-0.5 text-micro font-semibold uppercase tracking-wide text-subtle">{row.label}</span>
              <span>
                <span className="block text-app font-medium text-strong">{row.value}</span>
                <span className="mt-0.5 block text-meta text-dim">{row.note}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-app">
            <span className="text-strong">Raw log</span>{" "}
            <span className="text-dim">Verbatim agent and gateway records.</span>
          </p>
          <button
            type="button"
            aria-expanded={rawLogOpen}
            onClick={onToggleRawLog}
            className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
          >
            {rawLogOpen ? "Hide" : "Show"}
          </button>
        </div>
        {rawLogOpen ? (
          <pre className="mt-3 overflow-x-auto rounded-card bg-strong px-5 py-4 text-fine leading-relaxed text-page">
            <code>{incident.rawLog.join("\n")}</code>
          </pre>
        ) : null}
      </section>
    </div>
  );
}

function EvidenceTab({ incident }: { incident: IncidentDetail }) {
  return (
    <div>
      <p className="mb-4 text-meta text-dim">{incident.evidenceDate}</p>
      <ol className="flex flex-col gap-3">
        {incident.evidence.map((event, index) => (
          <li
            key={`${event.time}-${index}`}
            className={cn("rounded-r-card border-l-2 bg-surface px-5 py-4", evidenceAccent[event.tone])}
          >
            <div className="grid grid-cols-[5.5rem_1fr] gap-4">
              <span className="pt-0.5 font-mono text-meta text-dim">{event.time}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-app font-medium text-strong">{event.title}</span>
                  {event.badge ? <SoftBadge tone={event.tone}>{event.badge}</SoftBadge> : null}
                </div>
                <p className="mt-1 text-meta text-dim">{event.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TrailTab({ incident }: { incident: IncidentDetail }) {
  return (
    <div>
      <p className="mb-4 text-meta text-dim">{incident.trailIntro}</p>
      <ol className="flex flex-col gap-5">
        {incident.trail.map((entry, index) => (
          <li key={index} className="grid grid-cols-[9rem_1fr] gap-4">
            <span className="font-mono text-meta text-dim">
              {entry.date} · {entry.time}
            </span>
            <span className="text-app text-strong">{entry.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
