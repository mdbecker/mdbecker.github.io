# Beckerfuffle

A small Jekyll 4.4 personal site for Michael Becker: production ML, healthcare AI,
community, talks, writing, and technical rabbit holes. Warm paper, self-hosted
ET Book, restrained typography, and orange branding remain the visual identity.
The six historical articles, public URLs, categories, Atom identities, and Giscus
associations are preserved. `main` is the active publishing branch.

## Docker-only local development

With Docker Desktop running:

```sh
docker compose up --build -d
```

Open <http://127.0.0.1:4000>. The repository mount is read-only; generated HTML
stays inside the container at `/tmp/public`. Editing source files triggers a
rebuild. After configuration/plugin changes, run `docker compose restart blog`.
After Gemfile/lockfile changes, rebuild the image. Stop with `docker compose down`.
No host Ruby, Node, gems, browser, or package installation is needed.

```sh
docker compose run --rm blog bundle exec jekyll build --destination /tmp/public
```

## Homepage Markdown and pages

Edit content fragments under `source/_includes/home/`:

| Section | Markdown file |
| --- | --- |
| Biography, role, introduction | `intro.md` |
| Current focus | `now.md` |
| Selected work | `selected-work.md` |
| Selected talks introduction | `talks-intro.md` |
| Side projects | `side-quests.md` |

Edit paragraphs directly; use `[link text](https://example.org)`, `**bold**`,
`*emphasis*`, and Markdown lists normally. Change work descriptions below their
list headings and update side quests in their existing list. The Kramdown
`{: .editorial-list}` annotation preserves the restrained list presentation.
These fragments do not need front matter. Featured talks still come from the
Talks collection, so their titles and metadata are maintained only once.

The homepage remains an HTML file because the existing Jekyll pagination plugin
requires an HTML index. Its editable prose is stored in Markdown includes.

`source/index.html` is the combined About/personal homepage with `seo.type: Person`.
`source/about/index.markdown` preserves the old URL with a static refresh redirect
and a canonical link to `/`; it contains no duplicate biography. Navigation is
About → Blog → Talks; Blog opens the existing writing archive and is highlighted
on posts, categories, and writing pagination. Only pagination page one includes
personal sections; later pages show writing without repeating the biography.

## Add a talk

Create `source/_talks/event-year.md` with structured front matter and a Markdown body:

```markdown
---
title: A descriptive talk title
event: Conference name
year: 2026
featured: false
order: 1
# Optional, only when verified:
# date: 2026-05-04
# venue: Philadelphia
# video: https://example.org/recording
# slides: https://example.org/slides
# repository: https://github.com/owner/project
# tags: [Python, Machine Learning]
---

A brief **Markdown** abstract.

Additional paragraphs and [links](https://example.org) work normally.
```

Required fields are `title`, `event`, `year`, `featured`, and
`order`. Give every talk a **unique integer order**, newest first; renumber
existing entries when inserting a talk. Use `year` without an exact date when
only the year is known. Jekyll's default document build date is never displayed
as an event date. Tags may be stored for maintenance; the current presentation
omits them to keep the list quiet.

Written descriptions belong below the closing `---`; metadata belongs inside
the front matter above it. Paragraphs, links, emphasis, and lists are supported.

Talks are an `output: false` collection rendered on `/talks/` through one include.
The filename supplies the stable anchor: `pycon-2014.md` becomes
`/talks/#pycon-2014`. Renaming files changes these anchors. Optional Watch,
Slides, and Code links appear only when supplied; no players load on page open.
The homepage selects `featured: true`, sorts by `order`, and displays up to three.
Keep the intended featured set to three.

## Publish a post

Create `source/_posts/YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: My new post
date: 2026-10-06 12:00:00 -0400
categories: [Python, Data Science]
comments: true
# Optional:
# description: A concise sharing/search description.
# image: /images/my-post.png
# last_modified_at: 2026-10-07
---
A compact introduction.

<!--more-->

## First section
Continue the article in ordinary Markdown.
```

Dates and slugs determine `/blog/YYYY/MM/DD/title/`; do not change historical
values. Use the excerpt separator, or a native `excerpt: >-` front-matter value.
Never invent modification dates. The homepage shows excerpts for the first
three posts, compact title/date links for the rest, and preserves ten posts per
page using `paginator.posts`. It says **From the archive** until the newest
published post is from 2026 or later, then **Latest writing**.

## Themes and page navigation

Without a saved choice, CSS follows the OS light/dark preference, including
when JavaScript is disabled. The four profile/theme controls form one compact
group with 44px targets, uniform spacing, and a small divider before the theme
button. All navigation controls have native hover titles; the theme title and
accessible label describe the available action. The button switches to the opposite
visible theme and saves `beckerfuffle-theme` in localStorage. Only `light` and
`dark` are valid. Clear that key to resume OS preference; storage denial still
allows switching on the current page. The early head script applies saved
choices before the stylesheet paints. Print output uses a light palette.

