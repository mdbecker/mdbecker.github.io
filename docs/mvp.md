# Personal-site MVP verification — October 6, 2026

Implemented and committed locally on `main`; no push, PR, deployment, repository setting,
DNS change, or host dependency installation was performed. The original
uncommitted favicon ZIP is preserved. Preview remains available through Docker
Compose at <http://127.0.0.1:4000> with a read-only repository mount.

## Test-first evidence

Before production edits, the new `tests/modern.spec.js` scenarios were written
and executed against a Docker-built unchanged site. The existing site output
was copied as a compatibility baseline inside the container. The immutable
historical commit was separately extracted for the established regression suite.
An initial environment failure identified missing Chromium; installing Chromium
and its system dependencies inside the disposable test container resolved it.

The meaningful RED run completed with **9 expected failures and 6 passes**:
OS theme behavior, persistent/accessible theme control and early initialization,
SEO/social/icon output, heading anchors/TOCs, homepage/profile/talks content,
synthetic new writing/shared profile/pagination, no-JS dark mode, and denied
storage failed. Six responsive checks passed because the unchanged site's
single-H1/no-overflow behavior was already valid; they did not establish dark
mode or TOC behavior. The synthetic test's build command was subsequently fixed
to explicitly retain the repository configuration when overriding `--source`.
A TOC assertion was corrected to use attribute selectors for Kramdown's valid
`-1` image-heading fragment, which cannot be used as an unescaped CSS ID selector.

The first metadata/theme increment passed six of seven checks; the remaining
failure exposed Kramdown's image-only heading without an ID. A Liquid fallback
fixed it without editing Markdown or adding a Ruby plugin. The profile/talks/
homepage increment then passed the focused behavior suite. Additional reusable
contrast/print checks caught an OS-dark print specificity issue (RED: one pass,
one failure); the print palette override fixed it.

The final full Docker suite: **130 passed, 1 skipped** (131 total). The skipped
check is explicitly opt-in live production verification. The focused suite has
19 checks, including six viewport/theme combinations and two contrast/print
checks. The established 96-route/viewport visual checks and 16 acceptance checks
remain in place. Tests block third-party requests for determinism.

## Compatibility and asset verification

- All six article source files are unchanged, verified against Git.
- Established browser comparisons pass for complete historical article text,
  outgoing links, images/alt text, code contents, and heading text. Only added
  permalink controls are excluded from those comparisons.
- All 32 existing sitemap routes remain present.
- All 23 Atom/category feeds retain entry IDs and published/updated timestamps
  from the pre-change generated baseline.
- Supplied browser assets, master artwork, manifest, and tile configuration
  match all 16 ZIP assets byte-for-byte; manifest icon dimensions match files.
- Canonical URLs are HTTPS and singular; descriptions, titles, JSON-LD, and
  default Open Graph image resolve in real generated output.
- The social PNG resolves at `/images/social/beckerfuffle.png`, exactly 1200×630.
- Giscus configuration, pathname identities, opt-in behavior, and missing-ID
  suppression remain intact. The historical legacy favicon is retained unlinked.
- Docker Compose rebuilt successfully and its preview health check passes.

## Visual review

Reviewed 24 current screenshots: combined About homepage, code/TOC article, writing archive, and Talks;
1440×900, 768×1024, and 390×844; light and dark. Reviewed full-page examples and
six contact sheets. The editorial reading flow, wrapping navigation, warm dark
palette, code contrast, right TOC rail, and in-flow mobile/tablet TOC are intentional.
No overlap or page overflow was observed. Historical remote images are blocked
in these captures and may appear unavailable; their original sources are preserved.

These captures are review artifacts, not automatically approved pixel baselines.
Owner visual/copy approval remains part of release review. Screenshots are
provided outside the repository in the chat's `beckerfuffle-review` artifact
folder. Capture commands are documented in the README.

## Intentional behavior changes

The homepage introduces Michael Becker before writing. Three recent posts show
excerpts; remaining posts use compact links; pagination stays at ten posts.
Only page one repeats personal sections. The writing label changes from
“From the archive” to “Latest writing” with a 2026-or-later published post.

