# Markdown content and accessible header verification

Implemented on `main` from `81e9d9e1a7b2f44415fd74a16895eb9af82b8606`.
The starting checkout was clean. The owner subsequently authorized a local commit;
nothing was pushed, no PR was opened, and no production changes were made.

## Content architecture

Homepage editorial content previously lived in `source/_data/profile.yml` and
HTML includes. It now lives in five Markdown fragments under
`source/_includes/home/`: `intro.md`, `now.md`, `selected-work.md`,
`talks-intro.md`, and `side-quests.md`. The HTML pagination entry point captures
and renders those fragments with Jekyll's built-in `markdownify` filter.

All eight `_talks/*.md` abstracts moved from `description` front matter into
Markdown bodies. Titles, metadata, links, featured selection, ordering, and
filename-based anchors remain unchanged. Talks and About fallback prose use
Markdown. About still redirects to the canonical homepage.

Removed obsolete files:

- `source/_data/profile.yml`
- `source/_includes/profile.html`
- `source/_includes/selected_work.html`
- `source/_includes/side_quests.html`

There are no active `site.data.profile` references. Historical posts, configuration,
locked dependencies, Docker definitions, and publishing workflow remain untouched.

## Header behavior

Grid places navigation and utilities on one desktop row. A container query makes
them two deliberate groups at narrow effective widths, with utilities distributed
across the available row and the desktop separator removed. Flexbox permits
further wrapping inside either group under extreme enlargement. Font sizes use
relative units, the wordmark can wrap, controls have at least 44px targets, and
keyboard focus and theme persistence remain intact. No resizing JavaScript was
added. The article TOC sidebar also requires sufficient space relative to text
size; it returns above the article when enlarged type would overflow.

## RED → GREEN evidence

New Markdown, rich-edit, enlarged-text, browser, keyboard, and content-preservation
checks were written before production changes. Baseline screenshots and generated
HTML were captured inside Docker before migration.

After resolving the stale test image's missing locked gems and browser binaries
inside the disposable container, the unchanged site produced three expected
failures: the old YAML source still existed, and Chromium and Firefox reported
navigation targets below 44px (41px and 40.78px). Five other checks passed. These
were application failures, not missing-dependency failures.

The implementation passed rich synthetic Markdown edits (bold, emphasis, links,
lists, and multiple talk paragraphs), homepage/Talks semantic text and exact link
comparisons, and the header matrix. Semantic comparisons account for whitespace
between generated block elements and Kramdown's typographic apostrophes. Separate
checks confirmed exact preservation of all eight talk abstracts and metadata.

An additional article check exposed pre-existing TOC sidebar overflow at 1440px
and 150%/200% text. Both browser regressions were recorded before the responsive
TOC fix; durable coverage now checks article headings, TOC placement, and code
scrolling at 320/768/1440px and all three text sizes. A final markup audit also
recorded duplicate heading/section IDs before adding distinct Markdown heading
IDs; stable section anchors remain intact, with durable uniqueness coverage.

The pre-cleanup full suite passed 138 tests, with one opt-in live-production test
skipped. Strengthened featured-link, rich abstract-rendering, Markdown editing, and
control-target checks also passed. Temporary PRD comparison/capture tests were
then removed; durable coverage remains in `tests/content-header.spec.js` and the
existing acceptance, modern, and visual suites.

All builds, dependency installation, automated checks, and Playwright runs took
place inside Docker, using Ruby 3.3.12, Bundler 4.0.22, Node 24, and locked project
dependencies. No host packages were installed.

## Screenshot review

Baseline and candidate captures cover homepage, Talks, archive, and a representative
code/TOC article at desktop, tablet, and mobile sizes in both themes. Normal-size
content presentation remains consistent: editorial lists and talk paragraph spacing
are preserved. Mobile utility alignment and header row spacing deliberately changed.
At 320px with 200% root text, the former wordmark overflow is replaced by wrapping;
all controls remain available, even when extra rows are necessary. No visual
snapshot baseline was automatically approved.

Review captures are outside the repository at `/private/tmp/beckerfuffle-before`
and `/private/tmp/beckerfuffle-after`; these are disposable owner-review artifacts.
They include `enlarged-header.png` and the 24 normal-size page/theme captures.
Remote services are blocked during screenshots, consistently with existing tests.

## Owner review and release

The Compose preview remains running at http://127.0.0.1:4000 with a read-only
source mount and generated output inside the container. Source edits rebuild it.

1. Review the five homepage fragments and eight talk bodies, then the rendered pages.
2. Compare both themes and navigation at desktop/mobile widths and 150%/200% text.
3. On the affected Android device, review both Firefox and Chrome with normal and
   enlarged accessibility text/display sizes. Check all controls, wordmark,
   horizontal reflow, code scrolling, focus where available, and saved theme choice.
   Use your usual secure device-to-localhost forwarding setup for this loopback preview.
4. Review `git diff` and `git status`, and run the complete Docker test procedure
   documented in README. Commit approved files locally and push only when ready
   through the owner's normal workflow.
5. After deployment, verify HTTPS/canonical URLs, homepage, About redirect, Talks
   anchors/resource links, archive/categories, historical posts, code/TOCs,
   Atom/sitemap, assets/social metadata, theme persistence, configured comments,
   and browser console/network errors. Repeat the Android acceptance review.

Desktop root-font enlargement and narrower effective CSS viewports cover text-only
scaling and full-zoom reflow boundaries, but cannot reproduce every Android font
inflation or display-size behavior. Actual Android review and live production
verification remain owner acceptance steps. Rollback uses an ordinary Git revert
and the existing deployment workflow.

## Final result after cleanup

The surviving full Docker suite passed **138 tests**, with **one skipped** opt-in
production smoke test, in approximately 2.5 minutes. The final Markdown-edit and
canonical-homepage checks also passed separately. Temporary PRD test files were
removed and the disposable test container (including baseline builds, synthetic
workspaces, dependencies, and reports) was removed after verification. Only the
existing Compose preview remains running. No visual baselines were changed.
