# Beckerfuffle favicon package (v2)

This rebuild improves true favicon-size legibility.

## What changed

- Small favicon assets (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon-96x96.png`, `favicon.svg`) now use a **purpose-built micro mark**:
  - full orange rounded-square tile
  - large cream serif **B**
  - **no underline**
  - minimal padding

- Larger icons (`apple-touch-icon.png`, `android-chrome-*.png`, `maskable-icon-*.png`, `mstile-150x150.png`) keep the richer, more editorial original icon, but it is scaled larger within the canvas than before.

- `favicon.svg` is now a **true vector favicon**, not an embedded PNG.

## Install

Drop these files into your site root (or adjust paths), then paste `HEAD_SNIPPET.html` into your shared `<head>` include/layout.
