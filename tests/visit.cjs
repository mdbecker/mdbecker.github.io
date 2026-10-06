// Wait for the retained About URL's static redirect before inspecting its DOM.
module.exports = async function visit(page, route) {
  const response = await page.goto(route);
  if (route === '/about/') await page.waitForURL(new URL('/', page.url()).href);
  return response;
};
