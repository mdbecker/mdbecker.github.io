# Beckerfuffle favicon package

Drop the files in this directory into the Jekyll site root (or adjust paths if you keep static assets elsewhere).

Then copy the contents of `HEAD_SNIPPET.html` into the site's shared `<head>` include/layout.

Included:
- `favicon.ico` — multi-resolution 16/32/48px browser fallback.
- `favicon.svg` — scalable modern browser favicon using the exact generated artwork.
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon-96x96.png`.
- `apple-touch-icon.png` — 180×180 Apple home-screen icon.
- `android-chrome-192x192.png`, `android-chrome-512x512.png` — PWA/Android "any" icons.
- `maskable-icon-192x192.png`, `maskable-icon-512x512.png` — full-background PWA maskable icons with safe padding.
- `safari-pinned-tab.svg` — monochrome legacy Safari pinned-tab mask.
- `mstile-150x150.png` + `browserconfig.xml` — legacy Microsoft tile support.
- `site.webmanifest` — modern web-app icon manifest.
- `favicon-master.png` — 1024×1024 master for future regeneration.

Theme colors:
- Paper/background: `#FFFFF8`
- Brand orange: `#B34A16`
- Deep teal accent: approximately `#245D67`

Notes:
- The ordinary favicon files preserve transparent space around the generated rounded tile.
- Apple/PWA icons use a full warm-paper background so platforms do not substitute an unexpected background color.
- Maskable variants keep the important mark inside a conservative safe zone so circular/squircle OS masks should not clip it.
