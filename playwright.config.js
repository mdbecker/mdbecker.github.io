const { defineConfig } = require("@playwright/test");
const port = Number(process.env.TEST_PORT || 4173);
module.exports = defineConfig({
  testDir: "tests",
  timeout: 60000,
  workers: 2,
  fullyParallel: false,
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: process.env.TEST_REPORT || "test-results/results.json" },
    ],
  ],
  use: {
    browserName: "chromium",
    baseURL: `http://127.0.0.1:${port}`,
    locale: "en-US",
    timezoneId: "America/New_York",
  },
  webServer: [
    {
      command:
        "node tests/server.cjs " +
        (process.env.BASELINE_CAPTURE
          ? '"' +
            (process.env.HISTORICAL_SITE ||
              "/private/tmp/beckerfuffle-baseline") +
            '"'
          : process.env.CANDIDATE_SITE || "public") +
        " " +
        port,
      port,
      reuseExistingServer: false,
    },
  ],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.005, animations: "disabled" },
  },
  snapshotPathTemplate: "{testDir}/fixtures/screenshots/{arg}{ext}",
});
