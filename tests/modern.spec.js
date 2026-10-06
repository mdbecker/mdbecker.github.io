const visit = require("./visit.cjs");
const { test, expect } = require("@playwright/test");
const fs = require("fs"),
  path = require("path"),
  cp = require("child_process");
const posts = require("./fixtures/routes.json").filter((r) =>
  /^\/blog\/\d/.test(r),
);
test.beforeEach(async ({ page }) =>
  page.route("**/*", (r) =>
    new URL(r.request().url()).hostname === "127.0.0.1"
      ? r.continue()
      : r.fulfill({ body: "" }),
  ),
);
for (const scheme of ["dark", "light"])
  test(`OS ${scheme} and live preference`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    expect(
      await page
        .locator("body")
        .evaluate((e) => getComputedStyle(e).backgroundColor),
    ).toBe(scheme === "dark" ? "rgb(21, 23, 19)" : "rgb(255, 255, 248)");
    await expect(
      page.getByRole("button", {
        name: `Switch to ${scheme === "dark" ? "light" : "dark"} mode`,
      }),
    ).toBeVisible();
    await page.emulateMedia({
      colorScheme: scheme === "dark" ? "light" : "dark",
    });
    await expect(
      page.getByRole("button", { name: `Switch to ${scheme} mode` }),
    ).toBeVisible();
  });
