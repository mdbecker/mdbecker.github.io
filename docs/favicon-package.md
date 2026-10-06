# Beckerfuffle favicon package (v3)

This version is specifically tuned to fix the remaining “looks too small in the browser tab” issue.

## What changed in v3

### Small favicon assets were redesigned again
The small favicon files now use a more aggressive micro-icon treatment:
- **virtually no outer padding**
- **smaller corner radius** to increase visual mass
- **much larger cream serif B**
- **slight horizontal enlargement of the B** to reduce optical emptiness
- **no underline**

Affected files:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `favicon-96x96.png`
- `favicon.svg`
- `favicon-master-micro.png`

### SVG favicon behavior was made browser-safe
In v2 the SVG could still render with a font-dependent look. In v3 the SVG favicon embeds the tuned micro-icon raster artwork, so the browser-favored SVG should closely match the PNG/ICO appearance.

### Larger icons remain richer
Apple, Android, PWA, and maskable icons still use the more editorial, detailed artwork, scaled slightly larger inside the canvas.

## Install
Drop these files into your site root (or adjust paths), then paste `HEAD_SNIPPET.html` into your shared `<head>` include/layout.
