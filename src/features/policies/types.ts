import type { AppIconName } from "@/components/icons/app-icon-definitions";

/**
 * Structural contracts for the Policy authoring catalogs (dropdown/selector
 * options sourced from the hand-authored Figma builder frames). These are
 * plain structural types, not zod-derived, per the coding standards: boundary
 * data (the fixture rows) is parsed with zod in `data.ts`, while these types
 * only describe the shape once parsed.
 */

/** One selectable option in a Policy authoring dropdown/list. */
export type PolicyCatalogOption = {
  value: string;
  label: string;
  description?: string;
  /** A short right-aligned category tag shown in multi-select rows (e.g. the
   * paste-target picker's "apps" / "web" / "session" / "local"). */
  category?: string;
};

/** An application entry in the Desktop channel's app picker, with its mark. */
export type ApplicationOption = PolicyCatalogOption & { icon: AppIconName };

/** Every option catalog the Policy authoring builder reads from. */
export type PolicyCatalogs = {
  audiences: readonly PolicyCatalogOption[];
  channels: readonly (PolicyCatalogOption & { icon: AppIconName })[];
  /** The finding detectors a CONTENT row can match on. */
  findings: readonly PolicyCatalogOption[];
  /** Minimum-confidence options for a finding row ("High confidence" /
   * "Medium or better" / "Any confidence"). */
  confidences: readonly PolicyCatalogOption[];
  /** Where a paste can land — the clipboard channel's "Paste into" targets,
   * each tagged with a `category` (apps / web / session / local). */
  pasteTargets: readonly PolicyCatalogOption[];
  /** Removable media "Device is" classes (Personal or unrecognised / Corporate
   * … / Any Device). */
  deviceClasses: readonly PolicyCatalogOption[];
  /** Removable media "Transfer is" directions (copy to / read off / any). */
  transfers: readonly PolicyCatalogOption[];
  /** Removable media "Registered as" registration lists (the multi-select). */
  removableTargets: readonly PolicyCatalogOption[];
  printerTargets: readonly PolicyCatalogOption[];
  applications: readonly ApplicationOption[];
  actions: readonly PolicyCatalogOption[];
  deployStates: readonly PolicyCatalogOption[];
};
