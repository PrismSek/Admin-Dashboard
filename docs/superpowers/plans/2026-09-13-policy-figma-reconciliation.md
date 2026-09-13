# Policy Figma Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the signed-in shell, Policy list, and Policy authoring flow to match the current Figma Policy frames exactly, using tokenized styling and SVG-only visual assets.

**Architecture:** Keep route files as async Server Components that parse URL state and load server-only Figma fixtures. Put interactivity in focused client components under `src/features/policies/components`, with React Hook Form and one Zod contract driving validation and JSON serialization. Establish the Figma shell and icon system as shared foundations so the remaining screen families can reuse them without importing Policy code.

**Tech Stack:** Next.js 16.3 App Router, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4.3.3, React Hook Form 7.85.0, Zod 4.4.3, TanStack Table 9.1.2, Vitest 4.1.10, React Testing Library, jest-axe, and Playwright 1.62.1.

**Spec:** `docs/superpowers/specs/2026-09-13-policy-figma-reconciliation-design.md`

## Global Constraints

- Read `docs/CODING_STANDARDS.md`, `docs/FIGMA-DEVIATIONS.md`, and the relevant guides in `node_modules/next/dist/docs/01-app/` before implementation.
- The exact runtime is Node 24.17.0; use pnpm, not npm or yarn.
- Keep `next` at 16.3.0, React at 19.2.8, TypeScript at 6.0.3, and ESLint at 9.39.5.
- This repository is frontend-only; no browser code receives a credential or calls the PrismSek API directly.
- Route pages stay thin. Business markup and behavior live in feature components and pure feature modules.
- Every color, radius, font size, line height, tracking value, control height, and recurring spacing value is a semantic token in `src/app/globals.css`.
- Touched components contain no hex colors, arbitrary Tailwind dimensions, or one-off radius values.
- Policy copy, labels, fixture strings, and routes live in feature-owned content/data modules, not inline in route or component files.
- All introduced icons, marks, illustrations, and decorative assets are SVG. Do not add PNG, JPEG, WebP, canvas artwork, icon fonts, emoji icons, or approximate Lucide glyphs.
- Figma frame `Policies` (`398:16105`) at `1440 × 957` is the desktop list reference; the named Policy builder frames in the spec define authoring states.
- Figma values already verified: 256px sidebar, `#0F090C` sidebar, 48px content header, `#F5F6F8` canvas, `#111827` primary ink, `#E04F27` brand action, 24px horizontal content padding, 26px/32px vertical content padding, and the type/stroke values in spec §4.
- IBM Plex Sans remains self-hosted through `next/font`; do not add a network font request.
- Unknown URL values normalize to defaults. Search/filter changes reset pagination to page one.
- The Policy list defaults to 20 rows per page.
- Policy authoring uses React Hook Form plus `zodResolver`; the same Zod schema validates and serializes values.
- Hidden channel fields retain their form values but do not enter serialized JSON for another channel.
- The UI must state that the locally validated policy is not persisted until a backend contract exists.
- Target WCAG 2.2 AA, visible focus, full keyboard operation, focus restoration, live-region announcements, and reduced-motion support.
- Follow red-green-refactor and make the conventional commit listed at the end of each task.
- Completion requires fresh successful runs of focused tests, `pnpm test:e2e`, and `pnpm verify`.

---

## File Responsibility Map

### Shared shell and vectors

- `src/app/globals.css` — raw Figma palette values, semantic shell/Policy tokens, type ramp, dimensions, and reusable focus/motion rules.
- `src/components/icons/AppIcon.tsx` — one inline-SVG renderer for the exact exported Figma vector definitions.
- `src/components/icons/app-icon-definitions.ts` — immutable `viewBox` and path/shape definitions; no React component.
- `src/components/icons/AppIcon.test.tsx` — accessible and decorative SVG behavior.
- `src/features/app-shell/content.ts` — shell labels, utility labels, and route strings.
- `src/features/app-shell/nav.ts` — flat navigation metadata using `AppIconName` instead of icon components.
- `src/features/app-shell/components/AppShell.tsx` — two-column signed-in frame.
- `src/features/app-shell/components/SideNav.tsx` — pathname-aware desktop/mobile navigation.
- `src/features/app-shell/components/CurrentUserSummary.tsx` — Figma identity block.
- `src/features/app-shell/components/ContentHeader.tsx` — content-only 48px header with logo and utilities.
- `src/features/app-shell/components/SideNav.test.tsx` — active state and accessible navigation checks.
- `src/features/app-shell/components/SignOutButton.tsx` — logout request behavior with the Figma SVG row presentation.
- `src/app/(app)/layout.tsx` — thin shell composition.
- Remove obsolete `src/features/app-shell/components/side-nav.tsx` and `src/features/app-shell/components/top-bar.tsx` after their replacements are wired.

### Policy list

- `src/features/policies/content.ts` — all Policy labels, empty/error copy, route constants, and authoring copy.
- `src/features/policies/data.ts` — server-only, schema-parsed 20-row Figma fixture and selector catalogs.
- `src/features/policies/types.ts` — structural selector-catalog contracts shared by server and client modules.
- `src/features/policies/list-state.ts` — URL parsing, canonicalization, filtering, counts, and pagination.
- `src/features/policies/list-state.test.ts` — exhaustive list-state unit tests.
- `src/features/policies/components/PolicyList.tsx` — list-screen composition.
- `src/features/policies/components/PolicyTabs.tsx` — URL-backed All/Draft/Off tabs.
- `src/features/policies/components/PolicyToolbar.tsx` — refresh, delete, export, search, and New policy controls.
- `src/features/policies/components/PolicyTable.tsx` — TanStack table instance and semantic markup.
- `src/features/policies/components/policy-columns.tsx` — six typed TanStack column definitions.
- `src/features/policies/components/PolicyListRow.tsx` — one accessible row.
- `src/features/policies/components/PolicyCells.tsx` — lifecycle and deployment-health cells.
- `src/features/policies/components/PolicyListSkeleton.tsx` — table-shaped route loading state.
- `src/features/policies/components/PolicyListEmpty.tsx` — no-results state with recovery action.
- `src/features/policies/components/PolicyListError.tsx` — retryable, correlation-safe error presentation.
- `src/features/policies/components/PolicyList.test.tsx` — list semantics, controls, empty state, and axe checks.
- `src/app/(app)/policies/page.tsx` — parse async `searchParams`, load fixtures, and render `PolicyList`.
- `src/app/(app)/policies/loading.tsx` — render `PolicyListSkeleton`.
- `src/app/(app)/policies/error.tsx` — render `PolicyListError` as a Client Component.

### Policy authoring

- `src/features/policies/schemas.ts` — retain gateway schemas and add the complete authoring schema/types.
- `src/features/policies/authoring-defaults.ts` — typed initial form values assembled from Figma content/catalog IDs.
- `src/features/policies/serialize-policy.ts` — convert validated authoring values to a channel-discriminated preview payload.
- `src/features/policies/serialize-policy.test.ts` — schema and serialization matrix.
- `src/features/policies/components/PolicySelect.tsx` — accessible Figma-matched single-select/listbox.
- `src/features/policies/components/PolicySelect.test.tsx` — keyboard, focus, Escape, and selection tests.
- `src/features/policies/components/PolicyBuilder.tsx` — form provider, dirty-state orchestration, validation, and local completion outcome.
- `src/features/policies/components/PolicyStepRail.tsx` — seven-step rail driven by form-section IDs.
- `src/features/policies/components/PolicyStartStep.tsx` — name and description.
- `src/features/policies/components/PolicyWhoStep.tsx` — Applies to selector and scope summary.
- `src/features/policies/components/PolicyWhereStep.tsx` — Clipboard, Removable media, Print, and Desktop Apps selection.
- `src/features/policies/components/PolicyDataStep.tsx` — dispatch to channel-specific condition editors.
- `src/features/policies/components/ClipboardConditions.tsx` — content/finding/destination/collection controls.
- `src/features/policies/components/RemovableMediaConditions.tsx` — removable-device target and exception controls.
- `src/features/policies/components/PrintConditions.tsx` — printer/target/exception controls.
- `src/features/policies/components/DesktopAppConditions.tsx` — app target and exception controls.
- `src/features/policies/components/ApplicationSelect.tsx` — accessible SVG-logo multi-select.
- `src/features/policies/components/PolicyEnforcementStep.tsx` — action, required fallback, reason code, and message.
- `src/features/policies/components/PolicyNotificationStep.tsx` — end-user notification controls.
- `src/features/policies/components/PolicyFinishStep.tsx` — JSON preview and Draft/Active/Off deploy state.
- `src/features/policies/components/PolicyJsonPreview.tsx` — focus-managed review dialog.
- `src/features/policies/components/UnsavedChangesGuard.tsx` — browser-leave and in-app cancel warning.
- `src/features/policies/components/PolicyBuilder.test.tsx` — complete interactive authoring journey and axe checks.
- `src/app/(app)/policies/new/page.tsx` — thin server route loading catalogs and rendering `PolicyBuilder`.

