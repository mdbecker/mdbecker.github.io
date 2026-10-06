# Beckerfuffle

A small Jekyll site with a Tufte-inspired editorial design, preserving the six
original articles, archives, categories, and public URLs. `main` is the active
development and publishing branch; pull requests target `main`. GitHub Actions
builds, tests, and deploys generated artifacts. The old `source` and `master`
branches are historical, with snapshots preserved through archival Git tags.
The `source/` directory and Jekyll's `source: source` setting remain unchanged.

## Local preview with Docker

With Docker Desktop running, start the blog from the repository root:

```sh
docker compose up --build
```

Open <http://127.0.0.1:4000>. Edit posts, pages, layouts, or styles normally on
your Mac; Jekyll polls the mounted files and rebuilds automatically without
restarting the container. Refresh the browser to see the changes.

Ruby and gems are installed in the image, and generated output stays in the
container at `/tmp/public`. The repository is mounted read-only. No host Ruby
or Node installation is needed. The image uses the lockfile's Linux platform,
including on Apple Silicon; Docker caches dependencies between builds.

Press Ctrl+C to stop, then `docker compose down` to remove the container.
After changing gems or the lockfile, run `docker compose up --build` again.
Changes to `_config.yml` or Ruby plugins require `docker compose restart blog`,
as Jekyll loads those at startup. To run a one-off production build:

```sh
docker compose run --rm blog bundle _4.0.22_ exec jekyll build --destination /tmp/public
```

## Local setup without Docker

Use Ruby **3.3.12**, Bundler **4.0.22**, and Node.js **24**. Install Ruby through
your preferred version manager rather than macOS's system Ruby.

```sh
gem install bundler -v 4.0.22
bundle install
npm ci
npx playwright install chromium
bundle exec jekyll serve
```

Preview at <http://127.0.0.1:4000>. `bundle exec jekyll build` writes `public/`.
Commit `Gemfile.lock` and `package-lock.json`; generated output is ignored.
Node and Playwright are development tools only; visitors receive static HTML,
self-hosted fonts and CSS. Navigation wraps without JavaScript.

## Publish a post

Create `source/_posts/YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: My new post
date: 2026-10-04 12:00:00 -0400
categories: [Python, Data Science]
comments: true
---
Write ordinary Markdown here.

<!--more-->

Continue the article here.
```

Keep the introduction above `<!--more-->` coherent and compact (roughly 40–60
words). For posts starting with an image or heading, an optional front-matter
`excerpt: >-` can supply introductory prose without changing the article. Excerpts
are not cut off at a fixed word count.

The post date determines `/blog/YYYY/MM/DD/title/`. Historical slugs and category
paths are preserved. New categories use normalized lowercase URL slugs (for
example `New Category.v2` becomes `new-category-dot-v2`). A small category plugin
generates indexes and feeds; Jekyll Paginate creates `/posts/2/` after ten posts.
The Markdown converter retains historical paragraph and numbered-code markup
needed by the existing CSS while accepting ordinary Markdown posts.

Preview, build, run tests, and open a pull request targeting `main`. Merge only
after all checks pass. There is no Octopress publishing command.

## Design and layouts

Typography and whitespace carry the hierarchy: no cards, sidebars, sidenotes,
illustrations, or motion. The homepage lists reverse-chronological native Jekyll
excerpts, stripped of HTML and ending at natural sentence boundaries; existing
pagination remains. Historical posts provide short introductions using native
front-matter `excerpt` fields, without changing their full article bodies.
Articles show a title, date, and the first three source-order categories.
Historical Markdown, links, permalinks, feeds, and Disqus identifiers remain intact.

`source/stylesheets/screen.css` contains the shared design and a small set of
CSS variables: paper `#FFFFF8`, text `#1B2430`, links `#245D67` (hover/focus
`#173F46`), branding `#B34A16`, secondary text `#60676B`, rules `#DEDED6`,
and code backgrounds `#F3F2EA`. ET Book is self-hosted with Palatino/Georgia
fallbacks: 20px body text with 1.6 line spacing, regular headings, and the
existing monospace code stack. The centered container is at most 56rem; the
left-aligned reading column is at most 45rem. Mobile gutters are 1.25rem.
Code blocks and wide tables scroll locally; images scale without distortion.

