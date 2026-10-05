The Tufte redesign intentionally supersedes the historical pixel comparisons.
Current visual checks cover all historical routes at 1440px, 768px, and 375px.
Optional captures use CANDIDATE_CAPTURE_DIR and stay outside version control.

External requests return deterministic empty responses. Historical remote images
and embeds are therefore not validated by offline screenshots. Disqus and iframe
regions are masked in optional captures; surrounding layout and local fonts remain
visible. Review the current homepage and technical articles against the approved
mockup, including keyboard use and 200% browser zoom.

Content comparisons still use frozen historical master output. Live DNS, HTTPS,
Actions deployment, and actual Disqus discussion association remain release checks.
