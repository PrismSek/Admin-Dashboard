# PrismSek Admin Dashboard — Coding Standards

Standards for the PrismSek customer-admin dashboard: a Next.js frontend where customer
administrators author **DLP policies** and review **analytics**.

This document is normative. If code and this document disagree, the code is wrong — fix the
code, or change this document in the same PR with a reason.

**Last verified against live registry data: 2026-08-12.**

---

## 1. Scope and architecture

**This repository is frontend-only.** It renders UI and talks to the PrismSek backend API. It
owns no database, no business logic, and no source of truth.

SSR is required, so this is a **deployed Node server**, not a static export. `next export` /
`output: 'export'` is forbidden — it disables SSR, and every rule below assumes a server.

Three tiers, and code belongs to exactly one:

| Tier | Runs | May do | May never do |
|---|---|---|---|
| **Server Components** | Node, per request | Read cookies/headers, call the PrismSek API with credentials, render | Use hooks, `window`, event handlers |
| **Client Components** | Browser | Interactivity, local state, forms, charts | Read secrets, call the PrismSek API directly with a token |
| **Route Handlers / Server Actions** | Node | Proxy mutations to the API, revalidate caches | Contain business rules the backend should own |

The dashboard never holds an API credential in browser-reachable code. Browser → our Node
server → PrismSek API. This is not optional; see §12.

---

## 2. Pinned toolchain

Exact versions verified on the npm registry today. Pin these in `package.json` — no `^` on
`next`, `react`, or `typescript`.

| Package | Version | Note |
|---|---|---|
| Node | **24.17.0** | Next 16 requires ≥20.9. Pin via `.nvmrc`. |
| pnpm | latest | Package manager. Not npm, not yarn. |
| `next` | **16.3.0** | Turbopack is the default bundler. |
| `react` / `react-dom` | **19.2.8** | |
| `typescript` | **6.0.3** | **Not 7.x — see the trap below.** |
| `eslint` | **9.39.5** | Flat config. **Not 10.x — see trap 3.** |
| `tailwindcss` | 4.3.3 | v4 = CSS-first config. |
| `zod` | 4.4.3 | |
| `@tanstack/react-query` | 5.101.4 | Client-side server-state only. |
| `@tanstack/react-table` | 9.1.2 | Headless — we own the markup. |
| `react-hook-form` | 7.85.0 | + `@hookform/resolvers` 5.7.1 |
| `nuqs` | 2.9.5 | URL-as-state. |
| `recharts` | 3.10.1 | |
| `vitest` | 4.1.10 | |
| `@playwright/test` | 1.62.1 | |

### Trap 1 — do not install TypeScript 7

`typescript@7.0.2` is `latest` on npm. **Do not use it.** TypeScript 7 is the Go-native
compiler; it ships without a stable programmatic API, and `typescript-eslint@8.67.0` declares
`typescript: ">=4.8.4 <6.1.0"`. Installing TS 7 makes `tsc` succeed while every type-aware
lint rule crashes at runtime.

Pin `typescript@6.0.3` — the newest release inside the supported range. Revisit when
typescript-eslint ships TS 7 support (expected against the stable API in TS 7.1).

### Trap 3 — do not install ESLint 10

Verified by installing it: ESLint 10 crashes on this project. `eslint-config-next`
pulls in `eslint-plugin-react`, whose newest release (7.37.5) declares
`eslint: "^3 || … || ^9.7"` — ESLint 10 is outside every published version's peer range.
The failure is a hard crash on any lint run:

```
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
```

Pin `eslint@9.39.5`, the newest 9.x. Revisit when `eslint-plugin-react` ships ESLint 10
support. Same lesson as trap 1: on this stack the newest release is repeatedly not the
usable one — check the peer ranges of transitive plugins before bumping a linter or compiler.

### Trap 2 — `next lint` no longer exists

Next.js 16 removed the `next lint` command, and `next build` no longer runs ESLint. Linting is
a separate CI gate or it silently does not happen.

