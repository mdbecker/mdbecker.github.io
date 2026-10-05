# Tufte redesign verification

Implemented on `codex/tufte-redesign`, branched from `codex/modernize-jekyll`.
The attached mockup supplies the typography and article composition. The PRD's
explicit homepage requirement takes precedence over the mockup's full article:
the homepage is a chronological excerpt index.

## Test-first evidence

All ten requested BDD scenarios and a representative technical Markdown fixture
were authored before template/CSS implementation. Tests used the existing pinned
Playwright suite, with builds and browser runs entirely inside Docker. Nothing
was installed through Homebrew or into the host runtime.

The first baseline run reported **9 failed, 1 passed** (55.1 seconds). Before
implementation, preservation tests were corrected to accept the old reading-body
markup, and the technical-table check was corrected to distinguish a prose table
from the historical code-gutter table. The corrected observations were seven
presentation failures and three preservation passes: complete historical prose/
links, technical content, and publication interfaces already worked. The expected
failures covered the excerpt index, heading hierarchy, concise source-order
metadata, shared navigation/identity, mobile overflow, keyboard focus, and a
single reading column. Fixture setup and an incomplete Docker file copy were
fixed before implementation; these were not counted as behavioral failures.

After implementation, all **10 BDD scenarios passed** (12.7 seconds). After the
heading normalization and asset cleanup, all **10 passed again** (12.0 seconds).
A keyboard test was corrected to await navigation completion rather than reading
the URL before the browser finished navigating.

The existing regression checks were updated for the intentional redesign:
wrapping keyboard-accessible navigation replaces toggle-button checks; complete
reading-body comparisons exclude redesigned metadata/footer; responsive visual
checks replace pixel comparisons with the retired Flat UI theme. Historical
content, image attributes, heading text, code, links, all 32 routes, feeds,
pagination, new-category behavior, resources, browser errors, and deployment
guards remain covered. The combined run passed **120 checks**, with one opt-in
production check skipped. After removing the temporary BDD suite, the final
existing regression suite passed **110 checks**, with that same production check
skipped.

## Browser review

Reviewed full-page homepage, PyData article, and email/code article screenshots
at **1440px**, **768px**, and **375px**. Branding, article titles, and prose align;
the restrained warm palette, ET Book typography, compact masthead, inline metadata,
and single reading column follow the mockup. Navigation wraps and wide code/tables
scroll locally. No page overflow was observed at any required width.

Keyboard review verified visible link focus, Enter activation, and the skip link's
focus transfer into the main landmark. A 200% zoom-equivalent viewport check and
an actual Chromium 200% browser-zoom check verified reflow without page overflow.
The actual browser check used a temporary extension only within the test container.

Offline browser runs block external requests for repeatability. Historical remote
images/embeds and live Disqus discussion association remain unverified. Existing
empty alternative text on three PyData images is preserved; meeting full article
image accessibility would require a separate content edit. This redesign does
not claim a full WCAG audit or rewrite historical content.

## Cleanup and handoff

Per the user's request, temporary BDD tests, technical fixtures, screenshots,
review scripts, generated sites, and task-created test containers were removed.
The existing regression suite remains aligned with the new interface. Font assets
and licenses, production templates/CSS, and concise documentation remain.
No production dependencies, host installations, deployment, GitHub push, or
publication setting changes were introduced. Changes are committed locally.

## Final visual QA refinements

The subsequent polish pass preserves branding, palette, column dimensions, and
article-title sizing. Media-only paragraphs now use block images without the
empty inline line box that caused large gaps when remote images were unavailable.
Related headings/lists use 10px spacing, paragraphs use 20px spacing, and ordinary
section boundaries use 36px. Lists have a tighter reading rhythm with native
hanging indentation and nested hierarchy. Metadata is 14px, with 8px title spacing
and 16px before excerpts. Homepage entries remain separated by 40px.

Linked article headings retain their original destinations and keyboard outlines
without persistent underlines. Homepage title links use a 1px underline with a
slightly greater offset and distinct hover/focus color. Inactive navigation labels
are undecorated; the orange current-section rule and keyboard outlines remain.

All six historical posts now use native front-matter excerpt fields containing
complete introductory sentences. The fixed 40-word truncation was removed.
Article bodies, permalinks, historical links, and feed content remain unchanged.
New posts can use the existing `<!--more-->` separator or an explicit excerpt;
no parser, summarizer, plugin, runtime dependency, or JavaScript was added.

Chromium's actual font audit identified **ETBembo-RomanLF** for ordinary prose and
**ETBembo-DisplayItalic** for the disclaimer, both custom ET Book faces at weight
400. The ink remains `#1B2430`; no speculative weight or font replacement was made.

Tests were written and run before implementation. Five observable defects failed
in the initial red phase; font loading and technical-content preservation already
passed. A fixture caption selector was corrected before implementation because
historical code blocks also contain an empty caption. The seven scenarios then
passed after implementation (8.5 seconds). Visual review uncovered compressed
mobile table labels; an eighth scenario first failed with the word “Value” split
across three lines. Tables now retain normal word wrapping and scroll locally.
The final combined run passed **118 checks**: eight QA scenarios and the existing
110 regression checks, with the opt-in production smoke check skipped.

Reviewed homepage, PyData, code article, and a technical fixture at 1440px, 768px,
and 375px, including long titles/URLs, nested/wrapped lists, inline/highlighted
code, a wide table, figure/caption, and blockquote. Actual Chromium 200% zoom
reflow was reviewed. No full-page horizontal overflow was observed. Offline remote
image/embed limitations remain as described above. The media-spacing correction
preserves image markup and URLs rather than hiding or deleting historical images.

Temporary QA tests, fixtures, captures, scripts, and the task's testing container
were removed after verification, following the user's cleanup instruction. The
local preview container remains running at `http://127.0.0.1:4000`. Refinements are
committed locally on the existing redesign branch and are not pushed.
