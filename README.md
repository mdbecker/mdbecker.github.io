# Beckerfuffle

A small Jekyll site preserving the original Flat UI blog, six articles, archives,
categories, and public URLs. Edit the `source` branch; `master` is the historical
generated site retained for rollback. The GitHub default branch need not change.

## Local setup

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
the retained CSS, and a small native navigation script.

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

The post date determines `/blog/YYYY/MM/DD/title/`. Historical slugs and category
paths are preserved. New categories use normalized lowercase URL slugs (for
example `New Category.v2` becomes `new-category-dot-v2`). A small category plugin
generates indexes and feeds; Jekyll Paginate creates `/posts/2/` after ten posts.
The Markdown converter retains historical paragraph and numbered-code markup
needed by the existing CSS while accepting ordinary Markdown posts.

Preview, build, run tests, and open a pull request targeting `source`. Merge only
after all checks pass. There is no Octopress publishing command.

## Verify changes

Tests require the frozen historical output as well as the candidate build:

```sh
export HISTORICAL_SITE=/tmp/beckerfuffle-historical
mkdir -p "$HISTORICAL_SITE"
git archive f956b53210bd3985408a766f431e5455c02e2459 | tar -x -C "$HISTORICAL_SITE"
npm run test:baseline
bundle exec jekyll build
npm test
```

Capture historical baselines on the same operating system and pinned Chromium
version used for comparisons. Never update a golden image from candidate output
to make a failure pass. Investigate screenshot differences first. The fixture
route manifest covers every historical HTML route; comparisons cover desktop,
tablet, and mobile pages with a maximum 0.5% changed-pixel ratio. Screenshot files stay local and are ignored by Git; CI regenerates historical
references from master and does not upload screenshot artifacts. External requests
are blocked consistently. Documented masks are in
`tests/fixtures/visual-exceptions.md`.

The suite also checks article text, code markup, local resources, browser errors,
navigation accessibility, new posts/categories, pagination, feeds, metadata,
Disqus identifiers, dependency cleanup, and deployment guards. The production
test is explicitly skipped offline. After an approved deployment run
`VERIFY_PRODUCTION=1 npm test` with the same local setup; separately verify DNS,
HTTPS, and historical Disqus discussion association.

## Deployment and rollback

`.github/workflows/pages.yml` builds and tests pull requests targeting `source`
and pushes to `source`. Only a successful push to `source` uploads `public/` and
deploys via the GitHub Pages artifact API. PRs have no Pages deployment access.
The build job has read-only repository permissions; only the dependent deploy
job has Pages/OIDC write permissions. Same-OS golden screenshots are regenerated
from the immutable historical commit in CI before candidate comparisons.

Before the first cutover, keep existing branch publishing active, review passing
checks and screenshot comparisons, and approve intentional differences. In
repository settings configure the `github-pages` environment to permit only
`source`, select **GitHub Actions** for Pages, retain **beckerfuffle.com** as the
custom domain, and enable HTTPS. These account settings are release steps, not
automatically applied by the workflow. Confirm the first Actions deployment and
smoke-test desktop/mobile routes, assets, DNS, HTTPS, and existing comments.

If production fails verification, restore Pages publishing from `master` at the
repository root. The original output commit is
`f956b53210bd3985408a766f431e5455c02e2459`. For a later regression, revert the
offending `source` commit and publish through the same test-gated workflow.

## Maintenance

Monthly Dependabot PRs cover Bundler, npm test dependencies, and GitHub Actions.
Review the release notes, run the complete suite, and examine screenshots before
merging. Do not auto-merge upgrades. Update the runtime pin and lockfile together
when changing Ruby, and preserve a same-browser historical comparison when
updating Playwright. Ruby 3.3 is in security maintenance through March 2027;
schedule a tested move to a supported newer Ruby before then.

Compiled `source/stylesheets/screen.css` is retained to preserve the original
theme. The obsolete Sass/Compass sources are unnecessary for normal builds.
The migration removes jQuery, Bootstrap JS, Modernizr, Octopress tooling, Google
Analytics, AddThis, AWeber, Twitter widgets, Google+, and unused Flash/video
helpers. Google Fonts requests use HTTPS. Disqus remains the approved external
script, with historical HTTP identifiers and HTTPS embed/page URLs.

See [migration notes](docs/migration.md) for compatibility decisions and the
remaining production release checks.
