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
front-matter date is May 21, 2013, despite the old source filename. The original migration retained historical Disqus identities; the later Giscus
replacement below retires that integration. Canonical URLs, feeds, and fonts use HTTPS.

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

Execute these steps manually after reviewing the locally verified implementation
committed on `source`. Commands below are release instructions, not commands
executed during local verification. No archival tags, branch migration, push,
repository settings change, or deployment has been performed. Do not merge
historical `master` into the redesigned history.

The historical hashes below identify immutable Octopress snapshots, not the
current development tip. Keep them: the generated-site hash is also the CI
regression reference. Creating `main` uses the current reviewed `source` branch
and does not require a hardcoded implementation commit hash.

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

Start from the current local `source` branch, which includes the committed
publishing implementation. Review its history and the changes relative to
`origin/source`. Confirm the working tree is clean and no local or remote `main`
already exists. Commit any reviewed follow-up edits on `source` before creating
`main`. If code has changed since verification, repeat Docker tests before
proceeding; do not reset or overwrite an existing branch.

```sh
git status --short
git branch --show-current
git log --oneline origin/source..source
git diff --check origin/source..source
git diff origin/source..source
git branch --list main
git ls-remote --heads origin main
git switch -c main source
git push -u origin main
```

Creating `main` preserves the current reviewed `source` history, including the
already committed implementation; no second implementation commit is needed.
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
- After Giscus activation, GitHub sign-in, comment creation, and pathname association work.
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

The original RED → GREEN verification started from the pre-implementation
`source` snapshot at `12e84b5`. That hash records the test starting point only;
it is not the commit to use when creating `main`. After verification, the
implementation was committed on `source` at the owner's request. No branch/tag
migration, push, repository settings change, or deployment was performed.
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
custom-domain/DNS/HTTPS operation, and real GitHub Discussion creation and OAuth remain unverified
until the owner completes the manual release checklist. Local workflow checks
inspect configuration and guards; they do not simulate or prove a real deployment.

## Giscus replacement (October 5, 2026)

Disqus was retired from runtime templates and configuration and replaced by one
standard Giscus embed. Historical comments were not imported. The owner may
export/retain Disqus data separately as an archive; no export has been performed
or added to this public repository. Article bodies and permanent URLs remain
unchanged. Discussions map by pathname with strict matching in the Comments
category. Giscus IDs are public identifiers, intentionally blank at handoff;
no Comments section renders until all four configuration values are present.

Builds, dependency installation, Chromium setup, and verification ran exclusively
inside a disposable Docker container with Ruby 3.3.12, Bundler 4.0.22, Node
24.21.0, locked npm dependencies, and Playwright Chromium. The repository was
mounted read-only and copied to a writable container workspace. The normal
Docker image and Compose setup were not expanded or changed.

### Giscus owner activation

These steps are manual owner actions; implementation did not change GitHub,
Disqus, Pages, DNS, or production settings.

1. Before production cutover, if historical comments matter, sign in to Disqus
   Admin, export the site's comments/data, and store the archive outside the
   public repository. Do not add it to Git; it is not a runtime component.
2. In `mdbecker/mdbecker.github.io`, open **Settings → General → Features** and
   enable **Discussions**.
3. In Discussions categories, create **Comments** with type **Announcements**.
   Reserve it for blog comments.
4. [Install the Giscus GitHub App](https://github.com/apps/giscus), granting access
   only to `mdbecker/mdbecker.github.io`.
5. Open [giscus.app](https://giscus.app). Select that repository, pathname mapping,
   strict matching, Comments, and **Only search for discussions in this category**.
   Enable reactions and lazy loading; disable metadata emission; select bottom
   input position, light theme, and English. Copy only the repository and category
   IDs into `giscus.repo_id` and `giscus.category_id` in `_config.yml`; do not
   replace the existing embed with a generated script. These values are public.
6. Rebuild and run the complete suite inside Docker using the existing Docker
   testing instructions. Inspect a comment-enabled article's generated markup
   for the real IDs and absence of Disqus. Local preview requires no Giscus IDs
   before this step and uses the allowed port 4000 origins.
7. Review the full diff and repository status, commit the reviewed changes, and
   push to `main` or use the normal PR process. Let GitHub Actions build, test,
   and deploy. No developer push or deployment was performed for this migration.
8. After deployment, verify a historical article reads normally and loads the
   Comments section without console errors. Sign in through GitHub, submit a
   comment, and confirm a Discussion appears in Comments. Reopen the same path
   and check the same discussion; verify reactions and a second article's distinct
   discussion. Confirm disabled pages load no comment script, no Disqus requests,
   advertisements, or tracking UI appear, HTTPS is valid, and article content and
   layout are unchanged.

Local tests inspect markup and block external requests. They do not establish
real Discussion creation, OAuth, app permissions, or production operation.

### Giscus local verification

The temporary A–J suite and durable comment/security assertions were written
before production changes. Expected missing-embed, Disqus-runtime, and fallback
failures were observed before implementation; preservation was already GREEN
and was not forced to fail. Initial test setup needed Chromium libraries, an
explicit historical-output path, corrected synthetic page URLs, an uncontaminated
baseline build, and a corrected JavaScript-disabled text assertion. Those setup
failures are not migration RED evidence. The final corrected baseline replay,
against an isolated copy of the unchanged pre-migration `main` source, ran after
implementation and reported **12 expected failures, 109 passes, one skipped**:
nine migration behaviors and three durable comment/security checks failed;
content preservation and unrelated existing checks passed.

The corrected complete GREEN run passed **121 checks**, including all ten
temporary scenarios, with the opt-in production smoke check skipped. Output
comparison covered every pre-change HTML, XML, and CSS file, normalizing only
comment sections, retired embed/count scripts, the print selector, and whitespace.
It found no unrelated output changes. The owner's subsequent About-page removal
of the donation text/link is included separately in the final combined working
tree; the migration itself does not edit article content.

After GREEN, retired includes and the temporary BDD suite were deleted. Durable
tests retain configured and unconfigured coverage, all four missing settings,
post/page opt-in, disabled/unspecified/string-valued front matter, embed settings,
the exact external-script allowlist, and allowed origins. Fake IDs exist only in
durable synthetic tests and their temporary container workspaces, never in
production configuration. No one-time test infrastructure remains in the repository.

The surviving complete suite passed **111 checks**, with the opt-in production
smoke check skipped, after cleanup against the combined working tree including
the owner's About-page edit. The unchanged normal Docker Compose setup also
built successfully. Active source/configuration contain no Disqus references;
Docker diff and workspace comparisons passed. The disposable test container,
generated output, overrides, reports, and task-created temporary files were
removed after verification. The reviewed implementation and owner content edit
were committed locally on `main` at the owner's request; nothing was pushed.

## Personal-site MVP compatibility update (October 2026)

Historical Markdown and heading-level normalization remain in place. Kramdown
now generates IDs; image-only headings without an ID receive a stable section
fallback in the rendering include. Post TOCs are generated after normalization.
Heading permalink controls are excluded from historical prose/link comparisons.
The site author is now structured metadata; Atom and category feed templates use
`site.author.name`. Entry IDs and published/updated timestamps remain unchanged.
About and Talks no longer present obsolete page dates. See [MVP verification](mvp.md).

Owner review subsequently merged About into the homepage. `/about/` remains a
static redirect/canonical alias to `/`; Blog navigation opens the existing
`/blog/archives/` route. Historical post/category routes and feed identities are
unchanged. Profile/theme controls are grouped and have native hover titles.
