# Figma deviations — sign-in screens

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

## Status of the build

Frontend only, as scoped. No auth API exists yet, so every submit validates with its zod
schema and then advances the flow; nothing authenticates. Each stub is commented at the
call site with what it should do instead.

`pnpm verify` (lint, typecheck, test, build) passes. All 12 routes render with no console
errors, checked at 1440×900.