```jsonc
// package.json
"scripts": {
  "dev":        "next dev",
  "build":      "next build",
  "start":      "next start",
  "lint":       "eslint .",
  "typecheck":  "tsc --noEmit",
  "test":       "vitest run",
  "test:e2e":   "playwright test",
  "verify":     "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
}
```

`pnpm verify` must pass before any PR merges. CI runs exactly that command — no bespoke CI
steps that can drift from what developers run locally.

---

## 3. Next.js 16 rules

These are version-specific and easy to get wrong from muscle memory or older tutorials.

**Route params are async.** Synchronous access is removed.

```tsx
// ✅
export default async function PolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// ❌ throws in Next 16
export default function PolicyPage({ params }: { params: { id: string } }) {
  const id = params.id;
}
```

The same applies to `searchParams`, `cookies()`, `headers()`, and `draftMode()` — all `await`.

**Request interception lives in `proxy.ts`**, not `middleware.ts`. It runs on the Node runtime
and exports a function named `proxy`. `middleware.ts` is deprecated and will be removed.

**Caching is opt-in via Cache Components.** Enable it once and cache deliberately:

```ts
// next.config.ts
const nextConfig = { cacheComponents: true };
export default nextConfig;
```

Everything is dynamic by default. Add `"use cache"` only to things that are genuinely shared
and stable — the classifier catalog, built-in policy templates, enum lookups. **Never cache
per-tenant data.** In a multi-tenant security product, a mis-scoped cache key leaks one
customer's data to another. If a value depends on the current tenant or user, it does not get
`"use cache"`.

**Cache invalidation:**
- `revalidateTag(tag, profile)` — the profile argument is now required. Use `'max'` unless
  there's a reason not to.
- `updateTag(tag)` — Server Actions only; read-your-writes. Use this after a policy edit so
  the admin sees their own change immediately.
- `refresh()` — Server Actions only; refreshes uncached data without touching the cache.

**Parallel route slots require an explicit `default.js`** or the build fails.

**Images:** `images.remotePatterns` (not the deprecated `images.domains`). Default
`images.qualities` is now `[75]`; other `quality` values are coerced.

**React Compiler** (`reactCompiler: true`) is stable but off. Leave it off for now — it adds
Babel to the build and slows it down. Revisit if we hit measured render performance problems.
Do not hand-scatter `useMemo`/`useCallback` in anticipation of it.

---

## 4. Project structure

Feature-first. Colocate by domain, not by file type. A developer working on policies should
find ~everything about policies in one directory.

```
src/
  app/                          # routing only — thin
    (auth)/login/page.tsx
    (dashboard)/
      layout.tsx
      policies/
        page.tsx                # list
        new/page.tsx
        [id]/page.tsx           # edit
      analytics/page.tsx
    api/                        # route handlers (BFF proxy)
  features/
    policies/
      components/               # PolicyRuleBuilder, PolicyList, ...
      schemas.ts                # zod — single source of truth
      types.ts                  # inferred from schemas
      api.ts                    # server-side fetchers
      actions.ts                # "use server" mutations
      hooks/
    analytics/
      components/
      api.ts
  components/ui/                # shadcn/ui primitives — unmodified
  components/                   # shared app-level composites
  lib/
    api-client.ts               # the ONE place that calls the PrismSek API
    auth.ts
    utils.ts
  styles/globals.css
```

Rules:
- **`app/` stays thin.** A `page.tsx` fetches data and composes feature components. Business
  logic and markup live in `features/`.
- **No cross-feature imports.** `features/analytics` must not import from
  `features/policies/components`. If both need something, it moves to `components/` or `lib/`.
- **One component per file**, named the same as the file.
- **Files over ~250 lines are a smell.** A 900-line rule builder is not one component; split
  it until each piece has one job you can name in a sentence.

---

## 5. TypeScript

