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
};

/** An application entry in the Desktop channel's app picker, with its mark. */
export type ApplicationOption = PolicyCatalogOption & { icon: AppIconName };

/** Every option catalog the Policy authoring builder reads from. */
export type PolicyCatalogs = {
  audiences: readonly PolicyCatalogOption[];
  channels: readonly (PolicyCatalogOption & { icon: AppIconName })[];
  findings: readonly PolicyCatalogOption[];
  destinationClasses: readonly PolicyCatalogOption[];
  collections: readonly PolicyCatalogOption[];
  removableTargets: readonly PolicyCatalogOption[];
  printerTargets: readonly PolicyCatalogOption[];
  applications: readonly ApplicationOption[];
  actions: readonly PolicyCatalogOption[];
  deployStates: readonly PolicyCatalogOption[];
};