### Verification and documentation

- `playwright.config.ts` — local Next test server and desktop/mobile projects.
- `e2e/authenticated-page.ts` — valid test session cookie helper.
- `e2e/policy-list.spec.ts` — route, URL, geometry, computed-style, and list behavior checks.
- `e2e/policy-builder.spec.ts` — all builder state families and keyboard journey.
- `docs/FIGMA-DEVIATIONS.md` — current Figma source, new shell, SVG-only decision, responsive/accessibility differences, and local-only Policy outcome.
- `src/features/endpoints/data.ts` — remove the pre-existing unused `_id` lint warning before calling verification warning-free.

---

### Task 1: Establish component-test support, Figma tokens, and the SVG icon contract

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `vitest.config.mts`
- Modify: `src/app/globals.css`
- Create: `src/test/setup.ts`
- Create: `src/components/icons/app-icon-definitions.ts`
- Create: `src/components/icons/AppIcon.tsx`
- Create: `src/components/icons/AppIcon.test.tsx`

**Interfaces:**
- Consumes: exact vector exports from the open Figma file and the token values in spec §4.
- Produces: `AppIconName`, `AppIcon({ name, label?, className? })`, jsdom component testing, and semantic utilities used by every later task.

- [ ] **Step 1: Add exact component-test dependencies and setup**

Run:

```bash
pnpm add --save-exact @tanstack/react-table@9.1.2
pnpm add -D --save-exact @testing-library/dom@10.4.1 @testing-library/react@16.3.3 @testing-library/user-event@14.6.7 @testing-library/jest-dom@7.0.1 jest-axe@11.0.0 @types/jest-axe@3.5.9 jsdom@30.0.1
```

Add `setupFiles: ["./src/test/setup.ts"]` under the existing Vitest `test` configuration and create:

```ts
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

- [ ] **Step 2: Write the failing icon behavior test**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { AppIcon } from "@/components/icons/AppIcon";

describe("AppIcon", () => {
  it("hides a decorative vector from assistive technology", () => {
    const { container } = render(<AppIcon name="policy" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an informative vector by its supplied label", async () => {
    const { container } = render(<AppIcon name="notification" label="Notifications" />);
    expect(screen.getByRole("img", { name: "Notifications" })).toBeVisible();
    expect((await axe(container)).violations).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test and confirm the missing module failure**

Run: `pnpm vitest run src/components/icons/AppIcon.test.tsx`

Expected: FAIL because `@/components/icons/AppIcon` does not exist.

- [ ] **Step 4: Add the exact shared Figma tokens**

Add raw values once and map them to semantic roles. Preserve auth tokens and replace the obsolete signed-in nav semantics rather than changing unrelated auth styling.

```css
:root {
  --ps-policy-nav: #0f090c;
  --ps-policy-canvas: #f5f6f8;
  --ps-policy-ink: #111827;
  --ps-policy-table-border: #e2e5ea;
  --ps-policy-table-head: #fcfcfd;
  --ps-policy-table-head-border: #e8ebf0;

  --color-nav-bg: var(--ps-policy-nav);
  --color-canvas: var(--ps-policy-canvas);
  --color-strong: var(--ps-policy-ink);
  --color-policy-table-border: var(--ps-policy-table-border);
  --color-policy-table-head: var(--ps-policy-table-head);
  --color-policy-table-head-border: var(--ps-policy-table-head-border);

  --size-app-sidebar: 16rem;
  --size-app-header: 3rem;
  --space-app-inline: 1.5rem;
  --space-app-block-start: 1.625rem;
  --space-app-block-end: 2rem;
}

@theme inline {
  --color-policy-table-border: var(--color-policy-table-border);
  --color-policy-table-head: var(--color-policy-table-head);
  --color-policy-table-head-border: var(--color-policy-table-head-border);
  --spacing-app-sidebar: var(--size-app-sidebar);
  --spacing-app-header: var(--size-app-header);
  --spacing-app-inline: var(--space-app-inline);
  --spacing-app-block-start: var(--space-app-block-start);
  --spacing-app-block-end: var(--space-app-block-end);
  --text-policy-table-head: 0.75rem;
  --text-policy-table-head--line-height: 1rem;
  --text-policy-table-body: 0.8125rem;
  --text-policy-table-body--line-height: 1.0625rem;
  --tracking-policy-table-head: 0.0225rem;
}

@utility app-shell-grid {
  grid-template-columns: var(--size-app-sidebar) minmax(0, 1fr);
}
```

For each additional measurement used in a touched component, select its Figma layer, copy the inspector value, and add a role-named token before using it. Do not encode that measurement as an arbitrary class.

- [ ] **Step 5: Export and implement the exact inline SVG definition set**

Export the vector geometry from the visible Figma layers for these names and normalize only their coordinate systems: `dashboard`, `issues`, `policy`, `manage`, `settings`, `help`, `logout`, `search`, `notification`, `chevron-down`, `chevron-left`, `chevron-right`, `refresh`, `delete`, `export`, `plus`, `close`, `check`, `minus`, `info`, `clipboard`, `removable-media`, `print`, `desktop-apps`, and every application mark visible in the Desktop Apps selector.

Use this public contract:

```ts
export const APP_ICON_NAMES = [
  "dashboard",
  "issues",
  "policy",
  "manage",
  "settings",
  "help",
  "logout",
  "search",
  "notification",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "refresh",
  "delete",
  "export",
  "plus",
  "close",
  "check",
  "minus",
  "info",
  "clipboard",
  "removable-media",
  "print",
  "desktop-apps",
] as const;

export type AppIconName = (typeof APP_ICON_NAMES)[number];
export type AppIconDefinition = {
  viewBox: string;
  body: readonly AppIconShape[];
};
export type AppIconShape =
  | { kind: "path"; d: string; fill?: string; fillRule?: "evenodd"; clipRule?: "evenodd" }
  | { kind: "circle"; cx: number; cy: number; r: number; fill?: string };
```

Append the exact application mark names found in `Desktop channel apps selection` to `APP_ICON_NAMES` in the same export operation, using the `application-<figma-name-slug>` naming pattern. That makes those marks part of the same exhaustive `AppIconName` union rather than untyped string assets.

`AppIcon` must use `currentColor` when a shape has no explicit fill, preserve official fills only for third-party application marks, pass through `className`, use `role="img"` and `aria-label` only when `label` exists, and otherwise use `aria-hidden="true"`.

- [ ] **Step 6: Run focused tests and static asset checks**

Run:

```bash
pnpm vitest run src/components/icons/AppIcon.test.tsx
rg -n "\\.(png|jpe?g|webp)|lucide-react" src/components/icons
```

Expected: the test passes and the search prints no match.

- [ ] **Step 7: Commit the foundation**

```bash
git add package.json pnpm-lock.yaml vitest.config.mts src/test/setup.ts src/app/globals.css src/components/icons
git commit -m "feat(ui): add Figma tokens and SVG icon system"
```

---

### Task 2: Rebuild the shared signed-in shell

**Files:**
- Create: `src/features/app-shell/content.ts`
- Modify: `src/features/app-shell/nav.ts`
- Create: `src/features/app-shell/components/AppShell.tsx`
- Create: `src/features/app-shell/components/SideNav.tsx`
- Create: `src/features/app-shell/components/CurrentUserSummary.tsx`
- Create: `src/features/app-shell/components/ContentHeader.tsx`
- Create: `src/features/app-shell/components/SideNav.test.tsx`
- Create: `src/features/app-shell/components/SignOutButton.tsx`
- Modify: `src/app/(app)/layout.tsx`
- Delete: `src/features/app-shell/components/side-nav.tsx`
- Delete: `src/features/app-shell/components/top-bar.tsx`
- Delete: `src/features/app-shell/components/sign-out-button.tsx`

**Interfaces:**
- Consumes: `AppIconName`, `AppIcon`, semantic shell tokens, `CurrentUser`, and `SignOutButton`.
- Produces: `AppShell({ user, children })`, a flat `appNavigation` array, and the 256px/48px Figma shell used by every signed-in route.

- [ ] **Step 1: Write the failing navigation tests**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { vi } from "vitest";

import { SideNav } from "@/features/app-shell/components/SideNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/policies" }));

it("marks Policies active in the flat Figma navigation", async () => {
  const { container } = render(
    <SideNav user={{ name: "Jae Sanders", email: "jae@example.com", initials: "JS", role: "Org Owner" }} />,
  );
  expect(screen.getByRole("link", { name: "Policies" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByText("Dashboard")).toBeVisible();
  expect(screen.getByText("Issues")).toBeVisible();
  expect(screen.queryByText("OVERVIEW")).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});
```

