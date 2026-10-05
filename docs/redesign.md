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
