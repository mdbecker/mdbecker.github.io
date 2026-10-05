# Octopress to Jekyll migration

## Frozen references

- Historical generated `master`: `f956b53210bd3985408a766f431e5455c02e2459`.
- Historical Octopress `source`: `6bd8a7aeb3104158479259ec4be50d50dc63e7cd`.
- Route manifest: `tests/fixtures/routes.json`.
- Historical screenshot fixtures: `tests/fixtures/screenshots/`.

The historical output remains available on `master` for rollback. CI extracts
the exact generated commit into `historical-output/` and captures its screenshots
on the same runner used for candidate comparisons. These references are never
replaced with candidate renders.

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

Before cutover, obtain review of the passing build and historical screenshot
comparisons. Keep branch-based publishing active until that review is complete.
Then restrict `github-pages` deployment to `source`, switch Pages to GitHub
Actions, retain `beckerfuffle.com`, enable HTTPS, and verify a successful Actions
run. Test all historical routes at desktop/mobile sizes and confirm resources,
DNS, certificates, and real historical comments. `VERIFY_PRODUCTION=1 npm test`
adds live HTTPS route checks; comment association remains a manual check.

If any production check fails, restore branch-based publishing from `master`
before investigating the migration. The workflow intentionally cannot deploy
from PRs and cannot bypass a failed build or regression suite.

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
