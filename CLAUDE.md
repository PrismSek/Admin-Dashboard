@AGENTS.md

# Design source — Figma

The UI in this repo is built from the PrismSek Figma file. Read the design before
building a screen; do not invent layouts.

- **File:** `PrismSek`
- **File key:** `84ZFM7Vv9ILAxxs1aWxcgz`
- **URL:** https://www.figma.com/design/84ZFM7Vv9ILAxxs1aWxcgz/PrismSek?node-id=132-2
- **Page:** `Screens` (node `132:2`) — every frame lives on this one page.

## Where the token is

A Figma personal access token (scope: **File content → read**) is stored **outside the
repo** at:

```
~/.prismsek-figma.env      # contains FIGMA_TOKEN=figd_...   (chmod 600)
```

Never commit the token, never paste it into a file inside this repo, and never echo it to
stdout. Source it and pass it as a header so it stays out of logs and terminal history:

```bash
set -a; . ~/.prismsek-figma.env; set +a
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/84ZFM7Vv9ILAxxs1aWxcgz?depth=2" -o file.json
```

If the file is missing, ask the user to regenerate a token at
figma.com → avatar → Settings → Security → Personal access tokens, and to write it to
that path rather than pasting it into chat.

## Useful API calls

```bash
# 1. Page + frame inventory (names, ids, sizes) — start here
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/84ZFM7Vv9ILAxxs1aWxcgz?depth=2"

# 2. Full node tree for specific frames — exact fills, type ramp, geometry
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/84ZFM7Vv9ILAxxs1aWxcgz/nodes?ids=144:3755,152:4177"

# 3. Render frames to PNG — returns short-lived S3 URLs, then download them
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/84ZFM7Vv9ILAxxs1aWxcgz?ids=144:3755&scale=2&format=png"
```

Notes learned the hard way:

- Node ids use a colon (`144:3755`); the `node-id` in a Figma URL uses a hyphen
  (`144-3755`). Convert between them.
- Rendered PNGs are ~1–3 MB each at `scale=2`. Download them concurrently — sequential
  `curl` over a dozen frames will exceed a two-minute command timeout.
- The image URLs are signed and expire. Re-request them rather than reusing an old list.
- `WebFetch` on a figma.com design URL returns nothing useful — it needs the REST API.
- The logo in this file is a **placed bitmap**, not vector paths. Exporting it as SVG just
  wraps a base64 PNG; export `format=png&scale=4` instead.

## Reading the design

Sizes in the file are drawn at roughly **0.7× web scale** (284px form columns, 36px
controls, 12px body text). Normalise when implementing — the mapping and the reasoning are
in [docs/FIGMA-DEVIATIONS.md](docs/FIGMA-DEVIATIONS.md). Extract colours from the node
tree rather than eyeballing screenshots, and add them to the token block in
`src/app/globals.css` rather than to a component.