- [ ] **Step 2: Run the test and confirm the replacement component is missing**

Run: `pnpm vitest run src/features/app-shell/components/SideNav.test.tsx`

Expected: FAIL because the PascalCase replacement module does not exist.

- [ ] **Step 3: Move all shell copy and routes into one content module**

```ts
export const appShellContent = {
  mainNavLabel: "Main",
  dashboard: "Dashboard",
  issues: "Issues",
  policies: "Policies",
  manage: "Manage",
  settings: "Settings",
  helpCentre: "Help Centre",
  logOut: "Log out",
  search: "Search",
  notifications: "Notifications",
} as const;

export const appShellRoutes = {
  dashboard: "/",
  issues: "/issues",
  policies: "/policies",
  manage: "/manage",
  settings: "/settings",
  helpCentre: "/help",
} as const;
```

Update `nav.ts` so its primary export has this shape and no Lucide type:

```ts
export type AppNavItem = {
  label: string;
  href: string;
  icon: AppIconName;
};

export const appNavigation: readonly AppNavItem[] = [
  { label: appShellContent.dashboard, href: appShellRoutes.dashboard, icon: "dashboard" },
  { label: appShellContent.issues, href: appShellRoutes.issues, icon: "issues" },
  { label: appShellContent.policies, href: appShellRoutes.policies, icon: "policy" },
  { label: appShellContent.manage, href: appShellRoutes.manage, icon: "manage" },
  { label: appShellContent.settings, href: appShellRoutes.settings, icon: "settings" },
] as const;
```

Keep `departments` and `settingsNav` exports intact for existing routes, but remove `navSections` after all imports are migrated.

- [ ] **Step 4: Implement the four focused shell components**

`AppShell` owns only geometry:

```tsx
"use client";

export function AppShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <div className="app-shell-grid grid h-dvh bg-canvas max-lg:grid-cols-1">
      <SideNav user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className="flex min-w-0 flex-col">
        <ContentHeader onOpenNavigation={() => setIsNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

`SideNav` renders identity first, the flat navigation list second, and Help Centre/Log out at the bottom. Use `isWithin(href, pathname)` for active state, `aria-current="page"`, and the exact Figma active background/stroke tokens. `CurrentUserSummary` renders initials, name, and role from `CurrentUser`. `ContentHeader` renders the existing PrismSek SVG lockup plus the exact utility `AppIcon` buttons inside the content column only. Update `SignOutButton` to use `AppIcon name="logout"`, move its accessible label to `appShellContent`, and replace its arbitrary SVG size with the icon-size token. Below the desktop breakpoint, the header exposes an SVG-labeled menu button, the nav becomes an `aria-modal` overlay, Escape/backdrop/link activation closes it, and closing restores focus to the menu button.

- [ ] **Step 5: Wire the server layout and remove obsolete shell files**

```tsx
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return <AppShell user={user}>{children}</AppShell>;
}
```

Delete the old grouped-nav and full-width top-bar components only after `rg` confirms no imports remain.

- [ ] **Step 6: Run shell tests and verify no old icon dependency remains in the touched shell**

Run:

```bash
pnpm vitest run src/features/app-shell/components/SideNav.test.tsx src/components/icons/AppIcon.test.tsx
rg -n "lucide-react|px-\[|rounded-\[|#[0-9a-fA-F]{3,8}" src/features/app-shell src/app/'(app)'/layout.tsx
```

Expected: tests pass and the search prints no match.

- [ ] **Step 7: Commit the shell**

```bash
git add src/app/'(app)'/layout.tsx src/features/app-shell src/components/icons src/app/globals.css
git commit -m "feat(shell): match the signed-in Figma shell"
```

---

### Task 3: Define Policy copy, exact fixtures, and list URL state

**Files:**
- Create: `src/features/policies/content.ts`
- Create: `src/features/policies/data.ts`
- Create: `src/features/policies/types.ts`
- Create: `src/features/policies/list-state.ts`
- Create: `src/features/policies/list-state.test.ts`
- Modify: `src/features/policies/labels.ts`
- Modify: `src/features/policies/schemas.ts`
- Modify: `src/features/policies/api.ts`
- Modify: `src/features/policies/api.test.ts`

**Interfaces:**
- Consumes: `PolicyListItem`, Figma's 20 visible rows, and Zod boundary parsing.
- Produces: `POLICY_PAGE_SIZE`, `PolicyListState`, `parsePolicyListState`, `policyListHref`, `selectPolicyRows`, `getPolicyFixtures`, `getPolicyCatalogs`, and `PolicyCatalogs`.

- [ ] **Step 1: Write failing list-state tests**

```ts
import { describe, expect, it } from "vitest";

import {
  parsePolicyListState,
  policyListHref,
  selectPolicyRows,
} from "@/features/policies/list-state";

describe("Policy list URL state", () => {
  it("normalizes unknown values and omits canonical defaults", () => {
    expect(parsePolicyListState({ tab: "bad", page: "-8", q: "  Cloud  " })).toEqual({
      tab: "all",
      page: 1,
      query: "Cloud",
    });
    expect(policyListHref({ tab: "all", page: 1, query: "" })).toBe("/policies");
  });

  it("filters case-insensitively and pages twenty rows", () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      id: `p${index}`,
      name: index === 20 ? "Cloud export" : `Policy ${index}`,
      lifecycle: index % 2 === 0 ? "draft" as const : "off" as const,
      enforcementMode: null,
      health: "unknown" as const,
      owner: "Jae Sanders",
      lastChange: "1 day ago",
    }));
    const selected = selectPolicyRows(rows, { tab: "all", page: 2, query: "" });
    expect(selected.visible).toHaveLength(1);
    expect(selected.pageSize).toBe(20);
    expect(selectPolicyRows(rows, { tab: "all", page: 1, query: "cloud" }).total).toBe(1);
  });
});
```

- [ ] **Step 2: Run the list-state tests and confirm the module is missing**

Run: `pnpm vitest run src/features/policies/list-state.test.ts`

Expected: FAIL because `list-state.ts` does not exist.

- [ ] **Step 3: Add Policy content and route constants**

Create immutable exports for page title, tab labels, six column labels, toolbar accessible names, search placeholder, count/footer templates, empty/error messages, all seven builder step labels, all field labels/help text, deploy labels, local-only outcome copy, and these routes:

```ts
export const policyRoutes = {
  list: "/policies",
  create: "/policies/new",
  manageDomains: "/manage/domains",
} as const;

export const policyListContent = {
  title: "Policies",
  tabs: { all: "All", draft: "Draft", off: "Off" },
  columns: [
    "Policy name",
    "Lifecycle",
    "Enforcement mode",
    "Deployment health",
    "Owner",
    "Last change",
  ],
  newPolicy: "New policy",
  searchPlaceholder: "Search policies",
  refresh: "Refresh",
  deleteSelected: "Delete selected",
  export: "Export",
} as const;
```

Transcribe the remaining wording from the named Figma frames exactly; preserve the casing and punctuation drawn there.

- [ ] **Step 4: Add schema-parsed, server-only Figma data**

`data.ts` begins with `import "server-only"`. Encode all 20 rows in their Figma order and parse them once with a Zod array schema. Include exact audience, channel, content/finding, destination, collection, target, printer/device, application, action, notification, and deploy-as option catalogs used by the authoring frames.

```ts
const policyFixtureSchema = z.array(policyListItemSchema).length(20);
const POLICY_FIXTURES = policyFixtureSchema.parse(FIGMA_POLICY_ROWS);

export type PolicyCatalogOption = { value: string; label: string; description?: string };
export type ApplicationOption = PolicyCatalogOption & { icon: AppIconName };
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

export async function getPolicyFixtures(): Promise<readonly PolicyListItem[]> {
  return POLICY_FIXTURES;
}

