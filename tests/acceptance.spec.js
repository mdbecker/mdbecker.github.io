const { test, expect } = require("@playwright/test");
const fs = require("fs"),
  path = require("path"),
  cp = require("child_process");
const routes = require("./fixtures/routes.json");
const posts = routes.filter((r) => /^\/blog\/\d/.test(r));
const read = (p) => fs.readFileSync(p, "utf8");
test.beforeEach(async ({ page }) =>
  page.route("**/*", (r) =>
    new URL(r.request().url()).hostname === "127.0.0.1"
      ? r.continue()
      : r.fulfill({ status: 200, body: "", contentType: "text/plain" }),
  ),
);
test("A all historical HTML routes survive", async ({ request }) => {
  for (const route of routes)
    expect((await request.get(route)).status(), route).toBe(200);
});
test("B preserve all six articles, rich email and data-science content", async ({
  page,
}) => {
  expect(posts).toHaveLength(6);
  for (const route of posts) {
    await page.goto(route);
    await expect(page.locator("article")).toBeVisible();
    const historical = read(
      path.join(
        process.env.HISTORICAL_SITE || "/private/tmp/beckerfuffle-baseline",
        route,
        "index.html",
      ),
    );
    const title = historical
      .match(/<div class="jumbotron">\s*([^<]+)/s)[1]
      .trim();
    await expect(page.locator("article > header h1")).toContainText(title);
    // Compare the complete reading body, excluding redesigned metadata/footer.
    const expected = await page.evaluate((html) => {
      const d = new DOMParser().parseFromString(html, "text/html");
      const body = d.querySelector("article > .row-fluid .span12");
      return {
        text: body.textContent.replace(/\s+/g, " ").trim(),
        links: [...body.querySelectorAll("a[href]")].map(e => e.getAttribute("href")),
        images: [...body.querySelectorAll("img")].map(e => [e.getAttribute("src"), e.getAttribute("alt")]),
        code: [...body.querySelectorAll("figure.code td.code pre")].map(e => e.textContent.trim()),
        headings: [...body.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(e => e.textContent.trim()),
      };
    }, historical);
    const actual = await page.locator(".article-body").evaluate(body => ({
      text: body.textContent.replace(/\s+/g, " ").trim(),
      links: [...body.querySelectorAll("a[href]")].map(e => e.getAttribute("href")),
      images: [...body.querySelectorAll("img")].map(e => [e.getAttribute("src"), e.getAttribute("alt")]),
      code: [...body.querySelectorAll("figure.code td.code pre")].map(e => e.textContent.trim()),
      headings: [...body.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(e => e.textContent.trim()),
    }));
    expect(actual).toEqual(expected);
    if (/working-with-email|data-science/.test(route)) {
      expect(await page.locator("figure.code td.gutter pre").count()).toBe(2);
      expect(await page.locator("figure.code td.code pre").count()).toBe(2);
      expect(await page.locator("article a").count()).toBeGreaterThan(0);
    }
  }
});
test("C preserve front-matter May 21 Elephant date", async ({
  page,
  request,
}) => {
  await page.goto("/blog/2013/05/21/elephant-enlightenment-part-1/");
  await expect(page.locator("article > header")).toContainText("May 21, 2013");
  expect(
    (
      await request.get("/blog/2013/07/31/elephant-enlightenment-part-1/")
    ).status(),
  ).toBe(404);
});
test("F mobile navigation wraps and supports keyboard activation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary" });
  for (const label of ["Blog", "Archives", "Talks", "About"])
    await expect(navigation.getByRole("link", { name: label, exact: true })).toBeVisible();
  const archives = navigation.getByRole("link", { name: "Archives", exact: true });
  await archives.focus();
  expect(await archives.evaluate(e => {
    const style = getComputedStyle(e);
    return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
  })).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/blog\/archives\/$/);
});
test("G categories and archives link all original posts", async ({ page }) => {
  await page.goto("/blog/archives/");
  for (const route of posts)
    await expect(page.locator(`a[href="${route}"]`).first()).toBeVisible();
  for (const route of routes.filter((r) => r.includes("/categories/"))) {
    await page.goto(route);
    expect(
      await page.locator("article a, #blog-archives a").count(),
    ).toBeGreaterThan(0);
  }
});
let synthetic;
test.beforeAll(() => {
  synthetic = fs.mkdtempSync(
    path.join(require("os").tmpdir(), "beckerfuffle-synthetic-"),
  );
  fs.cpSync("source", path.join(synthetic, "source"), { recursive: true });
  for (let i = 1; i <= 5; i++)
    fs.writeFileSync(
      path.join(synthetic, "source/_posts", `2025-01-0${i}-acceptance-${i}.md`),
      `---\nlayout: post\ntitle: Acceptance post ${i}\ndate: 2025-01-0${i} 12:00:00\ncategories: [New Category.v2]\n---\nSynthetic Markdown content **works**.\n`,
    );
});
test.afterAll(() => {
  if (synthetic) fs.rmSync(synthetic, { recursive: true, force: true });
});
function syntheticBuild() {
  const result = cp.spawnSync(
    "bundle",
    [
      "exec",
      "jekyll",
      "build",
      "--trace",
      "--config",
      path.resolve("_config.yml"),
      "--source",
      path.join(synthetic, "source"),
      "--destination",
      path.join(synthetic, "public"),
    ],
    { encoding: "utf8", env: process.env },
  );
  expect(result.status, result.stdout + "\n" + result.stderr).toBe(0);
  return path.join(synthetic, "public");
}
test("H ordinary new Markdown and normalized new category", () => {
  const root = syntheticBuild();
  expect(
    read(path.join(root, "blog/2025/01/05/acceptance-5/index.html")),
  ).toContain("Synthetic Markdown content");
  expect(
    read(path.join(root, "blog/categories/new-category-dot-v2/index.html")),
  ).toContain("Acceptance post 5");
});
test("I eleven posts paginate at historical second-page URL", () => {
  const root = syntheticBuild();
  const home = read(path.join(root, "index.html")),
    second = read(path.join(root, "posts/2/index.html"));
  expect((home.match(/<article\b/g) || []).length).toBe(10);
  expect((second.match(/<article\b/g) || []).length).toBe(1);
  expect(home).toMatch(/href=["']\/posts\/2\//);
  expect(second).toContain("Working with email content");
});
test("J valid Atom and sitemap with HTTPS post URLs", async ({
  page,
  request,
}) => {
  for (const route of [
    "/atom.xml",
    "/sitemap.xml",
    ...routes
      .filter((r) => r.includes("/categories/"))
      .map((r) => r + "atom.xml"),
  ]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const errors = await page.evaluate(
      (x) =>
        new DOMParser()
          .parseFromString(x, "application/xml")
          .querySelectorAll("parsererror").length,
      xml,
    );
    expect(errors).toBe(0);
    if (!route.includes("/categories/"))
      for (const post of posts)
        expect(xml).toContain("https://beckerfuffle.com" + post);
  }
});
test("K Disqus HTTP identifiers and HTTPS embed remain", async ({
  request,
}) => {
  for (const post of posts) {
    const html = await (await request.get(post)).text();
    expect(html).toContain("http://beckerfuffle.com" + post);
    expect(html).toMatch(/https:\/\/[^"'\s]*disqus\.com\/embed\.js/);
    expect(html).toContain("disqus_thread");
  }
});
test("L active scripts secure and only approved external integration", async ({
  page,
}) => {
  for (const route of routes) {
    expect((await page.goto(route)).status()).toBe(200);
    const scripts = await page
      .locator("script[src]")
      .evaluateAll((es) => es.map((e) => e.getAttribute("src")));
    for (const src of scripts) {
      expect(src).not.toMatch(
        /jquery|bootstrap|modernizr|addthis|aweber|google-analytics|jwplayer|swf|twitter/i,
      );
      expect(src).not.toMatch(/^http:/);
      if (/^https?:|^\/\//.test(src))
        expect(src).toMatch(/^https:\/\/[^/]*disqus\.com\//);
    }
  }
});
test("M local assets and browser console stay healthy", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  for (const route of routes) {
    expect((await page.goto(route)).status()).toBe(200);
    const assets = await page
      .locator('img[src],script[src],link[rel="stylesheet"]')
      .evaluateAll((es) => es.map((e) => e.src || e.href));
    for (const asset of assets.filter((s) =>
      s.startsWith(`http://127.0.0.1:${process.env.TEST_PORT || 4173}/`),
    ))
      expect((await request.get(asset)).status(), asset).toBe(200);
  }
  const css = await (await request.get("/stylesheets/screen.css")).text();
  for (const match of css.matchAll(/url\(["']?([^\)"']+)/g)) {
    if (/^(data:|https?:|\/\/)/.test(match[1])) continue;
    const url = new URL(
      match[1],
      `http://127.0.0.1:${process.env.TEST_PORT || 4173}/stylesheets/screen.css`,
    );
    expect((await request.get(url.href)).status(), url.href).toBe(200);
  }
  expect(errors).toEqual([]);
});
test("N workflow cannot deploy PRs or failed builds", () => {
  const files = fs.readdirSync(".github/workflows");
  expect(files).toHaveLength(1);
  const workflow = read(".github/workflows/" + files[0]);
  expect(workflow).toMatch(/pull_request:/);
  expect(workflow).toMatch(/source/);
  expect(workflow).toMatch(/needs:.*build/);
  expect(workflow).toMatch(/github.event_name\s*==\s*['"]push['"]/);
  expect(workflow).toContain("refs/heads/source");
  expect(workflow).toContain("actions/deploy-pages@");
  expect(workflow).toContain("pages: write");
  expect(workflow).toContain("id-token: write");
  expect(workflow).not.toContain("continue-on-error: true");
});
test("O publishing preserves domain and validates Pages artifact", () => {
  expect(read("public/CNAME").trim()).toBe("beckerfuffle.com");
  expect(read("_config.yml")).toMatch(/url:\s*["']?https:\/\/beckerfuffle.com/);
  const workflow = read(
    ".github/workflows/" + fs.readdirSync(".github/workflows")[0],
  );
  expect(workflow).toContain("actions/upload-pages-artifact@");
  expect(workflow).toMatch(/path:\s*public\/?/);
  expect(workflow).toContain("github-pages");
});
test("O external production HTTPS route smoke test", async ({ request }) => {
  test.skip(
    !process.env.VERIFY_PRODUCTION,
    "UNVERIFIED: approved Pages cutover and live HTTPS routes require explicit verification; historical Disqus association remains a manual release gate.",
  );
  for (const route of routes)
    expect(
      (await request.get("https://beckerfuffle.com" + route)).status(),
    ).toBe(200);
});

test("L modern locked runtime and CSS secure", () => {
  expect(read("Gemfile")).toMatch(/jekyll.*4\.4\.1/);
  expect(read("Gemfile.lock")).toContain("jekyll (4.4.1)");
  expect(read("Gemfile.lock")).not.toMatch(
    /octopress|compass|rdiscount|redcloth|sinatra|haml/i,
  );
  expect(read("public/stylesheets/screen.css")).not.toMatch(
    /@import[^;]*http:/,
  );
});
