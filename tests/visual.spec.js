const { isolateNetwork } = require('./helpers.cjs');
const visit = require('./visit.cjs');
const { test, expect } = require("@playwright/test");
const routes = require("./fixtures/routes.json");
const fs = require("fs"), path = require("path");
// Historical screenshots describe the retired theme. Check reading/accessibility
// behavior across every route; optionally capture the current design for review.
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["tablet", 768, 1024],
  ["mobile", 375, 844],
])
  for (const route of routes)
    test(`D/E visual ${name} ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await isolateNetwork(page);
      expect((await visit(page, route)).status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("main h1")).toHaveCount(1);
      for (const name of ["About", "Blog", "Talks"])
        await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator("body").evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(20);
      expect(await page.locator("aside").count()).toBe(0);
      if (process.env.CANDIDATE_CAPTURE_DIR) {
        fs.mkdirSync(process.env.CANDIDATE_CAPTURE_DIR, { recursive: true });
        const file = `${name}-${route === "/" ? "home" : route.replaceAll("/", "-")}.png`;
        await page.screenshot({
          path: path.join(process.env.CANDIDATE_CAPTURE_DIR, file),
          fullPage: true,
          animations: "disabled",
          mask: [page.locator(".giscus"), page.locator("iframe")],
        });
      }
    });