export async function getPolicyCatalogs(): Promise<PolicyCatalogs> {
  return POLICY_CATALOGS;
}
```

Put `PolicyCatalogOption`, `ApplicationOption`, and `PolicyCatalogs` in `types.ts`; they are structural feature contracts, while boundary types remain inferred from Zod. Add `policyListItemSchema` to `schemas.ts` and derive the display type from it in `labels.ts`, so the fixture boundary and components cannot drift. Replace list and channel reads in `api.ts` with the server fixture functions for this frontend-only phase; retain the existing detail/mutation gateway contracts for future designed surfaces, but do not call them from the rebuilt list or authoring UI. Update `api.test.ts` so it asserts fixture schema validity, exact 20-row order, and catalog parsing while keeping the existing detail gateway tests.

- [ ] **Step 5: Implement list-state parsing and selection**

Use exact unions and return types:

```ts
export const POLICY_PAGE_SIZE = 20;
export type PolicyTab = "all" | "draft" | "off";
export type PolicyListState = {
  tab: PolicyTab;
  page: number;
  query: string;
};
export type PolicyListSelection = {
  visible: readonly PolicyListItem[];
  total: number;
  counts: Record<PolicyTab, number>;
  page: number;
  pageCount: number;
  pageSize: 20;
};
```

`parsePolicyListState` accepts the awaited Next.js `searchParams` record, trims search without lowercasing the displayed query, and clamps the page. `selectPolicyRows` lowercases only for comparison. Define `policyListHref(state: PolicyListState, patch?: Partial<PolicyListState>): string`; it merges the patch and omits `tab=all`, blank `q`, and `page=1`. Tab/search callers pass or imply `page: 1`; pagination callers pass the requested page without resetting it. Ignore an incoming `policy` parameter: the current Figma frame set contains no Policy detail surface, so the slice removes the repository's invented drawer instead of preserving an unverified screen.

- [ ] **Step 6: Run focused data/state tests**

Run:

```bash
pnpm vitest run src/features/policies/list-state.test.ts src/features/policies/api.test.ts src/features/policies/labels.test.ts
```

Expected: PASS with 20 fixture rows and canonical URL assertions.

- [ ] **Step 7: Commit the data and URL layer**

```bash
git add src/features/policies/content.ts src/features/policies/data.ts src/features/policies/types.ts src/features/policies/list-state.ts src/features/policies/list-state.test.ts src/features/policies/labels.ts src/features/policies/schemas.ts src/features/policies/api.ts src/features/policies/api.test.ts
git commit -m "feat(policies): add Figma fixtures and URL state"
```

---

### Task 4: Rebuild the Policy list screen

**Files:**
- Create: `src/features/policies/components/PolicyList.tsx`
- Create: `src/features/policies/components/PolicyTabs.tsx`
- Create: `src/features/policies/components/PolicyToolbar.tsx`
- Create: `src/features/policies/components/PolicyTable.tsx`
- Create: `src/features/policies/components/policy-columns.tsx`
- Create: `src/features/policies/components/PolicyListRow.tsx`
- Create: `src/features/policies/components/PolicyListEmpty.tsx`
- Create: `src/features/policies/components/PolicyList.test.tsx`
- Create: `src/features/policies/components/PolicyCells.tsx`
- Delete: `src/features/policies/components/policy-cells.tsx`
- Delete: `src/features/policies/components/policy-drawer.tsx`
- Modify: `src/app/(app)/policies/page.tsx`

**Interfaces:**
- Consumes: `PolicyListState`, `PolicyListSelection`, `policyListHref`, Policy content, `AppIcon`, and `getPolicyFixtures`.
- Produces: an exact six-column, 20-row desktop list with URL-backed tabs/search/pagination and SVG controls.

- [ ] **Step 1: Write the failing list component tests**

```tsx
// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";

import { PolicyList } from "@/features/policies/components/PolicyList";

it("renders the Figma table and URL-backed controls", async () => {
  const { container } = render(<PolicyList state={DEFAULT_STATE} selection={FIXTURE_SELECTION} />);
  expect(screen.getByRole("heading", { level: 1, name: "Policies" })).toBeVisible();
  expect(screen.getByRole("link", { name: /All/ })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "New policy" })).toHaveAttribute("href", "/policies/new");
  const table = screen.getByRole("table", { name: "Policies" });
  expect(within(table).getAllByRole("columnheader")).toHaveLength(6);
  expect(within(table).getAllByRole("row")).toHaveLength(21);
  expect((await axe(container)).violations).toEqual([]);
});
```

Define `DEFAULT_STATE` and `FIXTURE_SELECTION` in the test with 20 complete `PolicyListItem` objects; do not import the server-only fixture module into jsdom.

- [ ] **Step 2: Run the list component test and confirm the missing component failure**

Run: `pnpm vitest run src/features/policies/components/PolicyList.test.tsx`

Expected: FAIL because `PolicyList.tsx` does not exist.

- [ ] **Step 3: Implement the tabs and toolbar**

`PolicyTabs` receives `state` and counts, renders three `<Link>` elements, and builds hrefs through `policyListHref`. `PolicyToolbar` uses a GET `<form action="/policies">`, preserves non-default tab in a hidden input, and uses only `AppIcon` for the three square actions and the New policy button.

```tsx
export type PolicyToolbarProps = {
  state: PolicyListState;
};

export function PolicyToolbar({ state }: PolicyToolbarProps) {
  return (
    <form action={policyRoutes.list} role="search">
      {state.tab === "all" ? null : <input type="hidden" name="tab" value={state.tab} />}
      <button type="button" aria-label={policyListContent.refresh}><AppIcon name="refresh" /></button>
      <button type="button" aria-label={policyListContent.deleteSelected} disabled><AppIcon name="delete" /></button>
      <button type="button" aria-label={policyListContent.export}><AppIcon name="export" /></button>
      <label className="sr-only" htmlFor="policy-search">{policyListContent.searchPlaceholder}</label>
      <input id="policy-search" name="q" defaultValue={state.query} />
      <Link href={policyRoutes.create}><AppIcon name="plus" />{policyListContent.newPolicy}</Link>
    </form>
  );
}
```

The submit/search behavior must reset page by omitting the page field. Empty selection keeps Delete visually disabled and semantically `disabled`.

- [ ] **Step 4: Implement table columns, rows, and exact Policy styling**

Define TanStack columns in `policy-columns.tsx` next to `PolicyTable` and render native `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, and `<td>` elements. The six columns use the Figma widths, 12px/16px header token with 0.36px tracking, and 13px/17px body token. The table frame uses the Figma border/head tokens from Task 1.

```tsx
export type PolicyTableProps = {
  rows: readonly PolicyListItem[];
};

export const policyColumns: ColumnDef<PolicyListItem>[] = [
  { accessorKey: "name", header: policyListContent.columns[0] },
  { accessorKey: "lifecycle", header: policyListContent.columns[1] },
  { accessorKey: "enforcementMode", header: policyListContent.columns[2] },
  { accessorKey: "health", header: policyListContent.columns[3] },
  { accessorKey: "owner", header: policyListContent.columns[4] },
  { accessorKey: "lastChange", header: policyListContent.columns[5] },
];

export function PolicyTable({ rows }: PolicyTableProps) {
  const table = useReactTable({
    data: [...rows],
    columns: policyColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <table aria-label={policyListContent.title}>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id} scope="col">
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <PolicyListRow key={row.id} row={row} />
        ))}
      </tbody>
    </table>
  );
}
```

Define `PolicyListRow({ row }: { row: Row<PolicyListItem> })`; it renders all six native cells and exposes no click target that lacks a Figma-designed destination. Move the lifecycle/health cells into `PolicyCells.tsx`, replacing the minus glyph with `AppIcon`. Delete the lowercase cell file and the invented `policy-drawer.tsx`; remove all Lucide imports in touched Policy files.

- [ ] **Step 5: Compose the screen and make the route thin**

```tsx
export default async function PoliciesPage({ searchParams }: PageProps<"/policies">) {
  const state = parsePolicyListState(await searchParams);
  const policies = await getPolicyFixtures();
  const selection = selectPolicyRows(policies, state);
  return <PolicyList state={state} selection={selection} />;
}
```

`PolicyList` owns the page title, tabs, toolbar, count copy, table/empty choice, and footer. Remove business markup, literal copy, pagination calculations, and drawer loading from the route file.

- [ ] **Step 6: Run list tests and hardcoded-value scans**

Run:

```bash
pnpm vitest run src/features/policies/components/PolicyList.test.tsx src/features/policies/list-state.test.ts
rg -n "lucide-react|className=.*\[[^]]+\]|#[0-9a-fA-F]{3,8}" src/app/'(app)'/policies/page.tsx src/features/policies/components/PolicyList.tsx src/features/policies/components/PolicyTabs.tsx src/features/policies/components/PolicyToolbar.tsx src/features/policies/components/PolicyTable.tsx src/features/policies/components/policy-columns.tsx src/features/policies/components/PolicyListRow.tsx src/features/policies/components/PolicyCells.tsx
```

Expected: tests pass and the scan prints no match.

- [ ] **Step 7: Commit the Policy list**

```bash
git add src/app/'(app)'/policies/page.tsx src/features/policies/components src/app/globals.css
git commit -m "feat(policies): match the Figma policy list"
```

---

### Task 5: Add designed Policy loading and error states

**Files:**
- Create: `src/features/policies/components/PolicyListSkeleton.tsx`
- Create: `src/features/policies/components/PolicyListError.tsx`
- Create: `src/features/policies/components/PolicyListStates.test.tsx`
- Create: `src/app/(app)/policies/loading.tsx`
- Create: `src/app/(app)/policies/error.tsx`

