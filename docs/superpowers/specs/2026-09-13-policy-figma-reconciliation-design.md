# Policy Figma reconciliation — design

**Date:** 2026-09-13

**Status:** Design direction approved in chat; written specification awaiting review
**Scope:** Policy-first vertical slice, including the shared signed-in shell that surrounds it

## 1. Goal

Rebuild the signed-in Policy experience so it matches the currently open Figma file in
layout, color, typography, iconography, content density, and interactive states. This slice
establishes the visual foundation that the later Issues, Manage, Deployment, Settings, and
employee-installation slices will reuse.

The implementation must remain a frontend-only Next.js application. It must not invent a
backend contract or expose credentials to the browser.

## 2. Design source and precedence

The source of truth is the local Figma file currently open in the Figma desktop app:

- File: `PrismSek Local copy`
- Figma file key: `2CUGuQCAn2abgFkIz39t5V`
- Page: `Screens`
- Policy list frame: `Policies` (`398:16105`)
- Policy-authoring references: `Create policy`, `Draft-1`, `Draft-2`, `Draft-3`,
  `Content-1`, `Content-2`, `Channel hover`, all `Applies to drop down-*`, all
  `Channel drop down -*`, all `Required-*`, all `Destination-*`, all
  `Collection-*`, `Json`, and the named Clipboard, Removable media, Print, and
  Desktop channel frames.

When the current Figma file conflicts with `docs/FIGMA-DEVIATIONS.md`, the current Figma
visuals win for signed-in Policy screens. Intentional security and accessibility decisions in
that document remain in force unless this specification explicitly replaces them. The
deviation document must be updated so it no longer describes an older shell as current.

No visual value may be guessed from a screenshot. The implementation work starts by reading
the selected Figma layer's inspector values and recording each reusable value as a semantic
token in `src/app/globals.css`.

## 3. Scope

### Included

1. The signed-in application shell as it appears around the Policy frames.
2. The `/policies` list, tabs, toolbar, table, pagination, and row affordances.
3. The `/policies/new` authoring experience and every state represented by the policy-related
   Figma frames.
4. Policy-list and authoring loading, empty, and error states required by the coding
   standards, expressed in the same visual language.
5. Exact SVG icon and logo assets required by the shell and Policy screens.
6. URL-addressable list state and a validated client-side authoring form.
7. Tests, visual checks, and documentation updates for this slice.

### Deferred to later slices

- Issues and issue-detail panels.
- Manage, Deployment, Endpoints, Domains, Applications, and user/group flows.
- Settings reconciliation.
- Employee invitation and installation flows.
- Real policy persistence or a new backend API contract.
- A newly invented Dashboard screen; the Figma file shows the navigation entry but does not
  contain a Dashboard page design.

Deferred screens may reuse the shell and tokens created here. They must not cause Policy code
to import another feature's components.

## 4. Non-negotiable visual system

The following values were read directly from the selected Figma layers and form the initial
token inventory. Additional values must be extracted the same way during implementation.

| Role | Figma value |
|---|---|
| Reference desktop frame | `1440 × 957` |
| Sidebar width | `256px` |
| Sidebar background | `#0F090C` |
| Main content width at reference frame | `1184px` |
| Main header height | `48px` |
| Main header/card surface | `#FFFFFF` |
| Main canvas | `#F5F6F8` |
| Primary ink | `#111827` |
| Brand action | `#E04F27` |
| Content horizontal padding | `24px` |
| Content top/bottom padding | `26px / 32px` |
| Table frame stroke | `#E2E5EA` |
| Table header surface/stroke | `#FCFCFD / #E8EBF0` |
| Page title | IBM Plex Sans Regular, `24px`, auto line height (`31px`), `0%` tracking |
| Table header | IBM Plex Sans Medium, `12px/16px`, `0.36px` tracking |
| Table body | IBM Plex Sans Regular, `13px/17px`, `0%` tracking |
| Active nav label | IBM Plex Sans Medium, `14px/20px`, `0px` tracking, white |
| Active nav surface | white at `3%` opacity, `0.5px` radial-gradient stroke |