[ET Book](https://github.com/edwardtufte/et-book) is designed by Dmitry Krasny,
Bonnie Scranton, and Edward Tufte, and converted for the web by Adam Schwartz.
The three WOFF faces are distributed under MIT; their license is included at
`source/fonts/et-book/LICENSE`. Existing Font Awesome profile glyphs are reused.
There are no remote font requests or new production dependencies.

`default.html` owns navigation, the common masthead, main landmark, and footer.
`article.html` renders index entries or article title/metadata; `article_content.html`
reserves h1 for the page title and normalizes historical sections to begin at h2,
without editing the historical Markdown or changing feed content. `post.html`
retains adjacent-post links and comments; `page.html` shares the reading treatment
with About, Talks, archives, and categories. Category generation retains lowercase
historical URLs while preserving source order for article metadata.

The original cyan navigation, category pills, Bootstrap grids, Google Fonts,
Flat UI assets, and navigation toggle script have been retired. The historical
footer attribution remains. The original mockup provides the article composition;
the homepage intentionally uses excerpts as required by the redesign PRD.

## Verify changes

Tests compare content and publication behavior with the frozen historical output:

```sh
export HISTORICAL_SITE=/tmp/beckerfuffle-historical
mkdir -p "$HISTORICAL_SITE"
git archive f956b53210bd3985408a766f431e5455c02e2459 | tar -x -C "$HISTORICAL_SITE"
bundle exec jekyll build
npm test
```

The existing suite checks all historical routes at 1440px, 768px, and 375px,
heading structure, wrapping navigation, keyboard focus/activation, page overflow,
article text/links/images/code, pagination, category feeds, SEO/publication
interfaces, browser errors, resources, and deployment guards. Synthetic posts
are built outside the repository and removed automatically. Production requests
remain opt-in with `VERIFY_PRODUCTION=1`; no deployment is implied by local tests.

For visual review, set `CANDIDATE_CAPTURE_DIR` to a temporary directory and run
`npm test -- tests/visual.spec.js`. Inspect the homepage, PyData article, and email
code article at all three widths; check keyboard navigation and 200% zoom too.
External requests are blocked deterministically in tests, so historical remote
images and embeds are not verified by these captures. Some historical images
have empty alternative text; their content is preserved, not editorially rewritten.
Delete captures and generated output after review. The intentional redesign
supersedes pixel comparisons with the retired Flat UI theme.

See [redesign verification](docs/redesign.md) for the test-first handoff.

## Deployment and rollback

`.github/workflows/pages.yml` builds and tests pull requests targeting `main`
and pushes to `main`. Only a successful push to `main` uploads `public/` and
deploys via the GitHub Pages artifact API. PRs have no Pages deployment access.
The build job has read-only repository permissions; only the dependent deploy
job has Pages/OIDC write permissions. The immutable historical commit is extracted
in CI for content comparisons.

No generated-output branch or committed HTML is required. Pages must use
**GitHub Actions** as its publishing source, and the `github-pages` environment
must authorize `main`. Keep **beckerfuffle.com** in repository Pages settings
and enable HTTPS; `source/CNAME` alone does not configure an Actions custom
domain. Local tests cannot verify deployment authorization, DNS, certificates,
or existing Disqus associations.

Follow the ordered [owner migration checklist](docs/migration.md#owner-checklist-consolidate-publishing-onto-main)
for archival tags, creating and pushing `main`, repository settings, production
verification, and eventual branch retirement. These are manual release steps.
For ordinary regressions, revert the problematic change on `main` and let the
normal workflow rebuild, test, and deploy. Emergency Octopress restoration uses
the preserved generated-site commit
`f956b53210bd3985408a766f431e5455c02e2459` or its archival tag and a temporary
publishing-source change; see the checklist's rollback procedure.

## Maintenance

Monthly Dependabot PRs cover Bundler, npm test dependencies, and GitHub Actions.
They target the repository default branch automatically, without a branch override.
Review the release notes, run the complete suite, and examine screenshots before
merging. Do not auto-merge upgrades. Update the runtime pin and lockfile together
when changing Ruby, and review current-design screenshots when updating Playwright.
Ruby 3.3 is in security maintenance through March 2027;
schedule a tested move to a supported newer Ruby before then.

The shared CSS replaces the original compiled theme. Disqus remains the approved
external script, with historical HTTP identifiers and HTTPS embed/page URLs.

See [migration notes](docs/migration.md) for the earlier compatibility decisions
and remaining production release checks.
