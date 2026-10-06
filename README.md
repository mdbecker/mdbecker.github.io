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

## Profile and pages

Edit `source/_data/profile.yml` for the homepage biography, current role, focus,
selected work, and side quests. The combined About homepage uses small content
includes. Exactly three selected work entries are displayed; keep descriptions
short and team credit accurate. Experiments without verified public links use
plain text. Review professional/personal statements before publishing.

`source/index.html` is the combined About/personal homepage with `seo.type: Person`.
`source/about/index.markdown` preserves the old URL with a static refresh redirect
and a canonical link to `/`; it contains no duplicate biography. Navigation is
About → Blog → Talks; Blog opens the existing writing archive and is highlighted
on posts, categories, and writing pagination. Only pagination page one includes
personal sections; later pages show writing without repeating the biography.

## Add a talk

Create `source/_talks/event-year.md` with YAML front matter:

```yaml
---
title: A descriptive talk title
event: Conference name
year: 2026
description: A short abstract in one to three sentences.
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
```

Required fields are `title`, `event`, `year`, `description`, `featured`, and
`order`. Give every talk a **unique integer order**, newest first; renumber
existing entries when inserting a talk. Use `year` without an exact date when
only the year is known. Jekyll's default document build date is never displayed
as an event date. Tags may be stored for maintenance; the current presentation
omits them to keep the list quiet.

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
# toc: false
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

## Themes and article navigation

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
accessible names in Liquid. Posts show a single Contents nav when at least three
eligible headings exist and `toc: false` is absent. Short posts and ordinary
pages have no TOC. It is an in-flow section on smaller screens and a sticky right
rail at 1200px and above. Heading links appear on hover or keyboard focus.

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
preserved. The package README and master artwork are retained for maintenance.

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

Build the normal preview image first with `docker compose build`. Build a
separate disposable test image; this leaves the normal development image small:

```sh
docker build -t beckerfuffle-test -f - . <<'DOCKER'
FROM node:24-bookworm AS node
FROM mdbeckergithubio-blog:latest
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
RUN mkdir /test-tools && cd /test-tools && \
    npm install @playwright/test@1.63.0 && \
    npx playwright install --with-deps chromium
DOCKER

docker run --rm --platform linux/amd64 \
  -v "$PWD:/repo:ro" --entrypoint sh beckerfuffle-test -c '
  set -eu
  cp -a /repo /work && cd /work && npm ci &&
  mkdir -p /tmp/historical &&
  git archive f956b53210bd3985408a766f431e5455c02e2459 | tar -x -C /tmp/historical
  bundle exec jekyll build && HISTORICAL_SITE=/tmp/historical npm test
  '
```

On Apple Silicon, add `--platform linux/amd64` to the test image build too.
Dependencies, generated output, fixtures, and test reports stay inside the
container. The surviving suite covers historical content/routes, feeds, sitemap,
comments, deployment guards, themes, metadata/assets, heading anchors/TOCs,
shared profile data, talks, pagination, contrast, and responsive behavior.
External services are blocked deterministically. The production test is opt-in
with `VERIFY_PRODUCTION=1`; local success does not verify the live site.

For visual review, run `CANDIDATE_CAPTURE_DIR=/tmp/captures npm test --
tests/modern.spec.js` **inside** a named test container. It captures homepage,
code/TOC article, writing archive, and Talks at 1440×900, 768×1024, and 390×844 in both
themes. Use `docker cp` to retrieve captures before removing that container.
The established `tests/visual.spec.js` also checks every historical route at
1440, 768, and 375 pixels. Review screenshots explicitly; do not automatically
approve a changed baseline or mask reading content. Historical screenshots of
the retired theme are archival references. Remove disposable containers and
unneeded captures explicitly; never use global Docker pruning.

## Release and compatibility

Review local changes and profile/talk copy, icons/social artwork, both themes,
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
and [migration notes](docs/migration.md) for compatibility and owner setup.

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
