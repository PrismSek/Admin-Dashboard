# Admin-Dashboard

The Prismsek admin dashboard — a [Next.js](https://nextjs.org) 16 app (App Router) using React 19,
Tailwind CSS 4, and TypeScript.

## Prerequisites

- **Node.js** >= 20.9.0 (Next.js 16 requirement)
- **pnpm** 11.21.0 — the pinned package manager. If you have Node's Corepack enabled, run
  `corepack enable` and pnpm will match the `packageManager` field automatically; otherwise
  `npm install -g pnpm@11.21.0`.

No environment variables are required yet — the app reads none, so there is no `.env` file to set up.

## Running locally

```bash
pnpm install   # install dependencies from the lockfile
pnpm dev       # start the dev server
```

Open [http://localhost:3000](http://localhost:3000). The root route currently redirects to the
sign-in page, since the dashboard itself is not built yet.

To use a different port:

```bash
pnpm dev --port 4000   # or: PORT=4000 pnpm dev
```

## Other scripts

| Command          | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm dev`       | Dev server with Hot Module Reloading                              |
| `pnpm build`     | Production build                                                  |
| `pnpm start`     | Serve the production build (run `pnpm build` first)               |
| `pnpm lint`      | ESLint over the repo                                              |
| `pnpm typecheck` | `tsc --noEmit`                                                    |
| `pnpm test`      | Vitest (passes with no tests today)                               |
| `pnpm verify`    | lint → typecheck → test → build; run this before pushing          |

## Project layout

```
src/
  app/          # App Router routes — (auth) group holds sign-in, sign-up, password reset, etc.
  components/   # shared UI primitives
  features/     # feature modules (auth today)
  lib/          # shared utilities
```

See [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) for conventions, and
[AGENTS.md](AGENTS.md) for notes on this Next.js version.