**Interfaces:**
- Consumes: Policy content, the table dimension/type tokens, and the New policy route.
- Produces: streaming table skeleton and a retryable route boundary with no raw error text.

- [ ] **Step 1: Write failing state tests**

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { PolicyListError } from "@/features/policies/components/PolicyListError";
import { PolicyListSkeleton } from "@/features/policies/components/PolicyListSkeleton";

it("renders table-shaped loading rows", () => {
  render(<PolicyListSkeleton />);
  expect(screen.getByRole("status", { name: "Loading policies" })).toBeVisible();
  expect(screen.getAllByTestId("policy-skeleton-row")).toHaveLength(8);
});

it("retries without exposing the thrown message", () => {
  const retry = vi.fn();
  render(<PolicyListError retry={retry} correlationId="POLICY-LOAD" />);
  expect(screen.queryByText(/stack|gateway/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run the tests and confirm missing module failures**

Run: `pnpm vitest run src/features/policies/components/PolicyListStates.test.tsx`

Expected: FAIL because the two state components do not exist.

- [ ] **Step 3: Implement skeleton and error components**

The skeleton reproduces the title, tabs, toolbar, six headers, and eight row bars using `animate-pulse motion-reduce:animate-none`. The error component renders the fixed support-safe correlation label `POLICY-LOAD`, explanatory copy from `content.ts`, and a retry button.

```tsx
export function PolicyListError({ retry, correlationId }: { retry: () => void; correlationId: string }) {
  return (
    <section aria-labelledby="policy-error-title">
      <h1 id="policy-error-title">{policyListContent.errorTitle}</h1>
      <p>{policyListContent.errorDescription}</p>
      <p>{policyListContent.correlationLabel(correlationId)}</p>
      <button type="button" onClick={retry}>{policyListContent.tryAgain}</button>
    </section>
  );
}
```

- [ ] **Step 4: Wire Next.js route state files**

```tsx
// loading.tsx
export default function PoliciesLoading() {
  return <PolicyListSkeleton />;
}
```

```tsx
// error.tsx
"use client";

export default function PoliciesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PolicyListError retry={reset} correlationId="POLICY-LOAD" />;
}
```

Do not render `error.message` or log Policy contents.

- [ ] **Step 5: Run the focused state tests**

Run: `pnpm vitest run src/features/policies/components/PolicyListStates.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the route states**

```bash
git add src/app/'(app)'/policies/loading.tsx src/app/'(app)'/policies/error.tsx src/features/policies/components/PolicyListSkeleton.tsx src/features/policies/components/PolicyListError.tsx src/features/policies/components/PolicyListStates.test.tsx
git commit -m "feat(policies): add list loading and recovery states"
```

---

### Task 6: Define and test the Policy authoring contract

**Files:**
- Modify: `src/features/policies/schemas.ts`
- Modify: `src/features/policies/content.ts`
- Create: `src/features/policies/authoring-defaults.ts`
- Create: `src/features/policies/serialize-policy.ts`
- Create: `src/features/policies/serialize-policy.test.ts`

**Interfaces:**
- Consumes: existing `Intent`, `PolicyAction`, `PolicyState`, and the four Figma-authorable channels.
- Produces: `policyAuthoringSchema`, `PolicyAuthoringValues`, `PolicyChannel`, `defaultPolicyAuthoringValues`, and `serializePolicyPreview(values)`.

- [ ] **Step 1: Write failing schema and serialization tests**

```ts
import { describe, expect, it } from "vitest";

import { policyAuthoringSchema } from "@/features/policies/schemas";
import { serializePolicyPreview } from "@/features/policies/serialize-policy";

it("requires a name and fallback action", () => {
  const result = policyAuthoringSchema.safeParse({
    ...VALID_CLIPBOARD_VALUES,
    name: "",
    enforcement: { ...VALID_CLIPBOARD_VALUES.enforcement, onUnknown: "" },
  });
  expect(result.success).toBe(false);
});

it.each(["clipboard", "removable-media", "print", "desktop-apps"] as const)(
  "serializes only %s fields while retaining form values for every channel",
  (channel) => {
    const values = { ...ALL_CHANNEL_VALUES, channel };
    const preview = serializePolicyPreview(values);
    expect(preview.intent.channel.kind).toBe(channel);
    expect(Object.keys(preview.intent.channel)).toEqual(EXPECTED_KEYS[channel]);
  },
);

it("maps Draft, Active, and Off exactly", () => {
  expect(serializePolicyPreview({ ...VALID_CLIPBOARD_VALUES, deployAs: "Draft" }).state).toBe("Draft");
  expect(serializePolicyPreview({ ...VALID_CLIPBOARD_VALUES, deployAs: "Active" }).state).toBe("Active");
  expect(serializePolicyPreview({ ...VALID_CLIPBOARD_VALUES, deployAs: "Off" }).state).toBe("Off");
});
```

Define complete valid constants in the test for name, description, audience, all channel sub-objects, enforcement, notification, and deploy state.

- [ ] **Step 2: Run tests and confirm missing authoring exports**

Run: `pnpm vitest run src/features/policies/serialize-policy.test.ts`

Expected: FAIL because `policyAuthoringSchema` and `serializePolicyPreview` do not exist.

- [ ] **Step 3: Add a discriminated authoring schema**

```ts
export const policyChannelSchema = z.enum([
  "clipboard",
  "removable-media",
  "print",
  "desktop-apps",
]);

export const deployAsSchema = z.enum(["Draft", "Active", "Off"]);

export const policyAuthoringSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
  appliesTo: z.string().min(1),
  channel: policyChannelSchema,
  content: z.object({ mode: z.enum(["specific", "any"]), findingIds: z.array(z.string()) }),
  clipboard: clipboardRuleSchema,
  removableMedia: removableMediaRuleSchema,
  print: printRuleSchema,
  desktopApps: desktopAppRuleSchema,
  enforcement: z.object({
    action: policyActionSchema,
    onUnknown: policyActionSchema,
    reasonCode: z.string().trim().min(1).max(64),
    message: z.string().trim().min(1).max(500),
  }),
  notification: z.object({ enabled: z.boolean(), title: z.string().max(120), message: z.string().max(500) }),
  deployAs: deployAsSchema,
});

export type PolicyAuthoringValues = z.infer<typeof policyAuthoringSchema>;
export type PolicyChannel = z.infer<typeof policyChannelSchema>;
```

Put the visible default name, message, notification title, and notification message in `policyBuilderContent.defaults`. Create `authoring-defaults.ts` with `defaultPolicyAuthoringValues: PolicyAuthoringValues`, using those content exports plus stable catalog IDs. The complete object includes all four channel sub-objects so `shouldUnregister: false` can retain hidden values.

```ts
export const defaultPolicyAuthoringValues: PolicyAuthoringValues = {
  name: policyBuilderContent.defaults.name,
  description: "",
  appliesTo: "finance-all-staff",
  channel: "clipboard",
  content: { mode: "specific", findingIds: ["aadhaar-number"] },
  clipboard: { destinationClass: "personal-or-foreign", collectionIds: [] },
  removableMedia: { target: "all-removable-media", exceptionIds: [] },
  print: { target: "all-printers", exceptionIds: [] },
  desktopApps: { applicationIds: [], exceptionIds: [] },
  enforcement: {
    action: "Block",
    onUnknown: "WarnJustify",
    reasonCode: policyBuilderContent.defaults.reasonCode,
    message: policyBuilderContent.defaults.message,
  },
  notification: {
    enabled: true,
    title: policyBuilderContent.defaults.notificationTitle,
    message: policyBuilderContent.defaults.notificationMessage,
  },
  deployAs: "Draft",
};
```

Define each channel object with required fields matching its Figma frames. Use `superRefine` to require at least one finding only when content mode is `specific`, at least one app for Desktop Apps, and notification title/message only when notifications are enabled.

- [ ] **Step 4: Implement channel-dependent serialization**

```ts
export function serializePolicyPreview(input: PolicyAuthoringValues): PolicyPreview {
  const values = policyAuthoringSchema.parse(input);
  return {
    name: values.name,
    description: values.description,
    state: values.deployAs,
    intent: {
      who: { appliesTo: values.appliesTo },
      content: values.content,
      channel: serializeSelectedChannel(values),
      response: values.enforcement,
      notification: values.notification,
    },
  };
}
```

Define and export a `PolicyPreview` type in `serialize-policy.ts` with `name`, `description`, `state`, and `intent`; `intent.channel` is the four-member discriminated union and the other members mirror the validated audience/content/response/notification objects. `serializeSelectedChannel` uses an exhaustive `switch (values.channel)` and returns that union. Define `unreachableChannel(value: never): never` in the same pure module and call it from the default branch so adding a channel cannot silently serialize the wrong fields.

- [ ] **Step 5: Run the complete schema matrix**

Run: `pnpm vitest run src/features/policies/serialize-policy.test.ts src/features/policies/api.test.ts`

Expected: PASS for every channel and deploy state.

- [ ] **Step 6: Commit the authoring contract**

```bash
git add src/features/policies/schemas.ts src/features/policies/content.ts src/features/policies/authoring-defaults.ts src/features/policies/serialize-policy.ts src/features/policies/serialize-policy.test.ts
git commit -m "feat(policies): define policy authoring contract"
```

---

### Task 7: Build the accessible Figma select primitive

**Files:**
- Create: `src/features/policies/components/PolicySelect.tsx`
- Create: `src/features/policies/components/PolicySelect.test.tsx`

**Interfaces:**
- Consumes: `AppIcon`, semantic dropdown tokens, and string option data.
- Produces: `PolicySelect({ id, label, value, options, onChange, error? })` used by Who, Where, Data, Enforcement, and Finish.

- [ ] **Step 1: Write failing keyboard and focus tests**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";

import { PolicySelect } from "@/features/policies/components/PolicySelect";

it("opens, selects with arrows and Enter, and restores focus", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { container } = render(
    <PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={onChange} />,
  );
  const trigger = screen.getByRole("combobox", { name: "Deploy as" });
  await user.click(trigger);
  await user.keyboard("{ArrowDown}{Enter}");
  expect(onChange).toHaveBeenCalledWith("Active");
  expect(trigger).toHaveFocus();
  expect((await axe(container)).violations).toEqual([]);
});

it("closes with Escape without changing the value", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={onChange} />);
  await user.click(screen.getByRole("combobox", { name: "Deploy as" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the tests and confirm the missing component failure**

Run: `pnpm vitest run src/features/policies/components/PolicySelect.test.tsx`

Expected: FAIL because `PolicySelect.tsx` does not exist.

- [ ] **Step 3: Implement the listbox state machine and Figma variants**

Use a labeled button with `role="combobox"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant`; a popup with `role="listbox"`; and `role="option"` rows with `aria-selected`. Arrow Up/Down changes the active option, Enter/Space chooses it, Home/End jumps, Tab closes naturally, Escape closes and restores trigger focus, and outside pointer down closes.

```ts
export type PolicySelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: AppIconName;
};

export type PolicySelectProps = {
  id: string;
  label: string;
  value: string;
  options: readonly PolicySelectOption[];
  onChange: (value: string) => void;
  error?: string;
};
```

Match Figma's closed, hover, open, active, and selected rows through semantic classes. Use `AppIcon name="chevron-down"`; do not use native-select OS chrome because the open Figma states must be visually reproducible.

- [ ] **Step 4: Run component tests and axe**

Run: `pnpm vitest run src/features/policies/components/PolicySelect.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the select primitive**

```bash
git add src/features/policies/components/PolicySelect.tsx src/features/policies/components/PolicySelect.test.tsx src/app/globals.css
git commit -m "feat(policies): add accessible Figma select"
```

---

### Task 8: Build the Policy builder shell and first three steps

**Files:**
- Create: `src/features/policies/components/PolicyBuilder.tsx`
- Create: `src/features/policies/components/PolicyStepRail.tsx`
- Create: `src/features/policies/components/PolicyStartStep.tsx`
- Create: `src/features/policies/components/PolicyWhoStep.tsx`
- Create: `src/features/policies/components/PolicyWhereStep.tsx`
- Create: `src/features/policies/components/PolicyBuilder.test.tsx`
- Modify: `src/app/(app)/policies/new/page.tsx`
- Delete: `src/features/policies/components/description-field.tsx`
- Delete: `src/features/policies/components/step-rail.tsx`

**Interfaces:**
- Consumes: `PolicyCatalogs`, `policyAuthoringSchema`, `defaultPolicyAuthoringValues`, `PolicySelect`, Policy content, and `AppIcon`.
- Produces: a React Hook Form provider and the Start/Who/Where Figma states.

- [ ] **Step 1: Write the failing initial-builder journey**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { PolicyBuilder } from "@/features/policies/components/PolicyBuilder";

it("edits identity, audience, and channel without losing values", async () => {
  const user = userEvent.setup();
  const { container } = render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);
  await user.clear(screen.getByRole("textbox", { name: "Policy name" }));
  await user.type(screen.getByRole("textbox", { name: "Policy name" }), "Clipboard protection");
  await user.click(screen.getByRole("combobox", { name: "Applies to" }));
  await user.click(screen.getByRole("option", { name: /Finance/ }));
  await user.click(screen.getByRole("combobox", { name: "Channel" }));
  await user.click(screen.getByRole("option", { name: "Print" }));
  expect(screen.getByRole("combobox", { name: "Channel" })).toHaveTextContent("Print");
  expect(screen.getByRole("textbox", { name: "Policy name" })).toHaveValue("Clipboard protection");
  expect((await axe(container)).violations).toEqual([]);
});
```

- [ ] **Step 2: Run the test and confirm the builder module is missing**

Run: `pnpm vitest run src/features/policies/components/PolicyBuilder.test.tsx`

Expected: FAIL because `PolicyBuilder.tsx` does not exist.

- [ ] **Step 3: Create the form provider and seven-section structure**

```tsx
export function PolicyBuilder({ catalogs }: { catalogs: PolicyCatalogs }) {
  const form = useForm<PolicyAuthoringValues>({
    resolver: zodResolver(policyAuthoringSchema),
    defaultValues: defaultPolicyAuthoringValues,
    mode: "onBlur",
    shouldUnregister: false,
  });
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)} noValidate>
        <PolicyStepRail />
        <PolicyStartStep />
        <PolicyWhoStep audiences={catalogs.audiences} />
        <PolicyWhereStep channels={catalogs.channels} />
      </form>
    </FormProvider>
  );
}
```

Keep `PolicyBuilder.tsx` under 250 lines. Its valid submit sets a local completion state and does not call `createPolicy`.

- [ ] **Step 4: Implement the exact step rail and Start/Who/Where sections**

Use the seven labels in `content.ts`, ordered list semantics, Figma connector geometry via CSS tokens, and anchor links to `#policy-start`, `#policy-who`, `#policy-where`, `#policy-data`, `#policy-enforcement`, `#policy-notification`, and `#policy-finish`.

