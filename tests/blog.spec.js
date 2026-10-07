const { test, expect } = require('@playwright/test');
const { isolateNetwork, copySource, buildSource } = require('./helpers.cjs');
const fs = require('node:fs');

test('Blog discovery offers readable previews, archive discovery and a matching TOC', async ({ page }) => {
  await isolateNetwork(page);
  await page.goto('/');
  await expect(page.locator('#writing article')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Read the blog →' })).toHaveAttribute('href', '/blog/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator('main h1')).toHaveText('Blog');
  await expect(page.locator('.blog-index article')).toHaveCount(6);
  await expect(page.getByRole('navigation', { name: 'On this page' })).toHaveCount(1);
  expect(await page.locator('.toc a').allTextContents()).toEqual(await page.locator('.blog-index h3 a').allTextContents());
  for (const article of await page.locator('.blog-index article').all()) {
    await expect(article.locator('time')).toBeVisible();
    expect(await article.locator('.meta a').count()).toBeLessThanOrEqual(3);
    const excerpt = await article.locator('.excerpt').textContent();
    expect(excerpt.trim().split(/\s+/).length).toBeLessThanOrEqual(85);
    expect(excerpt.trim().length).toBeGreaterThan(20);
    await expect(article.getByRole('link', { name: 'Read more →' })).toHaveAttribute('href', await article.locator('h3 a').getAttribute('href'));
    await expect(article.locator('img, iframe, table, pre')).toHaveCount(0);
  }
  for (const link of await page.locator('.toc a').all())
    await expect(page.locator(await link.getAttribute('href'))).toHaveCount(1);
  await page.getByRole('link', { name: 'Browse all posts in the archive →' }).click();
  await expect(page).toHaveURL(/\/blog\/archives\/$/);
  await expect(page.locator('.excerpt')).toHaveCount(0);
});

test('Twenty-two posts paginate only on Blog with bounded future excerpts and complete About', async ({ page }) => {
  const tmp = copySource('blog-pagination-');
  try {
    for (let i = 1; i <= 16; i++) fs.writeFileSync(`${tmp}/source/_posts/2026-01-${String(i).padStart(2,'0')}-preview-${i}.md`,
      `---\nlayout: post\ntitle: Preview ${i}\ndate: 2026-01-${String(i).padStart(2,'0')}\ncategories: [Python, Testing, Writing, Extra]\n---\n${'Readable **future** prose. '.repeat(100)}\n`);
    const root = buildSource(tmp);
    const titles = [];
    for (const [index, file, count] of [[1,'blog/index.html',10],[2,'blog/page/2/index.html',10],[3,'blog/page/3/index.html',2]]) {
      await page.setContent(fs.readFileSync(`${root}/${file}`, 'utf8'));
      await expect(page.locator('.blog-index article')).toHaveCount(count);
      const current = await page.locator('.blog-index h3 a').allTextContents();
      titles.push(...current);
      expect(await page.locator('.toc a').allTextContents()).toEqual(current);
      for (const link of await page.locator('.toc a').all()) await expect(page.locator(await link.getAttribute('href'))).toHaveCount(1);
      await expect(page.locator('.nav a[aria-current]')).toHaveText('Blog');
      if (index < 3) await expect(page.getByRole('link', {name:'← Older'})).toHaveAttribute('href', `/blog/page/${index+1}/`);
      if (index > 1) await expect(page.getByRole('link', {name:'Newer →'})).toHaveAttribute('href', index === 2 ? '/blog/' : '/blog/page/2/');
      if (index === 1) {
        expect(current).toEqual(Array.from({length:10},(_,i)=>`Preview ${16-i}`));
        const excerpt = await page.locator('.excerpt').first().textContent();
        expect(excerpt.trim().split(/\s+/).length).toBe(85);
        expect(excerpt).toContain('Readable future prose.');
        expect(excerpt).not.toContain('**');
        await expect(page.locator('article .meta').first().locator('a')).toHaveCount(3);
      }
    }
    expect(new Set(titles).size).toBe(22);
    await page.setContent(fs.readFileSync(`${root}/index.html`, 'utf8'));
    await expect(page.locator('#writing article')).toHaveCount(3);
    for (const id of ['now','selected-work','selected-talks','writing','side-quests']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator('.pagination')).toHaveCount(0);
    expect(fs.existsSync(`${root}/posts/2/index.html`)).toBe(false);
    expect(fs.existsSync(`${root}/blog/page/1/index.html`)).toBe(false);
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});

test('Blog stays the active section for indexes, articles and categories', async ({ page }) => {
  for (const route of ['/blog/','/blog/archives/','/blog/categories/python/','/blog/2013/02/14/working-with-email-content/']) {
    await page.goto(route);
    await expect(page.locator('.nav a[aria-current]')).toHaveText('Blog');
  }
  await page.goto('/');
  await expect(page.locator('.nav a[aria-current]')).toHaveText('About');
});
