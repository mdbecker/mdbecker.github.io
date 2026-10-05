Golden images are captured only from the frozen historical master tree, with Playwright 1.63.0 pinned Chromium153 revision1243, three fixed viewports, en-US and America/New_York. External requests return deterministic empty responses; external images/widgets are therefore unavailable equally in both versions. No candidate screenshot may replace a historical golden.

Approved masks: original right social navigation at desktop only (fixed 243×59 pixel historical rectangle at the container right edge; retired Google+ icon), site footer (Octopress attribution and generated year), Disqus thread (external dynamic service), embedded iframes (remote video players). These masks do not cover the surrounding layout. Local fonts remain active. Baselines must be captured on the same OS as comparisons (CI captures pinned historical master output, never candidate output).

Live production DNS, HTTPS, successful Actions deployment, and actual Disqus thread association remain explicit release checks. VERIFY_PRODUCTION=1 enables real HTTPS historical-route smoke tests, without pretending that offline embed markup proves discussion association.

Do not mask social-navigation descendants at tablet/mobile: the collapsed parent clips them, while Playwright locator masks otherwise cover hidden descendants over article content. Desktop uses fixed historical region coordinates identically for both versions to avoid mask-size changes from removing Google+.

Both reference capture and candidate comparison wait for two byte-identical full-page screenshots (maximum six attempts). This prevents an initial full-page screenshot reflow from being stored as a transient golden. Candidate buffer comparisons retain the 0.5% changed-pixel gate, with the original page screenshot assertion also preserved.
