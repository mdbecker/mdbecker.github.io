const { isolateNetwork, copySource, buildSource } = require('./helpers.cjs');
const { test, expect, chromium, firefox } = require('@playwright/test');
const fs = require('fs');
test('Markdown is the authoritative editable content and supports rich edits', async ({ page }) => {
  expect(fs.existsSync('source/_data/profile.yml')).toBe(false);
  for (const name of ['intro','now','selected-work','talks-intro','side-quests'])
    expect(fs.existsSync(`source/_includes/home/${name}.md`)).toBe(true);
  const tmp = copySource('markdown-content-');
  try {
    fs.appendFileSync(`${tmp}/source/_includes/home/intro.md`, '\n\n**Bold edit** and *emphasis* with [a link](https://example.org/).\n\n- List edit\n');
    fs.appendFileSync(`${tmp}/source/_talks/ete-2021.md`, '\n\n**Talk edit** and *emphasis* with [a link](https://example.org/).\n\n- Talk list\n\nSecond paragraph.\n');
    for (const name of fs.readdirSync('source/_talks')) {
      const text = fs.readFileSync(`source/_talks/${name}`, 'utf8');
      expect(text.split('---')[1]).not.toMatch(/^description:/m);
      expect(text.split('---').slice(2).join('---').trim()).not.toBe('');
    }
    buildSource(tmp);
    for (const [file, bold, item] of [['index.html','Bold edit','List edit'],['talks/index.html','Talk edit','Talk list']]) {
      await page.setContent(fs.readFileSync(`${tmp}/public/${file}`,'utf8'));
      await expect(page.locator('strong').filter({hasText:bold})).toHaveCount(1);
      await expect(page.locator('em').filter({hasText:'emphasis'})).toHaveCount(1);
      await expect(page.locator('li').filter({hasText:item})).toHaveCount(1);
      expect(await page.locator('p p').count()).toBe(0);
    }
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
for (const engine of ['chromium','firefox'])
  test(`${engine} header reflows with enlarged text and usable controls`, async ({baseURL}) => {
    test.setTimeout(240000);
    const browser = await ({chromium,firefox}[engine]).launch();
    try {
      const page = await browser.newPage();
      await isolateNetwork(page);
      for (const width of [320,360,375,390,430,768,1440,1920]) for (const scale of [1,1.5,2]) for (const scheme of ['light','dark']) {
        await page.setViewportSize({width,height:900});
        await page.emulateMedia({colorScheme:scheme});
        await page.goto(baseURL+'/');
        await page.evaluate(scale => document.documentElement.style.fontSize = `${scale*100}%`,scale);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.locator('body').evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBe(20*scale);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`${engine} ${width} ${scale} ${scheme}`).toBe(true);
        const boxes = await page.locator('.site-header nav a, #theme-toggle').evaluateAll(es => es.map(e => {const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,clip:e.scrollWidth>e.clientWidth};}));
        expect(boxes).toHaveLength(7);
        for (const b of boxes) { expect(b.w).toBeGreaterThanOrEqual(44); expect(b.h).toBeGreaterThanOrEqual(44); expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x+b.w).toBeLessThanOrEqual(width); expect(b.clip).toBe(false); }
        for (let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++) {
          const a=boxes[i],b=boxes[j];
          expect(a.x+a.w<=b.x+.1 || b.x+b.w<=a.x+.1 || a.y+a.h<=b.y+.1 || b.y+b.h<=a.y+.1).toBe(true);
        }
        const nav = await page.locator('.nav').boundingBox(), utilities = await page.locator('.social-links').boundingBox();
        if(width<=430) { expect(utilities.y).toBeGreaterThanOrEqual(nav.y+nav.height); expect(Math.abs(nav.x-utilities.x)).toBeLessThan(1); expect(Math.abs(nav.width-utilities.width)).toBeLessThan(1); }
        if(width===1440 && scale===1) expect(Math.abs(nav.y-utilities.y)).toBeLessThan(3);
        for(const control of await page.locator('.site-header nav a, #theme-toggle').all()) {
          await control.focus(); expect(await control.evaluate(e => getComputedStyle(e).outlineStyle)).not.toBe('none');
        }
        await page.locator('#theme-toggle').click();
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme',scheme==='light'?'dark':'light');
        await page.evaluate(() => localStorage.clear());
      }
    } finally {await browser.close();}
  });
for(const engine of ['chromium','firefox']) test(`${engine} effective page zoom and keyboard order`,async({baseURL})=>{
 const browser=await ({chromium,firefox}[engine]).launch();
 try {
  const page=await browser.newPage();
  for(const scale of [1.5,2]) {
   // A narrower CSS viewport models the reflow caused by full browser zoom.
   await page.setViewportSize({width:Math.round(768/scale),height:Math.round(1024/scale)});
   await page.goto(baseURL+'/');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.locator('.nav a').first().focus();
   const labels=['About','Blog','Talks','Github Profile','Linkedin Profile','Twitter Profile','Switch to dark mode'];
   for(let i=0;i<labels.length;i++) {
    expect(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')||document.activeElement.textContent.trim())).toBe(labels[i]);
    if(i<labels.length-1) await page.keyboard.press('Tab');
   }
   await page.keyboard.press('Enter'); await page.reload();
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   await page.evaluate(()=>localStorage.clear());
  }
 } finally {await browser.close();}
});
for (const engine of ['chromium', 'firefox'])
  test(`${engine} enlarged article headings, TOC and code remain usable`, async ({ baseURL }) => {
    const browser = await ({ chromium, firefox }[engine]).launch();
    try {
      const page = await browser.newPage();
      await isolateNetwork(page);
      for (const width of [320, 768, 1440]) for (const scale of [1, 1.5, 2]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(baseURL + '/blog/2014/07/30/data-science-with-python-part-1/');
        await page.evaluate(scale => document.documentElement.style.fontSize = `${scale * 100}%`, scale);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine} article ${width} ${scale}`).toBe(true);
        const article = await page.locator('.article-body').boundingBox();
        const toc = await page.locator('.toc').boundingBox();
        expect(toc.y + toc.height <= article.y + 1 || toc.x >= article.x + article.width).toBe(true);
        for (const code of await page.locator('.highlight').all()) {
          const box = await code.boundingBox();
          expect(box.x + box.width).toBeLessThanOrEqual(width);
          expect(await code.evaluate(e => getComputedStyle(e).overflowX)).toBe('auto');
        }
      }
    } finally { await browser.close(); }
  });
test('Markdown headings retain unique IDs beside stable section anchors', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('[id]').evaluateAll(es => es.map(e => e.id));
  expect(new Set(ids).size).toBe(ids.length);
  await expect(page.locator('section#selected-work')).toHaveCount(1);
  await expect(page.locator('section#selected-talks')).toHaveCount(1);
});
