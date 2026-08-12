# Figma deviations

Every place the built sign-in flow differs from the PrismSek Figma file
([`84ZFM7Vv9ILAxxs1aWxcgz`](https://www.figma.com/design/84ZFM7Vv9ILAxxs1aWxcgz/PrismSek?node-id=132-2),
page "Screens", file last modified 2026-08-12).

Nothing here is accidental. Each item is a decision to accept or reject — reject one and
it gets changed back.

---

## 1. Sizing normalised to web scale

**What Figma says.** The frames are 1440×800, but the content is drawn at roughly 0.7×
of normal web scale: the form column is 284px wide, inputs and buttons are 36px tall,
body text and field labels are 12px, and headings are 18px.

**What was built.** Same layout, same proportions, same colours — sizes mapped onto a
standard scale:

| | Figma | Built |
|---|---|---|
| Form column | 284px | 400px |
| Control height | 36px | 44px |
| Body / labels | 12px | 14px |
| Heading | 18px | 24px |
| Button label | 15px | 16px |
| Footer / legal | 10–12px | 12px |

**Why.** 12px is below the practical minimum for readable body text, and 36px controls
fall short of the 44px minimum target size in WCAG 2.2 — which the project targets at AA
level (`CODING_STANDARDS.md` §14). Implemented literally the screens look cramped at
1440px.

**To change it.** All of these are tokens in `src/app/globals.css` — `--text-*`,
`--size-control`, `--width-auth-column`. Retune there; no component changes.

---

## 2. The "Forgot password" entry screen was missing — it has been built

The Figma flow has no screen where a user types their email to request a reset. The
frame named `Sign in- Password forget` (163:147) is actually the *"Check your email"*
confirmation. So "Forgot password?" led nowhere.

Built `/forgot-password` in the established split-layout style: heading, subtitle, one
email field, submit, "Back to sign in".

**Security note for whoever wires the API:** always advance to the confirmation screen,
whether or not the address matches an account. Branching on "account exists" turns this
form into an account-existence oracle — exactly the kind of leak a DLP product should not
ship.

---

## 3. Two frames are named for the wrong screen

Not a code deviation — flagging it so the file can be corrected, since the names are
misleading when picking up the work.

| Frame | Name in Figma | What it actually shows | Built as |
|---|---|---|---|
| 163:147 | `Sign in- Password forget` | "Check your email" (reset link sent) | `/forgot-password/sent` |
| 152:4268 | `Sign in- Password success` | "You're signed in" (post-auth) | `/sign-in/success` |

---

## 4. Link colour unified to brand orange

**Figma:** "Forgot password?" is `#4285F4` and "Contact Administrator" is the same blue,
while every other link is brand orange `#FF4300`.

**Built:** all links use `--color-brand`.

**Why.** `#4285F4` is exactly Google's brand blue — almost certainly picked up from the
"Continue with Google" button asset rather than chosen. A blue link on an otherwise
orange system reads as a different kind of control.

The Google "G" mark keeps its own four brand colours, as Google's brand terms require.

---

## 5. "Continue with GitHub" font corrected

**Figma:** renders in IBM Plex Sans **Condensed**; the SSO and Google buttons above it
use regular IBM Plex Sans.

**Built:** all three use regular. No condensed weight is loaded anywhere.

---

## 6. Email masking applied consistently

**Figma:** the password screen masks the address (`j**************@gmail.com`) but the
invalid-password screen shows `salvirauthan077@gmail.com` in full. The create-account
screen uses a *masked* address as an input placeholder.

**Built:** every screen that echoes an address to an unauthenticated visitor masks it,
via `maskEmail()` in `src/features/auth/utils.ts`. The create-account placeholder is
`you@company.com` — a masked string makes no sense in a field the user types into.

**Why.** The visitor has not proved they own the address yet. Showing it in full on the
failure path confirms a valid account to anyone who guessed it.

---

## 7. Heading weight unified to 400

**Figma:** sign-in and password use weight 300 (Light); create-account, suspended,
signed-in, check-email and invitation-expired use 400.

**Built:** 400 everywhere — the majority case, and it holds contrast better at 24px.

**To change it.** One value: the `--text-heading` block in `globals.css`, plus the weight
in `AuthHeading`.

---

## 8. Gradient artwork rebuilt in CSS

**Figma:** the split-layout artwork is a composition of blurred ellipses, a rotated bar
and a noise overlay.

**Built:** reproduced with CSS radial/linear gradients and an inline SVG noise layer in
`auth-artwork.tsx`, using the `--color-art-*` tokens.

**Why.** Exporting it is a ~3 MB bitmap that has to be re-cut per breakpoint. The CSS
version is a few hundred bytes, stays crisp at any viewport, and re-themes for dark mode.

**Caveat — this is the loosest match in the build.** It reads as the same composition and
palette, but it is not pixel-identical: the source has hand-placed soft-light blending
this approximates. If exactness matters more than weight, export the artwork node as PNG
and swap the component's body for an `<Image>` — the layout around it does not change.

---

## 9. Small structural choices

- **Invitation rows** are separated by whitespace, matching the design. The chevron on
  the Organization row was omitted — it implies a drill-in that has no destination yet.
- **Invitation buttons** are an equal two-column grid; in Figma "Accept" is visually
  wider than "Decline".
- **Invitation screen has a screen-reader-only `<h1>`.** The design shows no visible
  title, but a page with no heading is a real accessibility defect.
- **Form column is centred** in the left half. Figma places it slightly right of centre
  (starting at x=280 of a 720px half).
- **Error text** uses `--color-danger`, which currently resolves to the same `#FF4300` as
  the primary button, exactly as in Figma. It is a separate token so error styling can
  diverge later without touching a component — worth doing, since an error message and a
  call-to-action currently share a colour.

---

## Not in the design at all

Raised because they are cheaper to design now than to retrofit into a live auth flow:

- **No MFA / OTP step.** Unusual for an enterprise DLP product, and the identifier-first
  flow has a natural slot for it between password and success.
- **No "remember this device"** on the password screen.
- **No rate-limit or account-lockout state** after repeated failed attempts.
- **No generic error state** for "the auth service is unreachable" — distinct from
  "wrong password", and the two must not look alike.

---

---

# Signed-in application

The 44 remaining frames on the same Figma page — Settings, Endpoints and Manage.

## 10. Two brand oranges and two grey ramps — both kept

The auth screens and the signed-in screens do not share a palette:

| | Auth screens | App screens |
|---|---|---|
| Primary orange | `#FF4300` | `#F2601A` |
| Body text | `#222C3A` | `#111827` |
| Muted text | `#6A727E` | `#667085` |
| Page background | `#F7F7F7` | `#FAF9F5` (warm) |

Both sets are kept as separate tokens (`--color-brand` / `--color-brand-accent`, and the
`--ps-ink-*` ramp alongside `--ps-grey-*`) and each is used in its own context, rather than
silently merging them and changing one half of the product.

**This is worth a decision.** Two primary oranges in one product is almost certainly
unintended — a user goes from an orange "Sign in" button to a differently-orange "Invite
user" button within seconds. Pick one and it changes in a single line of `globals.css`.

## 11. App frames are drawn at 1:1 — not rescaled

Unlike the auth frames (§1), the signed-in frames use realistic sizes: 14px nav and table
text, 13px descriptions, 16px card titles. These were implemented as drawn. The auth
normalisation happens to land on the same 14px body size, so the two halves now agree.

## 12. Dashboard, Incidents and Policies have no frames

All three are in the sidebar but nothing in the file designs them. The routes exist so the
shell is navigable, and each renders an explicit "this screen has not been designed yet"
placeholder rather than invented filler — a fabricated security dashboard would be worse
than an honest gap, and this keeps the remaining design work visible.

Notably, **Policies has no frames at all** — which is one of the two pillars you described
for this product.

## 13. Twelve department frames became one parameterised route

The file has a frame per department per tab (Finance/Legal/Engineering/Sales/IT
Operations/Executive Pilot × users/endpoints). They are the same layout with different
data, so they are one route — `/manage/[department]?tab=users|endpoints` — pre-rendered for
all six departments via `generateStaticParams`.

Only the two Finance frames were read in detail; the other ten were treated as data
variants. If any of them differs structurally, it will need revisiting.

## 14. "Add endpoints" is a drawer, not a page

Frame `Add endpoints` (330:2294) shows a right-hand drawer over the department screen, so
it is implemented as `?panel=add-endpoints` on that route rather than a separate URL. Same
for `?panel=add-users`.

## 15. "Add endpoints" removed from the Endpoints header

An earlier pass added an "Add endpoints" button to the Endpoints page header. The design
has no such button — that page is explicitly labelled a read-only fleet workspace, and
endpoints join a group from Manage. Removed.

## 16. Table header casing follows the design's inconsistency

The Users and Access table sets its headers in caps (`NAME / EMAIL`); every other table
uses sentence case. Reproduced as drawn via `<THead case="caps">`, but it is more likely an
oversight than intent — worth unifying.

## 17. Dialogs and wizard steps live in the URL

Invite/suspend/delete user, change password, the add-members drawer and the four SAML setup
steps are all driven by search params (`?dialog=`, `?panel=`, `?step=`). This keeps them
server-rendered and shareable, and makes the wizard's "your progress is saved" promise real
rather than cosmetic.

## 18. Not built

- **`Endpoints more filters` (297:7296)** — the "More filters" button renders but does not
  open the panel.
- **`Endpoints-deployment drop down` (302:2286)** — deployment stage rows show the chevron
  but do not expand.
- **Four duplicate `Endpoints` frames** (294:5813, 294:6162, 294:6511, 294:6860) — appear
  to be filter/pagination variants of the same list, already covered by the live filters.
- **`Background` (281:4126)** — could not tell what screen this is meant to be.

---

## Status of the build

Frontend only, as scoped. No API exists, so forms validate with their zod schema and then
advance; nothing persists. Every stub is commented at the call site with what it should do
instead, including the ones that matter: SSO activation must refuse unless the connection
test passed, org/user deletion must require typed confirmation, and password reset must not
reveal whether an account exists.

Data is fetched in Server Components from `server-only` modules, so swapping fixtures for
real API calls does not change any component. Filters, tabs, pagination, dialogs and wizard
steps are all URL state.

`pnpm verify` (lint, typecheck, test, build) passes. All 30 routes render with no console
errors, checked at 1440×900 and 1500×950.
