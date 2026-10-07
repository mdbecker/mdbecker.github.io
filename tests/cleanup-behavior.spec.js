const { isolateNetwork } = require('./helpers.cjs');
const { test, expect, chromium, firefox } = require('@playwright/test');
const fs = require('node:fs');
const routes = ['/', '/blog/', '/blog/archives/', '/talks/', '/blog/2013/02/14/working-with-email-content/', '/blog/2014/07/30/data-science-with-python-part-1/'];
// Given editorial pages and historical articles, their appearance remains stable
// across accessible reflow, themes, and print. Optional captures compare a refactor
// with its own baseline; the permanent checks require no screenshot fixtures.
for (const browserName of ['chromium', 'firefox']) {
    test(`${browserName} editorial sections, navigation, historical content and print preserve appearance`, async ({ baseURL }) => {
      const browser = await ({ chromium, firefox }[browserName]).launch();
      const page = await browser.newPage();
      try {
      test.setTimeout(600000);
      await isolateNetwork(page);
      for (const width of [320, 375, 390, 768, 1440, 1920]) for (const scale of [100, 150, 200]) for (const theme of ['light', 'dark', 'print']) {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ media: theme === 'print' ? 'print' : 'screen', colorScheme: theme === 'dark' ? 'dark' : 'light' });
        for (const [index, route] of routes.entries()) {
          await page.goto(baseURL + route);
          await page.evaluate(s => document.documentElement.style.fontSize = s + '%', scale);
          await page.evaluate(() => document.fonts.ready);
          await expect(page.locator('main h1')).toHaveCount(1);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          if (theme === 'print') await expect(page.locator('.site-header nav')).toBeHidden();
          else for (const name of ['About', 'Blog', 'Talks']) await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name, exact: true })).toBeVisible();
          const key = `${browserName}-${width}-${scale}-${theme}-${index}`;
          if (process.env.CLEANUP_CAPTURE) {
            fs.mkdirSync(process.env.CLEANUP_CAPTURE, { recursive: true });
            const styles = await page.locator('body, main, .home-section, .talk-entry, .site-header nav, .site-header nav a, #theme-toggle, .article-body, .article-body img, .highlight, .toc, .meta, h1, h2, h3').evaluateAll(elements => elements.map(e => {
              const c = getComputedStyle(e), r = e.getBoundingClientRect();
              return { tag: e.tagName, text: e.textContent.trim().replace(/\s+/g, ' '), geometry: [r.x,r.y,r.width,r.height], styles: Object.fromEntries(['color','backgroundColor','fontSize','lineHeight','margin','padding','border','position','display','gap'].map(p => [p,c[p]])) };
            }));
            const json = JSON.stringify(styles);
            if (process.env.CLEANUP_COMPARE) {
              const baseline = JSON.parse(fs.readFileSync(`${process.env.CLEANUP_COMPARE}/${key}.json`, 'utf8'));
              baseline.forEach(e => e.text = e.text.replace(/\s+/g, ' '));
              expect(styles, key).toEqual(baseline);
            }
            fs.writeFileSync(`${process.env.CLEANUP_CAPTURE}/${key}.json`, json);
            // Representative full-page captures, without masking any components.
            if (scale === 100 && [390,768,1440].includes(width)) {
              const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
              fs.writeFileSync(`${process.env.CLEANUP_CAPTURE}/${key}.png`, png);
              if (process.env.CLEANUP_COMPARE) expect(png.equals(fs.readFileSync(`${process.env.CLEANUP_COMPARE}/${key}.png`)), key).toBe(true);
            }
          }
        }
      }
      } finally { await browser.close(); }
    });
}