`strict: true`, plus:

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "verbatimModuleSyntax": true
}
```

- **`any` is banned.** Use `unknown` and narrow. If you truly need an escape hatch, it is
  `// eslint-disable-next-line` with a comment explaining why — reviewable, not invisible.
- **No non-null assertions (`!`).** Narrow properly, or throw with a real message.
- **No type assertions (`as`) on API data.** Parse it (§6). `as` on unvalidated input is a lie
  the compiler believes.
- **Derive, don't duplicate.** `type Policy = z.infer<typeof policySchema>` — never hand-write
  a type that mirrors a schema; they drift.
- **Discriminated unions over optional-field soup.** A policy action is
  `{ kind: 'block' } | { kind: 'warn'; justificationRequired: boolean } | ...`, not one object
  with eight optional fields.
- Prefer `type` for object shapes; `interface` only when declaration merging is needed.

---

## 6. Data, validation, and the API boundary

**Every value crossing a boundary is parsed with zod.** Boundaries: API responses, form input,
URL search params, `localStorage`, env vars.

```ts
// features/policies/schemas.ts
export const policySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean(),
});
export type Policy = z.infer<typeof policySchema>;
```

```ts
// features/policies/api.ts  — server only
import 'server-only';

export async function getPolicy(id: string): Promise<Policy> {
  const res = await apiClient(`/policies/${id}`);
  return policySchema.parse(res); // throws loudly on backend contract drift
}
```

- Mark server-only modules with `import 'server-only'`. It turns an accidental client import
  into a build error instead of a leaked secret.
- **`lib/api-client.ts` is the only module that issues requests to the PrismSek API.** It owns
  base URL, auth header, timeout, retry, and error normalization. No `fetch('https://api...')`
  anywhere else.
- Validate env vars once at startup with zod. A missing `PRISMSEK_API_URL` must fail the boot,
  not surface as `undefined` in a URL three screens deep.

**Fetching strategy:**
- Default to fetching in **Server Components**. It's faster, keeps credentials server-side, and
  ships less JS.
- Use **TanStack Query** only for genuinely client-side server-state: polling live incident
  counts, infinite scroll, optimistic updates. It is not the default.
- Mutations go through **Server Actions**, then `updateTag()` so the admin sees their write.

Until the backend exists, mock at the network layer with **MSW** — same handlers for dev,
Vitest, and Playwright. Do not scatter `if (mock)` branches through feature code.

---

## 7. State

Ranked. Use the first one that works.

1. **URL** — filters, sort, pagination, active tab, date range. Use **nuqs**. An admin filtering
   analytics to "critical findings, last 7 days" must be able to paste that link to a colleague.
   This is the single highest-leverage rule in a dashboard; treat local `useState` for a filter
   as a bug.
2. **Server Component props** — data fetched on the server, passed down.
3. **`useState` / `useReducer`** — local, ephemeral UI state.
4. **React Context** — cross-cutting and rarely-changing only (theme, current tenant).
5. **A global store** — we do not have one, and do not add one without discussion.

Never mirror server data into client state. `useEffect` + `setState` to copy a prop is a bug.

---

## 8. Forms — the policy builder

Policy authoring is the hardest UI in this app. It gets the strictest rules.

- **`react-hook-form` + `zodResolver`.** One zod schema is the contract for the form, the
  Server Action, and the API type. Never validate the same rule in two places.
- **Uncontrolled by default** — register inputs; do not re-render the whole builder on
  keystroke. The rule builder will have many fields and controlled-everything will feel slow.
- **Nested rule groups use `useFieldArray`** with **stable `field.id` keys** — never the array
  index. Index keys corrupt state the moment a user deletes a condition from the middle.
- **Validate on the server too.** Client validation is a UX affordance, not a security control.
  Every Server Action re-parses its input with the same schema.
- **Never lose a half-written policy.** These are long forms. Warn on navigation with unsaved
  changes; drafts should survive an accidental back-button.
