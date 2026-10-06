# Octopress to Jekyll migration

This records the earlier migration and its validation. The subsequent
[Tufte redesign](redesign.md) replaces the Flat UI stylesheet, toggle script,
and historical pixel-comparison gate. CI still compares article content and
publication interfaces against the frozen historical output.

## Frozen references

- Historical generated `master`: `f956b53210bd3985408a766f431e5455c02e2459`.
- Historical Octopress `source`: `6bd8a7aeb3104158479259ec4be50d50dc63e7cd`.
- Route manifest: `tests/fixtures/routes.json`.
- Historical screenshot fixtures: `tests/fixtures/screenshots/`.

Preserve the historical output and source snapshots through archival Git tags
before retiring their old branches. CI extracts the exact generated commit into
`historical-output/` for content regression tests. The redesigned suite checks
layout behavior; the old screenshots remain historical references.

## Compatibility decisions

Jekyll 4.4.1 and Ruby 3.3.12 replace the abandoned Octopress 2 build. Jekyll
Paginate and Sitemap supply standard behavior. Small source plugins preserve
category indexes/feed slugs and historical Markdown markup without retaining
Octopress hooks, RDiscount, Pygments, Compass, or Sinatra.

The Markdown adapter preserves written curly quotes, French elisions, and the
historical formatter's unusual quotation behavior after nonbreaking spaces so
existing article text remains unchanged.

The original compiled CSS and local assets remain the visual reference. Only
active font requests need HTTPS. Layouts retain the Flat UI structure, post
metadata, code gutters, archives, categories, and navigation dimensions. Native
JavaScript supplies the responsive menu's keyboard and ARIA behavior. The
original footer copyright remains 2016; the generator credit changes to Jekyll.
Retired third-party widgets and external dynamic regions have documented masks
in `tests/fixtures/visual-exceptions.md`; other changes must pass comparison.

All six articles and historical public URLs remain. The Elephant article's
front-matter date is May 21, 2013, despite the old source filename. Historical
Disqus identifiers remain `http://beckerfuffle.com{post_url}` so the HTTPS
migration does not create new discussion identities. Canonical URLs, feeds,
fonts, and Disqus requests use HTTPS.

Acceptance test source was written before production migration. The 14 offline
scenarios were observed failing against the absent modern candidate; production
checks were explicitly skipped. Historical screenshots were captured separately.
The initial visual failures did not establish a valid complete visual RED run:
later investigation found fixture filename and hidden-mask problems. Those tests
were corrected after implementation began and rerun against the frozen
historical output and the candidate. This is a deviation from the PRD's strict
tests-first visual requirement, not evidence that the original run was valid.
Run evidence and screenshots are retained locally outside the repository.

## Dependency maintenance stage

After the initial build and template comparison, a registry audit identified
five outdated Ruby default gems in the locally resolved lockfile. They were
updated to current compatible releases; `bundle outdated --strict` then
reported no outdated gems. The required Jekyll 4.4.1 and Ruby 3.3.12 remain pinned.

The initial comparison runner was Playwright 1.58.2. It was then upgraded to the
current registry release, Playwright 1.63.0, with Chromium 153.0.8010.12 (revision
1243). New historical baselines must be captured from the frozen master output
with that same browser before comparing the candidate. Earlier stage screenshot
evidence is retained separately. Workflow actions were updated to current
release majors: Checkout 7, Setup Node 7, Upload Pages Artifact
5, and Deploy Pages 5. They support GitHub-hosted Ubuntu runners and Node 24.
The npm security audit reports no known vulnerabilities.

Bundler was separately upgraded from Ruby's bundled 2.5.22 to current compatible
4.0.22. The lockfile records that version; Ruby 3.3.12 and its RubyGems 3.5.22
satisfy the new Bundler requirements. Installation and the final regression
build use that locked tool version.

## Release status and checks

Local code and offline tests cannot prove that GitHub has published an artifact,
that DNS points to the correct Pages host, or that Disqus has associated an
existing thread. Do not mark these complete based on generated markup.

