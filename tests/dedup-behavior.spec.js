const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

function feeds(root) {
  return fs.readdirSync(root, { recursive: true }).filter(f => f === 'atom.xml' || f.endsWith('/atom.xml')).sort();
}
test('Atom feeds retain complete identities, dates, ordered entries and article HTML', async ({ page }) => {
  const files = feeds('public');
  expect(files.length).toBeGreaterThan(1);
  for (const file of files) {
    const xml = fs.readFileSync(path.join('public', file), 'utf8');
    const parse = async text => page.evaluate(text => {
      const doc = new DOMParser().parseFromString(text, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Invalid Atom XML');
      const element = e => ({ name: e.localName, attributes: [...e.attributes].map(a => [a.name, a.value]),
        children: [...e.children].map(element), text: e.children.length ? null : e.textContent });
      return element(doc.documentElement);
    }, text);
    const actual = await parse(xml);
    expect(actual.name).toBe('feed');
    const entries = actual.children.filter(e => e.name === 'entry');
    expect(entries.length).toBeLessThanOrEqual(file === 'atom.xml' ? 20 : 5);
    expect(actual.children.find(e => e.name === 'id').text).toBe('https://beckerfuffle.com/');
    for (const entry of entries) {
      expect(entry.children.find(e => e.name === 'id').text).toMatch(/^https:\/\/beckerfuffle.com\/blog\//);
      expect(entry.children.find(e => e.name === 'content').text).toContain('<');
    }
    if (process.env.DEDUP_BASELINE) {
      expect(actual, file).toEqual(await parse(fs.readFileSync(path.join(process.env.DEDUP_BASELINE, file), 'utf8')));
    }
  }
  if (process.env.DEDUP_BASELINE) expect(files).toEqual(feeds(process.env.DEDUP_BASELINE));
});

test('all generated pages preserve rendered content, URLs, anchors and site identity', async ({ page }) => {
  test.skip(!process.env.DEDUP_BASELINE, 'Optional full output comparison against a pre-cleanup build');
  const files = fs.readdirSync('public', { recursive: true }).filter(f => f.endsWith('.html')).sort();
  const normalize = html => page.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // The PRD explicitly removes this empty, invisible Octopress placeholder.
    doc.querySelectorAll('div.sharing:empty').forEach(e => e.remove());
    const walk = node => {
      if (node.nodeType === 8) return null;
      if (node.nodeType === 3) return node.textContent.trim() ? node.textContent.replace(/\s+/g, ' ').trim() : null;
      return { name: node.nodeName, attributes: [...(node.attributes || [])].map(a => [a.name,a.value]), children: [...node.childNodes].map(walk).filter(x => x !== null) };
    };
    return walk(doc.documentElement);
  }, html);
  for (const file of files) expect(await normalize(fs.readFileSync(path.join('public', file), 'utf8')), file)
    .toEqual(await normalize(fs.readFileSync(path.join(process.env.DEDUP_BASELINE, file), 'utf8')));
});