- **Show what a policy will do before it saves.** A DLP policy that silently blocks all outbound
  email is a customer-visible outage. Surface match counts / affected scope in the UI.

---

## 9. Tables

**TanStack Table** (headless) with our own markup — not a pre-styled data grid.

- Sorting, filtering, and pagination are **server-side** and expressed in the **URL**. Do not
  fetch 10,000 findings and paginate in the browser.
- Column definitions live in a `columns.tsx` next to the table.
- Every table needs three designed states: **loading** (skeleton, not a spinner), **empty**
  (with the action that fixes it), and **error** (with retry). "Empty" and "failed to load"
  must never look identical — in a security dashboard, "no findings" versus "we couldn't check"
  is a critical distinction.
- Row actions are keyboard reachable. Hover-only affordances are inaccessible.

---

## 10. Styling and UI

- **Tailwind v4**, configured **in CSS** via `@theme` in `globals.css`. There is no
  `tailwind.config.js` by default in v4 — don't create one out of habit.
- **shadcn/ui** for primitives, vendored into `components/ui/`. Treat them as our code: edit
  freely, but keep changes deliberate.
- **Design tokens only.** `text-destructive`, not `text-red-600`. Severity colors
  (low/medium/high/critical) are semantic tokens defined once. Hardcoded hex in a component is
  a review rejection.
- **No arbitrary values** (`w-[437px]`) without a comment justifying the magic number.
- Compose classes with `cn()` (clsx + tailwind-merge). Never build class strings with template
  interpolation of dynamic fragments — Tailwind's scanner can't see them.
- **Dark mode from day one**, via tokens. Retrofitting it is far more expensive.
- Severity must never be encoded by **color alone** — pair it with a label or icon. ~8% of men
  have some form of color-vision deficiency, and this is a product where severity drives action.

**Charts:** load the `dataviz` skill before writing the first chart. Analytics is half this
product; the charts should read as one coherent system rather than Recharts defaults.

---

## 11. Errors and loading

- `error.tsx` per route segment; `global-error.tsx` at the root. A crashed chart must not blank
  the page.
- `loading.tsx` + `<Suspense>` for streaming. Stream the shell immediately; let slow analytics
  queries fill in.
- **Skeletons, not spinners**, for content whose shape we know.
- **Never render a raw API error to an admin.** Map to an actionable message. Log the detail
  server-side with a correlation ID and show the ID — that's what a support ticket needs.
- An empty `catch {}` is a review rejection.

---

## 12. Security

This is a security product. The dashboard's own posture is part of the pitch.

- **No secrets in client code.** `NEXT_PUBLIC_*` is public — treat it as printed on a billboard.
  API tokens live in server-only modules.
- **Session cookies:** `httpOnly`, `Secure`, `SameSite=Lax`. Never put a token in
  `localStorage`.
- **Authorization is enforced server-side**, in `proxy.ts` and in every Server Action. Hiding a
  button is UX, not access control. Assume a customer admin will try the URL directly.
- **Tenant isolation:** every server-side fetch derives its tenant from the session, never from
  a URL parameter or request body. A `?tenantId=` that the server trusts is a cross-tenant data
  breach.
- **Set a Content-Security-Policy.** No `unsafe-inline`, no `unsafe-eval`.
- **Never log policy content, findings, or matched data** — that payload is by definition the
  customer's sensitive data. Log identifiers, not contents.
- **Redact by default in the UI.** Matched sensitive values (card numbers, SSNs, keys) render
  masked, with reveal gated on an explicit action.
- `pnpm audit` runs in CI.

---

## 13. Testing

Balanced, not dogmatic. Coverage percentage is not a target.

- **Vitest + React Testing Library** for logic and components. Test behavior through the
  accessible interface (`getByRole`), not implementation details.
- **Heaviest coverage on policy logic** — rule serialization, condition evaluation, schema
  validation. These are pure functions and cheap to test exhaustively. A policy that silently
  serializes wrong is the worst bug this product can ship.