`main` is the sole active source and publishing branch; optional feature branches
open PRs targeting `main`. Actions builds and tests PRs but only successful
pushes to `main` upload `public/` and deploy. The build retains read-only token
permissions; only the dependent deployment job receives Pages/OIDC write access.
Concurrency controls and historical extraction remain in place. Dependabot uses
the repository default branch for all three monthly update schedules.

The owner checklist below replaces the old `source`/`master` publishing procedure.
Ordinary rollback is a revert on `main`; restoring the Octopress output is an
emergency manual procedure. No fallback workflow or permanent rollback branch
is needed. `VERIFY_PRODUCTION=1 npm test` adds live HTTPS route checks, but real
comment associations and deployment authorization still require manual review.

## Retained asset repairs

The compiled stylesheet already referenced two missing static PNGs. The migration
restores `img/glyphicons-halflings-white.png` from Bootstrap 2.3.1's upstream image
and `stylesheets/video-js.png` from `https://vjs.zencdn.net/3.2/video-js.png`.
These are inert image assets; no historical video player or Bootstrap JavaScript
is loaded. The existing `img/glyphicons-halflings.png` is copied from master.

## Observed production blockers (October 4, 2026)

A certificate-verified request to `https://beckerfuffle.com` failed with a
hostname mismatch. The authoritative nameservers are `ns14.zoneedit.com` and `ns16.zoneedit.com`
(ZoneEdit). Public DNS still returns the historical GitHub Pages apex
addresses `192.30.252.154` and `192.30.252.153`; `www` is a CNAME to the apex.
The current [GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
requires apex A records `185.199.108.153`, `185.199.109.153`,
`185.199.110.153`, and `185.199.111.153`; its recommended `www` CNAME points
directly to `mdbecker.github.io`. GitHub notes that a `www` CNAME pointing
to the apex can prevent HTTPS enforcement. Review and replace the obsolete
records at the DNS provider during the approved cutover, then wait for
GitHub's certificate to cover the custom domain and enforce HTTPS.

Git transport access works, but the existing GitHub CLI API credential is
invalid and the in-app GitHub browser is signed out. Opening the PR and
inspecting/changing Pages settings require an authenticated GitHub session.
No publishing setting has been changed and no production cutover has occurred.

## Screenshot handling

At the user's request, screenshots remain local and are excluded from Git uploads.
CI captures the immutable historical output on its own runner, compares the
candidate locally, and does not upload screenshot artifacts. Only the generated
static blog is uploaded as the Pages deployment artifact.

## Completed local validation

The final regression run passed 110 checks, including 96 screenshot comparisons
across 32 historical routes at three viewport sizes. Every screenshot matched
its historical dimensions; the largest changed-pixel ratio was 0.030408%, below
the 0.5% limit. JavaScript-disabled navigation and responsive date placement
were also checked. Repeated builds produced identical output. The live HTTPS
smoke check remains unverified until deployment and DNS repair.

Temporary build output, dependency installations, and migration reports were
removed from the repository. Durable regression tests remain; screenshots and
run evidence are preserved in the local Codex visualization workspace.

## Owner checklist: consolidate publishing onto main

Execute these steps manually after reviewing the locally verified, uncommitted
implementation. No branch, tag, commit, remote setting, or deployment is changed
by the implementation itself. Commands below are release instructions, not
commands executed during local verification. Do not merge historical `master`
into the redesigned history.

### 1. Preserve historical snapshots

Fetch references without pruning, then inspect the historical output:

```sh
git fetch origin
git rev-parse master origin/master
```

Both must still resolve to
`f956b53210bd3985408a766f431e5455c02e2459`. Stop and investigate if either differs.
Check whether the proposed tag names already exist before creating them; never
force-update a tag. Create an annotated historical-output tag:

```sh
git tag -a archive/octopress-master-2016 f956b53210bd3985408a766f431e5455c02e2459 -m "Archive original Octopress generated site"
```

Verify the existing local and remote source backup:

```sh
git rev-parse backup/source-before-redesign-20261005-204754 origin/backup/source-before-redesign-20261005-204754
```

Both must resolve to `6bd8a7aeb3104158479259ec4be50d50dc63e7cd`.
Optionally create an annotated tag for this original Octopress source snapshot:

```sh
git tag -a archive/octopress-source-2016 6bd8a7aeb3104158479259ec4be50d50dc63e7cd -m "Archive original Octopress source"
```

Push and verify each archival tag before considering branch retirement:

```sh
git push origin refs/tags/archive/octopress-master-2016
git ls-remote origin 'refs/tags/archive/octopress-master-2016*'
# Only if the optional source tag was created:
git push origin refs/tags/archive/octopress-source-2016
git ls-remote origin 'refs/tags/archive/octopress-source-2016*'
```

The peeled `^{}` entries must match the corresponding frozen commits. Keep the
existing source backup. Do not delete any historical branches during this release.

### 2. Create main from the redesigned source history

The implementation starts on `source` at `12e84b5`. Confirm that the working tree
contains only the five intended files below, that `source` is the redesigned
history, and that no local or remote `main` already exists. If references have
changed since verification, review the differences and repeat Docker tests
before proceeding; do not reset or overwrite an existing branch.

```sh
git status --short
git branch --show-current
git log -1 --oneline source
git branch --list main
git ls-remote --heads origin main
git switch -c main source
git diff --check
git diff -- .github/workflows/pages.yml .github/dependabot.yml tests/acceptance.spec.js README.md docs/migration.md
git add .github/workflows/pages.yml .github/dependabot.yml tests/acceptance.spec.js README.md docs/migration.md
git diff --cached
git commit -m "Consolidate Jekyll publishing onto main"
git push -u origin main
```

Creating `main` carries the reviewed uncommitted changes into that branch.
The obsolete `source` **branch** is distinct from the still-required `source/`
**directory**. Keep `_config.yml`'s `source: source`. The workflow publishes
only generated `public/` artifacts; never commit generated HTML or create a
`gh-pages` branch. The first push can start a workflow before the next step is
complete; deployment may fail pending authorization.

### 3. Configure GitHub publishing and protection

In the repository's GitHub UI:

1. **Settings → General → Default branch:** change the default branch to `main`.
2. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions**.
3. **Settings → Environments → github-pages → Deployment branches and tags:**
   choose **Selected branches and tags**, add a **Branch** rule matching `main`,
   and remove rules authorizing obsolete publishing branches or broad patterns.
4. **Settings → Pages → Custom domain:** confirm `beckerfuffle.com`. The repository
   setting controls the domain for Actions deployments; a `CNAME` file alone
   cannot configure it.
5. On that Pages screen, confirm a valid certificate is available and enable
   **Enforce HTTPS**. Verify DNS and certificates independently of branch changes.
6. **Settings → Branches → Add branch protection rule:** target `main`, require
   pull requests and the workflow's `build` status check before merging, and
   restrict bypasses/force pushes/deletions as appropriate. Select the actual
   check reported by the first workflow run; do not require `deploy` for PRs,
   because deployment is deliberately skipped there.

These Pages and environment settings resolve the observed
`Deployments are only allowed from master` authorization error. Changing YAML
alone does not authorize `main`. Once settings are correct, open **Actions →
Build, verify, and publish Pages**, select the failed `main` run, and use
**Re-run failed jobs** (or **Re-run all jobs** if the artifact has expired).
Alternatively, push a new reviewed change to `main` to trigger an authorized run.
Do not expect a push to `source`, `master`, or a feature branch to publish.

### 4. Verify production after deployment

Local verification is implementation completion, not production verification.
After the Actions run finishes, check all of the following manually:

- Both `build` and `deploy` succeeded; Pages reports the expected deployment.
- `https://beckerfuffle.com` serves the new artifact with the correct custom
  domain, a valid certificate, and HTTPS enforcement.
- Every historical post, archive, and category URL in
  `tests/fixtures/routes.json` works, including the May 21 Elephant URL.
- `/atom.xml`, `/sitemap.xml`, and category Atom feeds are available.
- CSS, self-hosted fonts, images, and other local resources load successfully.
- Desktop and mobile layouts, navigation, keyboard access, and code overflow
  work as expected.
- Existing Disqus threads retain their original comments and associations.
- Browser console and network panels show no unexpected errors.

Previous DNS and certificate issues are separate operational concerns; the
historical observations above are not evidence of their current resolution.
Optional live-route tests must also run inside a Docker test container using
`VERIFY_PRODUCTION=1 npm test`; they cannot prove comment associations or replace
this checklist.

### 5. Retire legacy branches later

Retirement is a separate, deliberate owner action after archival tags are
confirmed on `origin`, `main` is the default branch, production deployment and
verification succeed, and rollback paths have been documented and verified.
Only then consider deleting the old `source` and `master` branches through
GitHub's **Code → Branches** page. No branch deletion is part of this
implementation or initial release. Retain the archival tags and historical
commit objects required by regression tests.

### Manual rollback

For an ordinary regression, identify and revert the problematic commit on `main`:

```sh
git switch main
git pull --ff-only origin main
git revert <problematic-commit>
# Review and run the complete build/acceptance suite inside Docker before pushing.
git push origin main
```

The normal workflow rebuilds, tests, and deploys the revert. Repeat the production
checklist; never bypass a failing acceptance suite.

For an emergency requiring the original Octopress site, verify
`archive/octopress-master-2016^{}` resolves to
`f956b53210bd3985408a766f431e5455c02e2459`. If the retained `master` still points
to that commit, temporarily select **Settings → Pages → Build and deployment →
Deploy from a branch**, choose `master` and **/(root)**, and save. If `master` has
already been retired, manually restore the historical output from that archival
tag into an owner-selected temporary recovery branch first, then select that
branch and **/(root)**. Do not overwrite `main`, introduce a permanent rollback
branch, or add another deployment workflow. Confirm the historical site,
custom domain, HTTPS, assets, routes, and comments after restoration. Once the
regression is fixed and Docker checks pass, restore Actions publishing and the
`main` environment rule, trigger an authorized `main` run, and verify production
again. This emergency procedure is not the normal rollback mechanism.

## Main publishing local verification (October 5, 2026)

The implementation was verified on `source` at `12e84b5`, without committing,
changing branches/tags, pushing, modifying repository settings, or deploying.
All builds, tests, dependency installation, YAML validation, and final diff
checks ran inside Docker. A disposable Compose test container used Ruby 3.3.12,
Bundler 4.0.22, Node 24.21.0, locked npm dependencies, and Playwright Chromium.
The repository mount was read-only; a copied container workspace held generated
output, historical extraction, synthetic fixtures, dependencies, and reports.
No host dependencies were installed or files written outside the project.

- **RED:** All nine temporary publishing BDD scenarios A–I failed on the legacy
  branch policy before production configuration changed. The updated existing
  deployment-safety test also failed on `branches: [source]`. The initial
  production Jekyll build succeeded; no unrelated test failure blocked RED.
- **GREEN:** The same nine scenarios passed after the minimal configuration and
  documentation updates. The complete existing Playwright suite passed 110
  checks, with its pre-existing opt-in production check skipped.
- **Build/output:** Production builds succeeded before and after the change;
  SHA-256 manifests of all 65 generated files matched byte-for-byte. Historical
  routes and article content passed the existing regression suite. The unchanged
  normal Docker Compose setup also completed a production build into `/tmp/public`.
- **Cleanup:** All temporary BDD tests, runner/marker files, and Docker test
  definitions were removed. The surviving full suite was rerun in Docker and
  again passed 110 checks, with only the opt-in production check skipped.

Only the workflow, Dependabot configuration, existing branch assertions, README,
and this migration document changed. Templates, content, CSS, plugins, domain,
Jekyll configuration, runtime dependencies, and normal Docker preview files
remain untouched. Actual GitHub event handling and deployment authorization,
custom-domain/DNS/HTTPS operation, and live Disqus associations remain unverified
until the owner completes the manual release checklist. Local workflow checks
inspect configuration and guards; they do not simulate or prove a real deployment.
