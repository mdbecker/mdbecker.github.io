const { test, expect } = require("@playwright/test");
const routes = require("./fixtures/routes.json");
const fs = require("fs"),
  path = require("path");
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
])
  for (const route of routes)
    test(`D/E visual ${name} ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.route("**/*", (r) =>
        new URL(r.request().url()).hostname === "127.0.0.1"
          ? r.continue()
          : r.fulfill({ status: 200, body: "", contentType: "text/plain" }),
      );
      expect((await page.goto(route)).status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      if (width >= 980)
        await page.evaluate(() => {
          const box = document
            .querySelector(".navbar .container")
            .getBoundingClientRect();
          const mask = document.createElement("div");
          mask.id = "retired-social-region";
          mask.style.cssText = `position:absolute;left:${box.right - 243}px;top:0;width:243px;height:59px;pointer-events:none`;
          document.body.append(mask);
        });
      const masks = [
        page.locator("#retired-social-region"),
        page.locator('footer[role="contentinfo"]'),
        page.locator("#disqus_thread"),
        page.locator("iframe"),
      ];
      const file = `${name}-${route === "/" ? "home" : route.replaceAll("/", "-")}.png`;
      const screenshotOptions = {
        fullPage: true,
        mask: masks,
        animations: "disabled",
      };
      let screenshot, previous;
      for (let attempt = 0; attempt < 6; attempt++) {
        screenshot = await page.screenshot(screenshotOptions);
        if (previous && screenshot.equals(previous)) break;
        previous = screenshot;
        if (attempt === 5)
          throw new Error(
            "Historical/candidate screenshot never stabilized: " + file,
          );
      }
      if (process.env.BASELINE_CAPTURE) {
        fs.mkdirSync("tests/fixtures/screenshots", { recursive: true });
        fs.writeFileSync(
          path.join("tests/fixtures/screenshots", file),
          screenshot,
        );
      } else {
        expect(
          fs.existsSync(path.join("tests/fixtures/screenshots", file)),
          "Historical golden must exist; never create a candidate baseline",
        ).toBe(true);
        expect(screenshot).toMatchSnapshot(file, { maxDiffPixelRatio: 0.005 });
        await expect(page).toHaveScreenshot(file, screenshotOptions);
        if (process.env.CANDIDATE_CAPTURE_DIR) {
          fs.mkdirSync(process.env.CANDIDATE_CAPTURE_DIR, { recursive: true });
          fs.writeFileSync(
            path.join(process.env.CANDIDATE_CAPTURE_DIR, file),
            screenshot,
          );
        }
      }
    });
