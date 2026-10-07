const { isolateNetwork, copySource, buildSource } = require('./helpers.cjs');
const visit = require("./visit.cjs");
const { test, expect, chromium, firefox } = require("@playwright/test");
const fs = require("fs"),
  path = require("path");
const posts = require("./fixtures/routes.json").filter((r) =>
  /^\/blog\/\d/.test(r),
);
test.beforeEach(async ({ page }) =>
  isolateNetwork(page),
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
test("historical headings have stable permalinks and universal TOCs", async ({
  page,
}) => {
  for (const route of posts) {
    await visit(page, route);
    const hs = page.locator(".article-body h2,.article-body h3");
    const ids = await hs.evaluateAll((es) => es.map((e) => e.id));
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    await expect(
      page.getByRole("navigation", { name: "On this page" }),
    ).toHaveCount(1);
    for (const id of ids) {
      const heading = page.locator(`[id="${id}"]`);
      const permalink = heading.locator("a.anchor");
      await expect(permalink).toHaveAttribute("href", "#" + id);
      await expect(permalink.locator("svg")).toHaveCount(1);
      await expect(permalink).toHaveText("");
      await expect(heading.locator("a a")).toHaveCount(0);
      await heading.hover();
      await expect(permalink).toHaveCSS("opacity", "1");
      await permalink.focus();
      await expect(permalink).toHaveCSS("opacity", "1");
    }
    for (const href of await page
      .locator(".toc a")
      .evaluateAll((es) => es.map((e) => e.getAttribute("href"))))
      await expect(
        page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`),
      ).toHaveCount(1);
  }
});
test("home, canonical biography, ordered talks and featured selection", async ({
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
  expect(await page.locator("#selected-talks h3 a").evaluateAll(es => es.map(e => e.getAttribute("href")))).toEqual([
    "/talks/#ete-2021", "/talks/#pydata-nyc-2018", "/talks/#pycon-2014",
  ]);
  const intro = await page.locator("main > p").first().textContent();
  await page.goto("/about/");
  await expect(page.locator("main > p").first()).toHaveText(intro);
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
test("new writing, Markdown edits, universal navigation, repeated headings and pagination", () => {
  const tmp = copySource("beckerfuffle-modern-");
  try {
    for (let i = 1; i <= 5; i++)
      fs.writeFileSync(
        path.join(tmp, "source/_posts", `2026-01-0${i}-modern-${i}.md`),
        `---\nlayout: post\ntitle: Modern ${i}\ndate: 2026-01-0${i}\ntoc: ${i === 1 ? "false" : "true"}\n---\n## Repeat\nA\n## Repeat\nB\n### Last\nC\n`,
      );
    const profile = path.join(tmp, "source/_includes/home/intro.md");
    fs.appendFileSync(profile, "\n\nShared profile regression.\n");
    buildSource(tmp);
    const read = (p) => fs.readFileSync(path.join(tmp, "public", p), "utf8");
    expect(read("index.html")).toContain("Latest writing");
    expect(read("index.html")).toContain("Shared profile regression.");
    expect(read("about/index.html")).toContain('http-equiv="refresh"');
    expect(read("posts/2/index.html")).not.toContain("Selected work");
    expect(read("blog/2026/01/01/modern-1/index.html")).toContain(
      'aria-label="On this page"',
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
            a = await page.locator("main").boundingBox();
          const sidebar = await toc.evaluate(e => getComputedStyle(e).position === "absolute");
          expect(sidebar ? t.x >= a.x + a.width : Math.abs(t.x - a.x) < 1).toBe(true);
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

test("profile and theme controls remain separated with usable targets and hover labels", async ({
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
    for (let i = 1; i < boxes.length; i++)
      expect(boxes[i].center - boxes[i-1].center).toBeGreaterThanOrEqual((boxes[i].width + boxes[i-1].width) / 2);
    expect(boxes.every((box) => box.width >= 44)).toBe(true);
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

// Universal page navigation and shared layout regressions.
const readableRoutes = require('./fixtures/routes.json').filter(r => r !== '/about/');
const long = '/blog/2014/07/30/data-science-with-python-part-1/';
const short = '/blog/2014/11/24/pydata-nyc-the-really-short-version/';
async function assertTocIntegrity(page) {
  const toc = page.getByRole('navigation', { name: 'On this page', exact: true });
  await expect(toc).toHaveCount(1);
  await expect(toc.getByRole('heading', { name: 'On this page', exact: true })).toHaveCount(1);
  const result = await toc.locator('a').evaluateAll(es => es.map(e => {
    const id = decodeURIComponent(new URL(e.href).hash.slice(1));
    const targets = [...document.querySelectorAll('[id]')].filter(t => t.id === id);
    return { text: e.textContent.trim(), count: targets.length, order: targets[0] ? [...document.querySelectorAll('[id]')].indexOf(targets[0]) : -1 };
  }));
  expect(result.length).toBeGreaterThan(0);
  for (const r of result) { expect(r.text).not.toBe(''); expect(r.count).toBe(1); }
  expect(result.map(r => r.order)).toEqual(result.map(r => r.order).sort((a,b) => a-b));
  const ids = await page.locator('[id]').evaluateAll(es => es.map(e => e.id));
  expect(new Set(ids).size).toBe(ids.length);
}
test('universal navigation has unique local targets on every readable route', async ({page,request}) => {
  for (const route of readableRoutes) { await page.goto(route); await assertTocIntegrity(page); }
  for (const route of ['/about/','/atom.xml','/sitemap.xml','/site.webmanifest'])
    expect(await (await request.get(route)).text()).not.toContain('aria-label="On this page"');
});
test('home, talks, archive and category navigation follows existing content', async ({page}) => {
  await page.goto('/');
  expect(await page.locator('.toc a').allTextContents()).toEqual(['Now','Selected work','Selected talks','Writing','Side quests']);
  await page.goto('/talks/');
  expect(await page.locator('.toc a').allTextContents()).toEqual(await page.locator('.talk-entry h2').allTextContents());
  await expect(page.locator('.toc a')).toHaveCount(8);
  await expect(page.locator('iframe,video')).toHaveCount(0);
  await page.goto('/blog/archives/');
  expect(await page.locator('.toc a').allTextContents()).toEqual(await page.locator('#blog-archives > h2').allTextContents());
  await page.goto('/blog/categories/python/');
  expect(await page.locator('.toc a').allTextContents()).toEqual(await page.locator('#blog-archives article h3 a').allTextContents());
  for (const route of [short,long]) {
    await page.goto(route);
    await expect(page.locator('.toc a').first()).toHaveText('Start');
    expect(await page.locator('.toc a').count()).toBe(1 + await page.locator('.article-body h2,.article-body h3').count());
  }
});
for (const engine of ['chromium','firefox']) test(`${engine} shared geometry, reflow, text scaling and keyboard navigation`, async ({baseURL}) => {
  test.setTimeout(600000);
  const browser = await ({chromium,firefox}[engine]).launch();
  try {
    const page = await browser.newPage();
    await isolateNetwork(page);
    const measurements = [];
    for (const width of [320,375,390,768,1200,1440,1920]) for (const scale of [1,1.5,2]) for (const theme of ['light','dark']) {
      await page.setViewportSize({width,height:900}); await page.emulateMedia({colorScheme:theme});
      let alignment;
      for (const route of ['/', '/talks/', '/blog/archives/', '/blog/categories/python/',short,long]) {
        await page.goto(baseURL+route);
        await page.evaluate(s => document.documentElement.style.fontSize = `${s*100}%`,scale);
        await page.evaluate(() => document.fonts.ready);
        const g = await page.evaluate(() => {
          const rect = s => { const r = document.querySelector(s).getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; };
          return {main:rect('main'),nav:rect('.site-header nav'),mast:rect('.masthead'),footer:rect('.site-footer'),toc:rect('.toc'),root:parseFloat(getComputedStyle(document.documentElement).fontSize),pos:getComputedStyle(document.querySelector('.toc')).position,scroll:document.documentElement.scrollWidth};
        });
        expect(g.scroll).toBeLessThanOrEqual(width);
        for (const s of ['nav','mast','footer']) expect(Math.abs(g[s].x-g.main.x)).toBeLessThan(1);
        if (alignment === undefined) alignment = g.main.x;
        expect(Math.abs(g.main.x-alignment)).toBeLessThan(1);
        expect(g.main.w).toBeCloseTo(Math.min(52*g.root,width-2.5*g.root),0);
        if (width >= 70.5*g.root) {
          expect(g.toc.x).toBeCloseTo(g.main.x+g.main.w+2*g.root,0);
          expect(g.toc.w).toBeCloseTo(14*g.root,0);
          expect(g.toc.x+g.toc.w).toBeLessThanOrEqual(width);
        } else { expect(g.pos).toBe('static'); expect(g.toc.x).toBeCloseTo(g.main.x,0); }
        measurements.push({engine,width,scale,theme,route,...g});
      }
    }
    await page.goto(baseURL+long);
    await page.locator('.toc a').first().focus();
    expect(await page.locator('.toc a').first().evaluate(e => getComputedStyle(e).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter'); await expect(page).toHaveURL(/#content$/);
    await page.locator('.toc a').first().focus();
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', await page.locator('.toc a').nth(1).getAttribute('href'));
    const href = await page.locator(':focus').getAttribute('href');
    await page.keyboard.press('Enter'); expect(new URL(page.url()).hash).toBe(href);
    await page.emulateMedia({media:'print'}); await expect(page.locator('.toc')).toBeHidden();
    if (process.env.TOC_EVIDENCE) {
      fs.mkdirSync(process.env.TOC_EVIDENCE, { recursive: true });
      fs.writeFileSync(`${process.env.TOC_EVIDENCE}/${engine}-geometry.json`, JSON.stringify(measurements, null, 2));
    }
  } finally { await browser.close(); }
});
test('synthetic pagination, future pages, short posts and empty categories obtain navigation automatically',async({page})=>{
  const tmp=copySource('universal-toc-');
  try {
    for(let i=1;i<=5;i++) fs.writeFileSync(`${tmp}/source/_posts/2026-01-0${i}-toc-${i}.md`,`---\nlayout: post\ntitle: Synthetic ${i}\ndate: 2026-01-0${i}\ntoc: false\n---\nShort prose.\n`);
    fs.writeFileSync(`${tmp}/source/future.md`,'---\nlayout: page\ntitle: Future\n---\nIntro.\n\n## Section\nBody.\n');
    fs.writeFileSync(`${tmp}/source/empty.html`,'---\nlayout: category_index\ntitle: Empty\ncategory: no-such-category\n---\n');
    buildSource(tmp);
    for(const file of ['posts/2/index.html','future/index.html','empty/index.html','blog/2026/01/01/toc-1/index.html']) {
      await page.setContent(fs.readFileSync(`${tmp}/public/${file}`,'utf8')); await assertTocIntegrity(page);
      if(file.startsWith('posts/')) expect(await page.locator('.toc a').allTextContents()).toEqual(await page.locator('.blog-index article h3 a').allTextContents());
      if(file==='future/index.html') expect(await page.locator('.toc a').allTextContents()).toEqual(['Start','Section']);
      if(file==='empty/index.html'||file.startsWith('blog/')) expect(await page.locator('.toc a').allTextContents()).toEqual(['Start']);
    }
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});
test('TOC navigation remains native with JavaScript disabled',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  try {
    const page=await context.newPage();
    for(const route of ['/', '/talks/', '/blog/archives/', '/blog/categories/python/', short, long]) {
      await page.goto(baseURL+route); await assertTocIntegrity(page);
      const link=page.locator('.toc a').last(); const fragment=await link.getAttribute('href');
      await link.click(); expect(new URL(page.url()).hash).toBe(fragment);
    }
  } finally {await context.close();}
});
test('all desktop pages use the wider reading column',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  for(const route of ['/', '/talks/',long]) {
    await page.goto(route);
    expect((await page.locator('main').boundingBox()).width).toBeCloseTo(52*16,0);
    expect((await page.locator('.container').boundingBox()).width).toBeCloseTo(72*16,0);
  }
});
test('switching page types preserves horizontal alignment',async({page})=>{
  await page.setViewportSize({width:1440,height:900}); let x;
  for(const route of ['/', '/talks/',long]) {
    await page.goto(route);
    const current=(await page.locator('main').boundingBox()).x;
    if(x===undefined) x=current;
    expect(current).toBeCloseTo(x,0);
  }
});
