import { Eye, ShieldCheck, ShieldX } from "lucide-react";

import { dispositionLabel, type Disposition } from "@/features/manage/disposition";
import { cn } from "@/lib/utils";

const marks: Record<Disposition, { Icon: typeof ShieldCheck; className: string }> = {
  allowed: { Icon: ShieldCheck, className: "text-allow" },
  blocked: { Icon: ShieldX, className: "text-block" },
  monitored: { Icon: Eye, className: "text-monitor" },
};

/** Coloured shield/eye icon + dark label, as used in the Domains/Applications tables. */
export function DispositionCell({ value }: { value: Disposition }) {
  const { Icon, className } = marks[value];
  return (
    <span className="inline-flex items-center gap-2 text-app text-strong">
      <Icon aria-hidden className={cn("size-4 shrink-0", className)} />
      {dispositionLabel[value]}
    </span>
  );
}