All colors, radii, type sizes, line heights, tracking, control heights, and recurring spacing
must be semantic tokens. Components may not contain hex colors, arbitrary Tailwind dimensions,
or one-off radius values. Third-party brand marks may retain their official inline SVG colors.

IBM Plex Sans remains self-hosted through `next/font`; no network font request is allowed.

## 5. SVG-only asset rule

All icons, logos, illustrations, and decorative assets introduced by this work must be SVG.
PNG, JPEG, WebP, icon fonts, emoji-as-icons, and canvas-drawn substitutes are not allowed.

The visible Figma icon is authoritative. Existing Lucide icons that do not match the Figma
glyph must be replaced in the touched shell and Policy surfaces with one of:

1. An exported SVG from the Figma vector layer, optimized without changing its geometry.
2. A local React SVG component whose path data matches that vector.

Each SVG must use a stable `viewBox`, inherit semantic color through `currentColor` where the
design permits, and have accessible labeling only when it conveys information. Decorative
icons use `aria-hidden`.

The Policy nav frame identifies the active icon as `carbon:policy`; the implementation must
use the matching vector rather than a visually similar Lucide shield.

## 6. Shared shell

The present shell is structurally out of date. It uses a 232px sidebar, a full-width top bar,
section labels, nested navigation chrome, and a teal active state. The current Figma Policy
frame uses a 256px dark sidebar, identity at the top of the sidebar, a flat primary navigation
list, a compact logo/utility header above only the content area, and the active treatment from
§4.

The shell will be decomposed into focused components:

- `AppShell`: server-rendered two-column frame.
- `SideNav`: pathname-aware navigation and expansion behavior only where the Figma shows it.
- `CurrentUserSummary`: avatar, name, role, and status.
- `ContentHeader`: PrismSek SVG lockup and utility SVG buttons.
- `AppIcon`: shared sizing and accessibility wrapper, not an icon library abstraction.

The sidebar retains all destinations visible in the Figma file: Dashboard, Issues, Policies,
Manage, Settings, Help Centre, and Log out. The active Policy item must match the selected
Figma variant. Other destinations will become fully implemented in their later slices; the
final all-screen project may not contain dead links.

At desktop widths the geometry must match the 1440px frame. Responsive behavior may stack or
collapse navigation below the desktop breakpoint, but it must preserve content, keyboard
access, visible focus, and minimum touch targets. Responsive adaptations are not substitutes
for matching the desktop reference.

## 7. Policy list

`/policies` remains a Server Component route that fetches fixture data through the existing
server-only policy API module and composes feature components. It must not contain the table's
business markup directly.

The screen contains:

- `Policies` page title.
- `All`, `Draft`, and `Off` tabs with Figma counts and active underline.
- Refresh, selection/delete, export, and search controls in the drawn order.
- A right-aligned `New policy` action.
- A six-column table: Policy name, Lifecycle, Enforcement mode, Deployment health, Owner,
  and Last change.
- The complete 20-row reference dataset at the default Figma state.
- Footer copy and page-size/pagination controls matching the Figma.

List state is shareable URL state:

- `tab=all|draft|off` (omit `all` from canonical URLs)
- `q=<search>`
- `page=<positive integer>`
- `policy=<policy id>` for an open policy-detail surface when a corresponding Figma state is
  used

Unknown values normalize to the default instead of crashing. Search is case-insensitive.
Changing a filter returns pagination to page one. Table rows and row actions remain keyboard
reachable.

The existing default of ten rows per page must change to the Figma's twenty-row default.

## 8. Policy authoring

`/policies/new` is one authoring route, not a separate route for every Figma frame. The Figma
frames represent states of the same form. The route page stays thin and renders a dedicated
Policy feature component.

The authoring component uses React Hook Form with the existing Zod policy schema as the source
of truth. It supports the visible seven-step rail and the complete state matrix:

1. Start: policy name and description.
2. Who: scope and every `Applies to` selection state.
3. Where: Clipboard, Removable media, Print, and Desktop Apps channel selection states.
4. Data: content-mode, finding, destination, collection, target, application, and channel-
   specific condition states.