test("manual theme persists; early bootstrap and keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const b = page.getByRole("button", { name: "Switch to light mode" });
  await b.focus();
  expect(await b.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe(
    "none",
  );
  await page.keyboard.press("Enter");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.evaluate(() => localStorage.setItem("beckerfuffle-theme", "dark"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page
      .locator("head")
      .evaluate(
        (h) =>
          [...h.children].findIndex((e) => e.tagName === "SCRIPT") <
          [...h.children].findIndex((e) => e.rel === "stylesheet"),
      ),
  ).toBe(true);
});
test("SEO, social image, favicon and manifest resolve", async ({
  page,
  request,
}) => {
  for (const route of ["/", "/about/", ...posts]) {
    await visit(page, route);
    await expect(page.locator("title")).toHaveCount(1);
    await expect(page.locator("link[rel=canonical]")).toHaveCount(1);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      "https://beckerfuffle.com" + (route === "/about/" ? "/" : route),
    );
    await expect(page.locator("meta[name=description]")).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://beckerfuffle.com/images/social/beckerfuffle.png",
    );
    expect(
      JSON.parse(
        await page.locator('script[type="application/ld+json"]').textContent(),
      ),
    ).toBeTruthy();
  }
  const png = await (
    await request.get("/images/social/beckerfuffle.png")
  ).body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  await page.goto("/");
  await expect(page.locator('link[href="/favicon.png"]')).toHaveCount(0);
  const faviconSvg = await (await request.get("/favicon.svg")).text();
  expect(faviconSvg.includes('viewBox="0 0 128 128"')).toBe(true);
  expect(faviconSvg.includes("<text")).toBe(false);
  const embeddedIcon = faviconSvg.match(/href="data:image\/png;base64,([^"]+)"/);
  expect(Boolean(embeddedIcon)).toBe(true);
  const microPng = Buffer.from(embeddedIcon[1], "base64");
  expect(microPng.readUInt32BE(16)).toBe(128);
  expect(microPng.readUInt32BE(20)).toBe(128);
  expect(await page.evaluate(() => new Promise((resolve) => {
    const icon = new Image();
    icon.onload = () => resolve(icon.naturalWidth > 0);
    icon.onerror = () => resolve(false);
    icon.src = "/favicon.svg";
  }))).toBe(true);
  for (const href of await page
    .locator("link[rel*=icon],link[rel=manifest]")
    .evaluateAll((es) => es.map((e) => e.getAttribute("href"))))
    expect((await request.get(href)).status()).toBe(200);
  const manifest = await (await request.get("/site.webmanifest")).json();
  for (const icon of manifest.icons)
    expect((await request.get(icon.src)).status()).toBe(200);
});
test("historical headings have stable permalinks and threshold TOCs", async ({
  page,
}) => {
  for (const route of posts) {
    await visit(page, route);
    const hs = page.locator(".article-body h2,.article-body h3");
    const ids = await hs.evaluateAll((es) => es.map((e) => e.id));
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    await expect(
      page.getByRole("navigation", { name: "Table of contents" }),
    ).toHaveCount(ids.length >= 3 ? 1 : 0);
    for (const id of ids)
      await expect(page.locator(`[id="${id}"] a.anchor`)).toHaveAttribute(
        "href",
        "#" + id,
      );
    for (const href of await page
      .locator(".toc a")
      .evaluateAll((es) => es.map((e) => e.getAttribute("href"))))
      await expect(
        page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`),
      ).toHaveCount(1);
  }
});
test("home, shared biography, ordered talks and featured selection", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveText("Michael Becker");
  for (const name of [
    "Now",
    "Selected work",
    "Selected talks",
    "From the archive",
    "Side quests",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await expect(page.locator("#selected-work li")).toHaveCount(3);
  await expect(page.locator("#selected-talks li")).toHaveCount(3);
  const intro = await page.locator(".profile-intro").textContent();
  await page.goto("/about/");
  await expect(page.locator(".profile-intro")).toHaveText(intro);
  expect(
    JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    )["@type"],
  ).toBe("Person");
  await page.goto("/talks/");
  expect(
    await page.locator(".talk-entry").evaluateAll((es) => es.map((e) => e.id)),
  ).toEqual([
    "ete-2021",
    "pydata-nyc-2018",
    "meatspace-2017",
    "pyohio-2015",
    "pydata-nyc-2014",
    "pycon-2014",
    "pydata-boston-2013",
    "philly-tech-week-2013",
  ]);
  await expect(page.locator("iframe,video")).toHaveCount(0);
});
test("new writing, shared profile edits, opt-out, repeated headings and pagination", () => {
  const tmp = fs.mkdtempSync("/tmp/beckerfuffle-modern-");
  try {
    fs.cpSync("source", path.join(tmp, "source"), { recursive: true });
    for (let i = 1; i <= 5; i++)
      fs.writeFileSync(
        path.join(tmp, "source/_posts", `2026-01-0${i}-modern-${i}.md`),
        `---\nlayout: post\ntitle: Modern ${i}\ndate: 2026-01-0${i}\ntoc: ${i === 1 ? "false" : "true"}\n---\n## Repeat\nA\n## Repeat\nB\n### Last\nC\n`,
      );
    const profile = path.join(tmp, "source/_data/profile.yml");
    fs.appendFileSync(profile, "\nintro: Shared profile regression.\n");
    const result = cp.spawnSync(
      "bundle",
      [
        "exec",
        "jekyll",
        "build",
        "--config",
        path.resolve("_config.yml"),
        "--source",
        path.join(tmp, "source"),
        "--destination",
        path.join(tmp, "public"),
      ],
      { encoding: "utf8" },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const read = (p) => fs.readFileSync(path.join(tmp, "public", p), "utf8");
    expect(read("index.html")).toContain("Latest writing");
    expect(read("index.html")).toContain("Shared profile regression.");
    expect(read("about/index.html")).toContain('http-equiv="refresh"');
    expect(read("posts/2/index.html")).not.toContain("Selected work");
    expect(read("blog/2026/01/01/modern-1/index.html")).not.toContain(
      'aria-label="Table of contents"',
    );
    expect(read("blog/2026/01/02/modern-2/index.html")).toContain(
      'id="repeat-1"',
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
for (const width of [1440, 768, 390])
  for (const scheme of ["light", "dark"])
    test(`responsive ${width} ${scheme}`, async ({ page }) => {
      await page.setViewportSize({
        width,
        height: width === 768 ? 1024 : width === 390 ? 844 : 900,
      });
      await page.emulateMedia({ colorScheme: scheme });
      for (const route of [
        "/",
        posts.find((p) => p.includes("data-science")),
        "/blog/archives/",
        "/talks/",
      ]) {
        await visit(page, route);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("main h1")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const toc = page.locator(".toc");
        if (await toc.count()) {
          const t = await toc.boundingBox(),
            a = await page.locator(".article-body").boundingBox();
          expect(width >= 1200 ? t.x >= a.x + a.width : t.y < a.y).toBe(true);
        }
        if (process.env.CANDIDATE_CAPTURE_DIR) {
          fs.mkdirSync(process.env.CANDIDATE_CAPTURE_DIR, { recursive: true });
          await page.screenshot({
            path: path.join(
              process.env.CANDIDATE_CAPTURE_DIR,
              `${width}-${scheme}-${route === "/" ? "home" : route === "/blog/archives/" ? "blog" : route.includes("blog") ? "article" : route.split("/")[1]}.png`,
            ),
            fullPage: true,
            animations: "disabled",
          });
        }
      }
    });
test("OS dark works without JavaScript", async ({ browser, baseURL }) => {
  const c = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
  });
  const p = await c.newPage();
  await p.goto(baseURL + "/");
  expect(
    await p
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe("rgb(21, 23, 19)");
  await c.close();
});
test("storage denial still allows current-page theme choice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw Error("Unavailable");
      },
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
for (const colorScheme of ["light", "dark"])
  test(`readable text contrast in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto(posts.find((p) => p.includes("data-science")));
    const ratios = await page.evaluate(() => {
      const luminance = (css) => {
        const rgb = css
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((v) => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      return [
        "body",
        ".meta",
        ".nav a",
        ".article-body a",
        ".highlight .k",
        ".highlight .m",
        ".highlight .s",
      ]
        .map((selector) => {
          const e = document.querySelector(selector);
          if (!e) return null;
          const color = getComputedStyle(e).color;
          let parent = e,
            bg;
          while (parent) {
            bg = getComputedStyle(parent).backgroundColor;
            if (bg !== "rgba(0, 0, 0, 0)") break;
            parent = parent.parentElement;
          }
          const a = luminance(color),
            b = luminance(bg);
          return {
            selector,
            ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          };
        })
        .filter(Boolean);
    });
    for (const { selector, ratio } of ratios)
      expect(ratio, selector).toBeGreaterThanOrEqual(4.5);
    await page.emulateMedia({ media: "print", colorScheme });
    expect(
      await page
        .locator("html")
        .evaluate((e) => getComputedStyle(e).getPropertyValue("--code").trim()),
    ).toBe("#f3f2ea");
  });

test("profile and theme controls are grouped, evenly spaced and labelled on hover", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const controls = page.locator(".social-links a, .social-links button");
  await expect(controls).toHaveCount(4);
  for (const control of await controls.all()) {
    await expect(control).toHaveAttribute("title", /.+/);
    await expect(control).toHaveAttribute("aria-label", /.+/);
  }
  for (const width of [390, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const boxes = await controls.evaluateAll((es) =>
      es.map((e) => {
        const r = e.getBoundingClientRect();
        return { center: r.x + r.width / 2, width: r.width };
      }),
    );
    const gaps = boxes.slice(1).map((box, i) => box.center - boxes[i].center);
    expect(
      Math.max(...gaps) - Math.min(...gaps),
      `${width}px icon spacing`,
    ).toBeLessThanOrEqual(10);
    expect(boxes.every((box) => box.width === 44)).toBe(true);
  }
  const theme = page.locator("#theme-toggle");
  await expect(theme).toHaveAttribute("title", "Switch to dark mode");
  await theme.click();
  await expect(theme).toHaveAttribute("title", "Switch to light mode");
});

test("the merged About homepage has its own navigation and preserves the old About URL", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  expect(await nav.locator(".nav a").allTextContents()).toEqual([
    "About",
    "Blog",
    "Talks",
  ]);
  await expect(
    nav.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("href", "/");
  await expect(
    nav.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    nav.getByRole("link", { name: "Blog", exact: true }),
  ).not.toHaveAttribute("aria-current", /.+/);
  await nav.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/archives\/$/);
  await page.goto("/about/");
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator("main h1")).toHaveText("Michael Becker");
  const alias = await (await request.get("/about/")).text();
  expect(alias).toContain('http-equiv="refresh"');
  expect(alias).not.toContain('class="profile-intro"');
});