Start registers `name` and `description` with inline `aria-describedby` errors. Who controls `appliesTo` with `Controller` and `PolicySelect`. Where controls the four-channel union and renders the exact channel SVG beside each Figma option. All panels use the selected Figma spacing and type tokens.

- [ ] **Step 5: Make `/policies/new` a thin Server Component**

```tsx
export default async function CreatePolicyPage() {
  const catalogs = await getPolicyCatalogs();
  return <PolicyBuilder catalogs={catalogs} />;
}
```

Remove the 382-line presentational page and delete the superseded lowercase step/description components after confirming no remaining imports.

- [ ] **Step 6: Run builder tests and route typecheck**

Run:

```bash
pnpm vitest run src/features/policies/components/PolicyBuilder.test.tsx src/features/policies/components/PolicySelect.test.tsx
pnpm typecheck
```

Expected: tests pass and the route compiles as a Server Component.

- [ ] **Step 7: Commit the builder scaffold**

```bash
git add src/app/'(app)'/policies/new/page.tsx src/features/policies/components src/features/policies/content.ts src/app/globals.css
git commit -m "feat(policies): build policy authoring foundation"
```

---

### Task 9: Implement every channel-specific Data state

**Files:**
- Create: `src/features/policies/components/PolicyDataStep.tsx`
- Create: `src/features/policies/components/ClipboardConditions.tsx`
- Create: `src/features/policies/components/RemovableMediaConditions.tsx`
- Create: `src/features/policies/components/PrintConditions.tsx`
- Create: `src/features/policies/components/DesktopAppConditions.tsx`
- Create: `src/features/policies/components/ApplicationSelect.tsx`
- Create: `src/features/policies/components/ApplicationSelect.test.tsx`
- Modify: `src/features/policies/components/PolicyBuilder.test.tsx`

**Interfaces:**
- Consumes: `PolicyCatalogs`, React Hook Form context, `PolicySelect`, `AppIcon`, and all channel sub-schemas.
- Produces: all Clipboard, Removable media, Print, Desktop Apps, Content, Destination, Collection, Target, Exception, and app-selection Figma states.

- [ ] **Step 1: Extend the failing builder test across the channel matrix**