5. Enforcement & Message: action, required fallback, reason code, and user-facing message.
6. End User Notification: the notification controls shown by the current Figma frame set.
7. Finish: JSON preview/bundle and deploy-as state.

The named Figma states map to real controls:

- `Channel hover` and `Channel drop down -*` become the open/hover/focus states of one channel
  selector.
- `Required-*`, `Destination-*`, `Collection-*`, and `Applies to drop down-*` become selector
  states, not duplicated pages.
- Clipboard, Removable media, Print, and Desktop frames render only their relevant condition,
  exception, target, printer/device, application, or action controls.
- `Desktop channel apps selection` is an accessible multi-select surface rendered with SVG
  application marks where the Figma includes them.
- `Draft-1`, `Draft-2`, and `Draft-3` are the open `Deploy as` menu states for Draft, Active,
  and Off; they do not create three routes.
- `Json` is an in-page review surface and must never expose credentials or unvalidated input.

Conditional fields retain their values when temporarily hidden, but only fields valid for the
selected channel enter the serialized preview. The form warns before losing unsaved work.

No real save is claimed until a backend contract exists. The final submit control may validate
and show the designed local outcome, but it must not pretend that data persisted. This status
must be explicit in the UI and in `FIGMA-DEVIATIONS.md`.

## 9. Content and data

No user-facing Policy copy may be inline in route or component files. Labels, descriptions,
empty/error messages, fixture policy names, and routes live in feature-owned content/data
modules. The Figma wording is reproduced exactly except where it conflicts with a documented
security or accessibility requirement.

Fixture reads remain server-only. Values crossing form, URL, or serialization boundaries are
parsed with Zod. The browser does not receive a PrismSek API credential, and Policy components
do not call a backend directly.

## 10. Loading, empty, and error behavior

The list needs three visually distinct states:

- Loading: table-shaped skeleton rows; no generic spinner.
- Empty: Figma-aligned empty table with a `New policy` recovery action.
- Error: actionable load failure with retry and a correlation-safe message; raw errors never
  reach the UI.

Form validation is inline and associated with its field. Dropdowns, dialogs, and any drawer
must trap/restore focus as appropriate, close with Escape, and retain an obvious keyboard
focus treatment.

## 11. Testing and visual acceptance

Implementation follows red-green-refactor for new behavior.

Automated coverage includes:

1. URL parsing and canonicalization for Policy tabs, search, page, and detail state.
2. Zod validation and channel-dependent serialization.
3. The full channel state matrix, including retaining hidden field values while omitting them
   from serialized output.
4. Accessible names, keyboard navigation, focus restoration, and form errors.
5. Route rendering for `/policies` and `/policies/new`.

Visual acceptance is performed at `1440 × 957` against the selected Figma frames. Checkpoints
cover the shell, default list, tab/filter state, empty/error state, base authoring page, each
channel, each open selector family, JSON review, and all deploy-as menu variants. The final
review also checks a small-laptop viewport and a narrow viewport for overflow and keyboard
access.

Completion requires a fresh successful `pnpm verify` run. The existing ESLint warning in
`src/features/endpoints/data.ts` is outside the Policy feature but should be removed before the
project is described as warning-free.

## 12. Documentation

Update `docs/FIGMA-DEVIATIONS.md` to:

- identify the current Figma file key and review date;
- replace the obsolete signed-in shell description;
- record the SVG-only asset decision;
- record any intentional accessibility or responsive difference from literal Figma geometry;
- state clearly that Policy persistence remains unavailable until the backend contract exists.

No new intentional visual deviation may be introduced silently.

## 13. Acceptance criteria

The Policy slice is complete only when:

- the shell, Policy list, and Policy authoring screens visually match their current Figma
  references at the desktop reference size;
- every reusable design value is a token and touched components contain no hardcoded visual
  values;
- every introduced visual asset is SVG;
- approximate Lucide icons are absent from the touched shell and Policy surfaces;
- all Figma Policy states are reachable through real controls;
- list state is URL-addressable and form data is Zod-validated;
- loading, empty, error, hover, pressed, and focus states are present;
- no API persistence is falsely represented;
- the full verification command passes with no new warning or failure;
- the deviation document accurately records the final result.