Kramdown generates heading IDs. Historical heading levels are normalized beneath
the page H1 without rewriting Markdown. An image-only heading that Kramdown
leaves unnamed receives a stable `section-N` fallback. `jekyll-toc` generates
navigation from these final H2/H3 headings, and its decorative anchors are given
accessible names in Liquid. Every readable page shows exactly one **On this page** navigation through
`source/_includes/toc.html`. Posts and future ordinary `layout: page` pages
receive Start (`#content`) followed by eligible H2/H3 headings automatically,
including short pages. Legacy `toc: false` no longer suppresses navigation. A small pre-render hook in
the existing Markdown integration enables `jekyll-toc` for page/post layouts;
the plugin otherwise requires an explicit `page.toc == true`.
Heading links appear on hover or keyboard focus.

The homepage uses its existing Markdown section headings and stable anchors
(`now`, `selected-work`, `selected-talks`, `writing`, `side-quests`). Talks come
from the collection in `order` order, using filename anchors. Archives list
represented years (`year-YYYY`); categories and later writing pages list their
own posts, linking to local `post-` anchors derived from Jekyll post identities.
Titles and destinations stay with their existing content; no separate TOC files
or new front matter are required. Preserve section IDs and talk filenames when
editing so incoming links remain valid.

Every page shares a centered 72rem container with 1.25rem horizontal padding,
a left-aligned reading column capped at 52rem, a 14rem TOC, and a 2rem gap.
A container query enables the sticky right sidebar only when the container's
content box has at least 68rem available. At smaller effective widths, including
enlarged text, the same TOC appears in normal flow near the beginning of the
content. Long sidebar lists scroll within the viewport. Print hides navigation.

## Metadata and artwork

`jekyll-seo-tag` is the single source for title, canonical, description, Open
Graph, Twitter cards, and JSON-LD. `_config.yml` holds the structured author,
canonical HTTPS domain, public profiles, and default image. Footer and Atom
templates use `site.author.name`; entry identities and dates are preserved.

The supplied favicon artwork is copied to `source/` using its original filenames.
The shared head declares ICO, SVG, PNG, Apple touch, Safari mask, manifest, and
Microsoft tile resources. `source/site.webmanifest` references the supplied
Android and maskable icons. This adds no service worker or offline features.
The original `favicon.png` remains an unlinked legacy asset; the supplied ZIP is
preserved. Version 3 uses an oversized micro mark for browser favicons and larger
editorial artwork for app icons. Its package README and separate micro/detailed
masters are retained for maintenance; the original master remains unlinked.
The SVG embeds the tuned 128×128 micro artwork to avoid font-dependent rendering.

The default sharing PNG is `source/images/social/beckerfuffle.png` (1200×630).
Its editable source is `source/images/social/artwork.html`, using the existing
self-hosted font. Regenerate inside a Docker Playwright workspace: open that file
with Chromium at a 1200×630 viewport and device scale 1, wait for
`document.fonts.ready`, then screenshot the viewport to the PNG path. Generation
is a maintenance step; there is no runtime image service.

## Run the full suite in Docker

Verify the footer build year and both author formats inside the running preview container:

```sh
docker compose exec -T blog bundle exec ruby tests/copyright.rb
```

Build the preview base and the permanent test image, then run the full suite:

```sh
docker compose build blog
docker compose build test
docker compose run --rm test
```

`Dockerfile.test` installs the Ruby dependencies from the preview base, Node,
the locked Playwright package, and its matching Chromium/Firefox browsers and
system libraries. Rebuild both images after dependency lockfile changes. The
Compose test service copies the read-only repository into `/work` and uses the
image's installed dependencies. Synthetic builds, historical Git extraction,
and generated output stay in that writable container workspace. No setup or
installation is needed on the host.

Dependencies, generated output, fixtures, and test reports stay inside the
container. The surviving suite covers historical content/routes, feeds, sitemap,
comments, deployment guards, themes, metadata/assets, heading anchors/TOCs,
Markdown content, talks, pagination, contrast, and responsive behavior.
External services are blocked deterministically. The production test is opt-in
with `VERIFY_PRODUCTION=1`; local success does not verify the live site.

For visual review, keep a named test container until its captures are retrieved:

```sh
docker compose run --name beckerfuffle-review \
  -e CANDIDATE_CAPTURE_DIR=/tmp/captures test
mkdir -p test-results
docker cp beckerfuffle-review:/tmp/captures ./test-results/captures
docker rm beckerfuffle-review
```

For a focused rerun, `CANDIDATE_CAPTURE_DIR=/tmp/captures npm test --
tests/modern.spec.js` **inside** a named test container also works. It captures homepage,
code/TOC article, writing archive, and Talks at 1440×900, 768×1024, and 390×844 in both
themes. Use `docker cp` to retrieve captures before removing that container.
The established `tests/visual.spec.js` also checks every historical route at
1440, 768, and 375 pixels. Review screenshots explicitly; do not automatically
approve a changed baseline or mask reading content. Historical screenshots of
the retired theme are archival references. Remove disposable containers and
unneeded captures explicitly; never use global Docker pruning.