```tsx
it.each([
  ["Clipboard", "Destination class"],
  ["Removable media", "Device target"],
  ["Print", "Printer target"],
  ["Desktop Apps", "Applications"],
] as const)("shows only %s controls", async (channelLabel, visibleLabel) => {
  const user = userEvent.setup();
  render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);
  await user.click(screen.getByRole("combobox", { name: "Channel" }));
  await user.click(screen.getByRole("option", { name: channelLabel }));
  expect(screen.getByText(visibleLabel)).toBeVisible();
  for (const other of ["Destination class", "Device target", "Printer target", "Applications"].filter((label) => label !== visibleLabel)) {
    expect(screen.queryByText(other)).not.toBeInTheDocument();
  }
});

it("retains Desktop Apps selections after switching channels", async () => {
  const user = userEvent.setup();
  render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);
  await user.click(screen.getByRole("combobox", { name: "Channel" }));
  await user.click(screen.getByRole("option", { name: "Desktop Apps" }));
  await user.click(screen.getByRole("button", { name: "Choose applications" }));
  await user.click(screen.getByRole("option", { name: "Google Chrome" }));
  await user.click(screen.getByRole("combobox", { name: "Channel" }));
  await user.click(screen.getByRole("option", { name: "Print" }));
  await user.click(screen.getByRole("combobox", { name: "Channel" }));
  await user.click(screen.getByRole("option", { name: "Desktop Apps" }));
  expect(screen.getByRole("option", { name: "Google Chrome" })).toHaveAttribute("aria-selected", "true");
});
```

- [ ] **Step 2: Run the builder test and confirm missing channel editors**

Run: `pnpm vitest run src/features/policies/components/PolicyBuilder.test.tsx`

Expected: FAIL because the Data step and channel editors are missing.

- [ ] **Step 3: Implement `PolicyDataStep` as an exhaustive dispatcher**

```tsx
export function PolicyDataStep({ catalogs }: { catalogs: PolicyCatalogs }) {
  const channel = useWatch<PolicyAuthoringValues, "channel">({ name: "channel" });
  switch (channel) {
    case "clipboard": return <ClipboardConditions catalogs={catalogs} />;
    case "removable-media": return <RemovableMediaConditions catalogs={catalogs} />;
    case "print": return <PrintConditions catalogs={catalogs} />;
    case "desktop-apps": return <DesktopAppConditions catalogs={catalogs} />;
    default: return unreachableChannel(channel);
  }
}

function unreachableChannel(value: never): never {
  throw new Error(`Unsupported policy channel: ${String(value)}`);
}
```

Each editor registers only its channel namespace and stays below 250 lines.

After adding `PolicyDataStep`, render `<PolicyDataStep catalogs={catalogs} />` after `PolicyWhereStep` in `PolicyBuilder` so Task 9 ends with a working four-section form.

- [ ] **Step 4: Implement the Figma selector families**

Clipboard: content mode, findings, destination class, collection, and content-independent state. Removable media: content mode, device target, destination, and exception. Print: content mode, printer target, destination, and exception. Desktop Apps: content mode, application target, selected apps, and exception.

Use `useFieldArray` with `field.id` for repeatable findings/exceptions. The plus/remove buttons use `AppIcon`; selector open/hover/focus states come from `PolicySelect`. Every error is connected through `aria-describedby`.

- [ ] **Step 5: Implement the accessible application multi-select**

```ts
export type ApplicationSelectProps = {
  value: readonly string[];
  options: readonly ApplicationOption[];
  onChange: (value: string[]) => void;
  error?: string;
};
```

Render a labeled trigger, `aria-multiselectable="true"` listbox, options with SVG application marks and `aria-selected`, Space to toggle, Escape to close and restore focus, and a visible selected-app summary. Preserve Figma ordering.

- [ ] **Step 6: Run channel and multi-select tests**

Run:

```bash
pnpm vitest run src/features/policies/components/PolicyBuilder.test.tsx src/features/policies/components/ApplicationSelect.test.tsx src/features/policies/serialize-policy.test.ts
```

Expected: PASS across all four channel families and retained hidden values.

- [ ] **Step 7: Commit channel behavior**

```bash
git add src/features/policies/components src/features/policies/schemas.ts src/features/policies/serialize-policy.ts src/app/globals.css
git commit -m "feat(policies): add channel-specific policy rules"
```

---

### Task 10: Complete enforcement, notifications, JSON review, deploy states, and unsaved-work protection

**Files:**
- Create: `src/features/policies/components/PolicyEnforcementStep.tsx`
- Create: `src/features/policies/components/PolicyNotificationStep.tsx`
- Create: `src/features/policies/components/PolicyFinishStep.tsx`
- Create: `src/features/policies/components/PolicyJsonPreview.tsx`
- Create: `src/features/policies/components/UnsavedChangesGuard.tsx`
- Create: `src/features/policies/components/PolicyFinishStep.test.tsx`
- Modify: `src/features/policies/components/PolicyBuilder.tsx`
- Modify: `src/features/policies/components/PolicyBuilder.test.tsx`

**Interfaces:**
- Consumes: React Hook Form context, `serializePolicyPreview`, `PolicySelect`, Policy copy, and SVG controls.
- Produces: Figma Required states, End User Notification, JSON dialog, Draft-1/2/3 menu states, inline validation, local outcome, and leave warning.

- [ ] **Step 1: Write failing finish-state tests**