The combined About homepage and profile data replace the dated biography. The old `/about/` URL redirects to `/` with a canonical alias, rather than repeating content. Navigation is About → Blog → Talks; Blog opens the writing archive and is highlighted on writing pages. Eight ordered talk
records replace eager video embeds; three featured records populate the home
selection. Undated talks display their known year rather than Jekyll's build date.
No exact event dates or venues were invented. Theme preferences follow the OS
until overridden locally. Eligible posts gain heading links and a single TOC.
Standard SEO metadata and the supplied icon package replace the legacy head.

## Sources and remaining owner checks

The selected role, biography, co-founding statement, current focus, and experiments
are owner-supplied PRD copy and still need owner accuracy approval before publishing.
No internal Penn systems inventory or additional professional claim was invented.
Talk abstracts are concise editorial summaries and should also be reviewed.

Public resources consulted:

- [ETE 2021 organizer resources](https://chariotsolutions.com/ete-2021-resources/)
  confirms the title/speaker and links the new recording.
- [PyData 2018 video archive](https://pyvideo.org/pydata-new-york-city-2018/data-science-in-healthcare-beyond-the-hype.html)
  identifies Michael Becker and the linked PyData recording.
- [2017 presentation repository](https://github.com/pennsignals/data-intelligence)
  and [the owner's public profile](https://www.linkedin.com/in/mdbecker) identify
  the Meatspace presentation/materials; no precise date or venue is displayed.
- [CHIME repository](https://github.com/CodeForPhilly/chime),
  [DataPhilly](https://dataphilly.com/), and
  [4k_remaster](https://github.com/mdbecker/4k_remaster) verify public project links.
- [AMIA's journal listing](https://amia.org/search?f%5B0%5D=type%3AOther&f%5B1%5D=ujournal%3AApplied+Clinical+Informatics&f%5B2%5D=ujournal%3AJAMIA&f%5B3%5D=ujournal%3AJAMIA+Open&page=29)
  confirms the 2026 paper, DOI, title, and Michael Becker in the author list.
  The DOI resolver could not be independently loaded through the research tool;
  the site uses the owner's supplied DOI unchanged.

The five original video URLs are preserved exactly. Real third-party playback,
current availability of every historical outgoing link/image, search-engine
indexing, live social-network previews, DNS/TLS, and Giscus OAuth/Discussion
creation have not been established by local tests.

## Cleanup and release handoff

Temporary baseline copies, synthetic fixtures, reports, contact-sheet scripts,
and installed test dependencies were isolated in the disposable Docker workspace.
That test container was removed after the final surviving suite. No temporary
Dockerfile, test framework, migration fixture, or generated HTML was added to
the repository. Only focused reusable regression tests remain. The normal
Docker preview container stays running; screenshots are intentional review
artifacts outside the repository.

Review the local diff, professional copy, all eight talks/resource links,
social image, icons, screenshots, and the running preview. Run the documented
Docker suite if desired. The implementation, new content/assets, and tests are
committed locally; the original supplied ZIP remains untracked. Push only when the owner is ready using the
normal workflow. After Actions deploys, manually check HTTPS/canonicals, themes,
mobile navigation, TOC fragments, metadata/icons, About/Talks, historical routes,
comments, Atom/sitemap, and console/network errors. Local verification does not
claim production verification. Rollback is an ordinary Git revert.

## Owner feedback incorporated during local review

The owner requested grouped social/theme controls, hover labels, corrected
navigation highlighting, and one merged About/homepage. Two regression scenarios
were added before these edits and failed as expected. The controls now share one
44px-target group with consistent spacing and a small theme divider. Native hover
titles exist on navigation/profile links; theme title and accessible name update
with the available action. Spacing assertions pass at 390, 1440, and 1920 pixels.
Additional 1920px homepage/header/article screenshots were inspected.

The combined About page is now `/`, and Blog opens `/blog/archives/`; the archive
and all historical URLs remain. `/about/` is a static redirect/canonical alias
without duplicated profile content. A reusable test navigation helper waits for
that redirect before inspecting the page; this avoids inspecting a document as
its browser context is being replaced. The full surviving suite was rerun after
these changes. The screenshot set now shows the combined homepage, article,
writing archive, and Talks.