## CSS maintenance

`source/stylesheets/screen.css` is the single stylesheet, ordered as fonts,
theme palettes, global typography, page structure, navigation, article content,
historical highlighting, editorial pages, TOCs, responsive rules, and print.
Share a small grouped selector when related components intentionally use the
same declarations in the same circumstances; keep component-specific behavior
separate. Prefer deleting unused rules to adding utility classes.
Use descriptive component names (`site-header`, `site-footer`, `icon-github`);
keep generated syntax-highlighting and TOC hooks compatible with their producers.

Header container queries control group reflow based on available space at the
visitor's text size. The shared TOC
container query enables the sidebar only when both columns fit; all page types
keep the same container width.
Keep historical Rouge tokens and numbered-code table rules: generated article
markup, rather than source text alone, determines whether selectors are used.
The dark palettes support saved preferences and OS preferences independently.

Run the Docker suite above for responsive and visual checks. In the disposable
test workspace, `CLEANUP_CAPTURE=/tmp/before npm test --
tests/cleanup-behavior.spec.js` records unmasked screenshots and computed styles
in Chromium and Firefox. Rebuild after editing, then use
`CLEANUP_CAPTURE=/tmp/after CLEANUP_COMPARE=/tmp/before npm test --
tests/cleanup-behavior.spec.js` to check exact style, geometry, and screenshot
preservation. Keep these outputs inside the container; use `docker cp` for
manual review. Never replace a baseline merely to accept a visual change.

## Enlarged text and Android review

`tests/modern.spec.js` additionally checks universal TOC targets on every
readable route, synthetic pagination/future/empty pages, JavaScript-free anchors,
and shared geometry in Chromium/Firefox at 320, 375, 390, 768, 1200, 1440, and
1920px with 100%, 150%, and 200% text in both themes. Set `TOC_EVIDENCE` to a
container directory to save measurements.

`tests/content-header.spec.js` runs Chromium and Firefox in Docker at 320, 360,
375, 390, 430, 768, and 1440 CSS pixels, with default, 150%, and 200% root text
sizes in light/dark themes. It checks grouping, clipping, overlap, 44px minimum
targets, focus, keyboard order, and theme persistence. Narrower effective CSS
viewports complement text-only enlargement by modeling full-zoom reflow.
They do not reproduce every browser zoom or Android text-inflation behavior.

For manual desktop review, try browser zoom at 150% and 200%, then increase the
browser's default font size separately. At narrow widths the navigation and
utilities occupy separate rows; further wrapping is allowed at extreme sizes.
The wordmark may wrap, but all controls should remain visible and usable.

On the affected Android device, review Firefox and Chrome at normal and enlarged
system accessibility text/display sizes (including 200% where available).
Open the homepage, Talks, archive, and a code/TOC article in both themes. Check
that labels and branding remain readable, controls do not overlap, no page-wide
horizontal scrolling occurs, and theme choice survives reload. Scroll code
blocks within their own area. Desktop automation cannot fully simulate Android
system scaling or Firefox text inflation; this device review remains an owner
release-acceptance step. The local preview binds to loopback; use your normal
secure device-to-localhost forwarding method to inspect it on Android.

## Release and compatibility

Review local changes and homepage/talk copy, icons/social artwork, both themes,
mobile navigation, TOCs, and screenshots. Run the full Docker suite. Commit the
reviewed files locally, then push through the owner's normal `main`/PR workflow.
Nothing in the local preview deploys the site.

The existing GitHub Actions workflow builds/tests and publishes successful pushes
to `main`; PRs cannot deploy. After release manually verify HTTPS/canonicals,
assets/social metadata, theme persistence, About/Talks/resource links, historical
posts/archives/categories, comments, Atom, sitemap, and console/network errors.
DNS, OAuth, Discussion creation, and real third-party video playback remain
manual production checks. Roll back with an ordinary Git revert through the
existing workflow; preserve Git history.

See [MVP verification](docs/mvp.md), [redesign verification](docs/redesign.md),
[migration notes](docs/migration.md), and
[content/accessibility verification](docs/content-accessibility.md) for compatibility,
verification evidence, and owner setup.

## Comments and licensing

Giscus configuration remains unchanged: strict pathname mapping, Comments
category, reactions, lazy loading, and explicit `comments: true` opt-in. Its public
repo/category IDs remain blank pending owner setup, suppressing the Comments
section safely. `giscus.json` permits production and the two local preview
origins. See the [owner setup steps](docs/migration.md#giscus-owner-activation).

ET Book is MIT licensed; see `source/fonts/et-book/LICENSE`. Existing Font Awesome
profile glyphs are reused. There are no blocking external fonts, analytics,
frontend bundle, new articles, or comment-provider migration. Monthly Dependabot
updates remain subject to tests and screenshot review.
