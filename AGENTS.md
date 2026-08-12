<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PrismSek project rules

Read these before writing code in this repo:

- **[docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)** — normative. Pinned toolchain
  (note: **TypeScript 6.0.3, not 7.x**, and **ESLint 9.39.5, not 10.x** — both newer
  versions break the lint stack), project structure, and the anti-patterns list that
  fails review.
- **[docs/FIGMA-DEVIATIONS.md](docs/FIGMA-DEVIATIONS.md)** — every intentional difference
  between the built auth screens and the Figma file.

Two rules that are easy to violate by habit:

1. **No hardcoded design values.** Every colour, radius, font size and control height is
   a token in `src/app/globals.css`. A hex code, `text-[15px]`, or `rounded-[10px]` in a
   component is a bug. Dark mode is planned, and hardcoded values will not re-theme.
2. **No user-facing copy inline.** Auth strings and routes live in
   `src/features/auth/content.ts`.

Run `pnpm verify` (lint, typecheck, test, build) before considering work done.