```tsx
it("shows required errors and moves focus to the first invalid field", async () => {
  const user = userEvent.setup();
  render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);
  await user.clear(screen.getByRole("textbox", { name: "Policy name" }));
  await user.click(screen.getByRole("button", { name: "Create policy" }));
  expect(await screen.findByText("Enter a policy name")).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Policy name" })).toHaveFocus();
});

it.each(["Draft", "Active", "Off"])("selects the %s deploy state", async (deployAs) => {
  const user = userEvent.setup();
  render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);
  await user.click(screen.getByRole("combobox", { name: "Deploy as" }));
  await user.click(screen.getByRole("option", { name: deployAs }));
  expect(screen.getByRole("combobox", { name: "Deploy as" })).toHaveTextContent(deployAs);
});

it("opens sanitized JSON and restores focus on close", async () => {
  const user = userEvent.setup();
  render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);
  const trigger = screen.getByRole("button", { name: "View JSON" });
  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: "Policy JSON" })).toBeVisible();
  expect(screen.queryByText(/token|credential|tenantId/i)).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 2: Run finish tests and confirm missing components**

Run: `pnpm vitest run src/features/policies/components/PolicyFinishStep.test.tsx`

Expected: FAIL because the finish components do not exist.

- [ ] **Step 3: Implement Enforcement and End User Notification**

Enforcement controls `action`, required `onUnknown`, `reasonCode`, and `message`; match every named `Required-*` state through the single select control. Notification controls `enabled`, `title`, and `message`; disable and visually mute its text fields when off without unregistering them. Use content-module errors, native labels, and `aria-live="polite"` for validation summary changes.

- [ ] **Step 4: Implement the JSON review dialog**

```tsx
export function PolicyJsonPreview({ values, isOpen, onClose }: PolicyJsonPreviewProps) {
  const preview = serializePolicyPreview(values);
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="policy-json-title">
      <h2 id="policy-json-title">{policyBuilderContent.jsonTitle}</h2>
      <pre>{JSON.stringify(preview, null, 2)}</pre>
      <button type="button" onClick={onClose} aria-label={policyBuilderContent.closeJson}>
        <AppIcon name="close" />
      </button>
    </div>
  );
}
```

Inside `PolicyJsonPreview`, retain the previously focused element in a ref, focus the close button on open, cycle Tab/Shift+Tab between dialog controls, close on Escape or the SVG close button, and restore the trigger. Keep the preview limited to schema-parsed authoring data.

- [ ] **Step 5: Implement Finish and the local-only completion outcome**

Finish uses `PolicySelect` with exactly Draft, Active, and Off, so its open/active variants reproduce Draft-1, Draft-2, and Draft-3. Buttons are Cancel, View JSON, and Create policy. Add `PolicyEnforcementStep`, `PolicyNotificationStep`, and `PolicyFinishStep` after `PolicyDataStep` in `PolicyBuilder`; replace the interim submit callback with a named `handleValidSubmit` that sets local completion state. Successful validation changes the form area to the designed confirmation banner with this meaning from `content.ts`: the policy passed local validation but was not saved because persistence is unavailable.

Do not invoke existing mutation actions from this create flow.

- [ ] **Step 6: Add unsaved-work protection**

```ts
export type UnsavedChangesGuardProps = {
  isDirty: boolean;
  cancelHref: string;
};
```

While dirty, register `beforeunload`; for the in-app Cancel link, show a tokenized confirmation dialog with Stay and Discard actions. Do not intercept every Next.js navigation globally. Remove the listener after successful local validation or a confirmed discard.

- [ ] **Step 7: Run all authoring tests and SVG/hardcoded scans**

Run:

```bash
pnpm vitest run src/features/policies/components/PolicyBuilder.test.tsx src/features/policies/components/PolicyFinishStep.test.tsx src/features/policies/components/PolicySelect.test.tsx src/features/policies/components/ApplicationSelect.test.tsx src/features/policies/serialize-policy.test.ts
rg -n "lucide-react|className=.*\[[^]]+\]|#[0-9a-fA-F]{3,8}|\\.(png|jpe?g|webp)" src/app/'(app)'/policies src/features/policies src/components/icons
```

Expected: tests pass and the scan prints no match outside test fixture strings that are not visual values.

- [ ] **Step 8: Commit the completed builder**

```bash
git add src/features/policies/components src/features/policies/content.ts src/app/'(app)'/policies/new/page.tsx src/app/globals.css
git commit -m "feat(policies): complete Figma policy authoring states"
```

---

### Task 11: Add authenticated Playwright coverage and exact desktop/mobile checks

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `playwright.config.ts`
- Create: `e2e/authenticated-page.ts`
- Create: `e2e/policy-list.spec.ts`
- Create: `e2e/policy-builder.spec.ts`

**Interfaces:**
- Consumes: the protected Policy routes, `SESSION_COOKIE`, server-only fixtures, and the 1440×957 reference frame.
- Produces: reproducible critical-journey, URL-state, geometry, computed-style, keyboard, and responsive checks without adding raster assets to the repository.

- [ ] **Step 1: Create the Playwright configuration and auth helper**

Add `"test:e2e": "playwright test"` to scripts. Start Next at port 3100 with a harmless gateway origin; Policy reads are local server fixtures, so no fake credential is sent anywhere.

```ts
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: {
    command: "GATEWAY_ORIGIN=http://127.0.0.1:9 pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/sign-in",
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 957 } } },
    { name: "narrow", use: { viewport: { width: 390, height: 844 } } },
  ],
});
```

`authenticated-page.ts` adds `SESSION_COOKIE` with the structurally valid, non-secret test JWT `e30.eyJleHAiOjQxMDI0NDQ4MDB9.test` for `127.0.0.1` before navigation. This only satisfies the proxy expiry check and never leaves the local test process.

- [ ] **Step 2: Write the desktop list and style assertions**

```ts
test("Policy list matches the Figma shell and table contract", async ({ page }) => {
  await authenticate(page.context());
  await page.goto("/policies");
  await expect(page.getByRole("heading", { name: "Policies" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCSS("width", "256px");
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCSS("background-color", "rgb(15, 9, 12)");
  await expect(page.locator("main")).toHaveCSS("background-color", "rgb(245, 246, 248)");
  await expect(page.getByRole("table", { name: "Policies" }).getByRole("row")).toHaveCount(21);
});
```

Also assert title font family/size/weight, table header/body font sizes and line heights, table border/head colors, 48px content header, active Policy item state, and presence of `<svg>` under every icon control.

- [ ] **Step 3: Write URL-backed list behavior assertions**

Navigate through Draft and Off links and submit mixed-case search. Assert the removed `policy` parameter does not render the old drawer, canonical URLs omit `tab=all` and `page=1`, and a no-match search shows the empty state and New policy recovery action. Unit tests cover page two with a synthetic 21-row array; the exact Figma fixture itself remains 20 rows.

- [ ] **Step 4: Write the complete builder journey**

For each channel, use visible controls to reach its selector/condition states, then assert unrelated channel fields are absent. Exercise every Applies to, Channel, Required, Destination, Collection, app-selection, JSON, and Deploy as menu family represented by the named Figma frames. Complete one valid policy, assert the local-only confirmation, then reload `/policies` and assert no new row was falsely persisted.

Use keyboard-only steps for one complete journey: Tab/Shift+Tab, Space, arrows, Enter, Escape. Assert focus returns after menus/dialogs.

- [ ] **Step 5: Assert narrow behavior without changing desktop geometry**

In the narrow project, assert no horizontal document overflow, an accessible control exposes the navigation, all builder sections remain reachable, and controls meet the tokenized narrow touch target. Do not assert that the narrow layout copies the desktop frame.

- [ ] **Step 6: Run Playwright and keep raster captures outside source control**

Run: `pnpm test:e2e`

Expected: both desktop and narrow projects pass. Traces and temporary screenshots stay under ignored test output; no PNG/JPEG/WebP file is added to `public/`, `src/`, or committed fixture folders.

- [ ] **Step 7: Commit the journey tests**

```bash
git add package.json playwright.config.ts e2e .gitignore
git commit -m "test(policies): cover Figma list and builder journeys"
```

---

### Task 12: Reconcile documentation, perform visual QA, and verify the slice

**Files:**
- Modify: `docs/FIGMA-DEVIATIONS.md`
- Modify: `src/features/endpoints/data.ts`
- Modify: any Policy/shell file only when a verified Figma comparison exposes a mismatch

**Interfaces:**
- Consumes: completed shell/list/builder, current Figma desktop app, automated test suite, and the design spec acceptance criteria.
- Produces: an accurate deviation record, warning-free verification, and visually accepted Policy slice.

- [ ] **Step 1: Update the deviation document**

Replace the obsolete signed-in shell and “Policies has no frames” claims. Record:

```markdown
- Current source: Figma file `2CUGuQCAn2abgFkIz39t5V`, page `Screens`, reviewed 2026-09-13.
- Signed-in shell: 256px `#0F090C` sidebar and content-only 48px header, matched literally at 1440×957.
- Assets: all introduced shell and Policy visuals are exact SVG vectors; no raster production asset is used.
- Responsive behavior: navigation collapses below desktop while preserving the 1440×957 reference unchanged.
- Accessibility: visible focus, semantic controls, and focus management may add states not drawn in static Figma frames.
- Persistence: Policy Create validates locally and does not claim a saved backend record.
```

Keep auth decisions intact and remove only statements superseded by the current Figma file.

- [ ] **Step 2: Remove the pre-existing lint warning**

In `src/features/endpoints/data.ts`, remove the unused `_id` binding by changing the projection to a named helper or a destructuring form that does not declare an unused identifier. Run the focused lint command and confirm zero warnings:

Run: `pnpm eslint src/features/endpoints/data.ts`

- [ ] **Step 3: Perform exact Figma comparison at 1440×957**

Open `/policies` and `/policies/new` in the local browser at 1440×957 beside the current Figma app. Check, in order: shell bounds, content header, page padding, title baseline, tabs, toolbar order, table x/y/width/height, every column width, row height, status treatment, footer, builder rail, every form section, every open dropdown family, all four channels, JSON dialog, and Draft/Active/Off menus.

For every mismatch, select the authoritative Figma layer, read the inspector value, update the semantic token or responsible component, and rerun its focused test. Do not tune by visual guesswork.

- [ ] **Step 4: Perform interaction and responsive review**

At the reference desktop, a small-laptop viewport, and 390×844, inspect hover, pressed, focus-visible, disabled, loading, empty, error, and reduced-motion states. Use only temporary browser captures; do not add raster visual assets to the app.

- [ ] **Step 5: Run the complete verification suite**

Run:

```bash
pnpm test:e2e
pnpm verify
git diff --check
```

Expected: Playwright passes in desktop and narrow projects; lint, typecheck, all Vitest tests, and production build pass; diff check prints no output.

- [ ] **Step 6: Scan the final touched surface for forbidden visual values and assets**

Run:

```bash
rg -n "lucide-react|className=.*\[[^]]+\]|#[0-9a-fA-F]{3,8}|\\.(png|jpe?g|webp)" src/app/'(app)'/layout.tsx src/app/'(app)'/policies src/features/app-shell src/features/policies src/components/icons
find public src -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \)
```

Expected: the first command has no forbidden matches in touched components; token hex values remain only in `globals.css`. The second command reports no newly introduced raster production asset.

- [ ] **Step 7: Commit any visual corrections with exact paths**

If Steps 3–4 changed implementation files, stage only those named shell/Policy files and commit them before the documentation commit:

```bash
git diff --name-only
git add -u -- src/app/'(app)'/policies src/features/policies src/features/app-shell src/components/icons src/app/globals.css
git commit -m "fix(policies): reconcile verified Figma differences"
```

Skip this commit when the comparison produces no implementation correction. The scoped pathspec must not stage unrelated worktree changes.

- [ ] **Step 8: Commit reconciliation documentation**

```bash
git add docs/FIGMA-DEVIATIONS.md src/features/endpoints/data.ts
git commit -m "docs(policies): record Figma reconciliation"
```

- [ ] **Step 9: Record final evidence**

Run:

```bash
git status --short --branch
git log --oneline --decorate -13
```

Expected: the branch has no uncommitted files and the task commits are visible above the approved design/spec commits.