- **Playwright** for critical journeys: log in → create a policy → verify it appears; apply an
  analytics filter → confirm the URL is shareable.
- **MSW** for network mocking in both. No hand-rolled `fetch` stubs.
- **Every bug fix starts with a failing test** that reproduces it.
- Accessibility assertions (`axe`) in component tests for interactive components.

---

## 14. Accessibility

Non-negotiable — many PrismSek customers are regulated and will ask.

- Target **WCAG 2.2 AA**.
- Semantic HTML first. A `<div onClick>` is a bug; use `<button>`.
- Everything reachable and operable by keyboard; visible focus rings (never `outline: none`
  without a replacement).
- Labels on all inputs. Placeholders are not labels.
- Modals trap focus and restore it on close.
- Async updates announce via live regions.
- Respect `prefers-reduced-motion`.

---

## 15. Naming

| Thing | Convention | Example |
|---|---|---|
| Component files | `PascalCase.tsx` | `PolicyRuleBuilder.tsx` |
| Other files | `kebab-case.ts` | `api-client.ts` |
| Directories | `kebab-case` | `features/policy-builder/` |
| Hooks | `useThing` | `usePolicyDraft` |
| Server Actions | verb-first | `createPolicy`, `disablePolicy` |
| Booleans | `is/has/should` | `isEnabled`, `hasUnsavedChanges` |
| Event handlers | `handleX` (prop: `onX`) | `handleSubmit` / `onSubmit` |
| Zod schemas | `thingSchema` | `policySchema` |
| Constants | `SCREAMING_SNAKE` | `MAX_RULE_DEPTH` |

Use the domain's words exactly as the product uses them — policy, rule, condition, action,
classifier, finding, incident. If the UI says "finding" and the code says "alert", someone will
eventually conflate two different things. Agree on the vocabulary once and keep it everywhere.

---

## 16. Comments

Comment **why**, never **what**. Code says what it does; comments explain the reason a reader
can't recover — a workaround, a spec constraint, a non-obvious tradeoff.

```ts
// ✅ The API returns severity as an int; the UI contract is a string enum.
//    Mapping here keeps the coercion in one place instead of at every call site.

// ❌ Loop over the policies
```

Delete commented-out code. Git remembers.

---

## 17. Git and review

- Branches: `feat/`, `fix/`, `chore/`, `refactor/` + short description.
- **Conventional Commits**: `feat(policies): add nested condition groups`.
- Small PRs. A 2,000-line PR does not get reviewed; it gets approved.
- `pnpm verify` green before requesting review.
- PR description: what changed, why, how it was verified. Screenshots for UI changes.

---

## 18. Anti-patterns — automatic review rejection

1. `any`, or `as` on unvalidated API data
2. `"use client"` at the top of a page just to make a hook work — push it to the leaf
3. `useEffect` + `fetch` in a Client Component where a Server Component would do
4. Filter/sort/pagination state in `useState` instead of the URL
5. Hardcoded colors or spacing instead of tokens
6. `fetch()` to the PrismSek API outside `lib/api-client.ts`
7. Business logic in `app/**/page.tsx`
8. Empty `catch {}`, or a raw error object rendered to the user
9. Array index as a React `key` in the rule builder
10. Any tenant identifier read from the URL or body and trusted server-side
11. Files that have quietly grown past ~250 lines and now do three things
12. `installing typescript@7` (§2)

---

## Open decisions

Not settled yet; resolve before the relevant work starts:

- **Authentication** — SSO/OIDC? Session cookie from the PrismSek API? Drives `proxy.ts` and
  `lib/auth.ts`.
- **Backend API contract** — does an OpenAPI spec exist? If so we generate types from it and
  §6's hand-written schemas shrink to validation-only.
- **Deployment target** — Vercel or self-hosted container? Affects caching and CSP setup.
- **Multi-tenancy in the URL** — `/t/:tenantId/policies` vs. tenant from session only.
- **i18n** — needed at launch, or English-only?
