(() => {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const preference = matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.dataset.theme || (preference.matches ? 'dark' : 'light');
  const update = () => {
    const theme = current();
    button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    button.title = button.getAttribute('aria-label');
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = root.dataset.theme ? (theme === 'dark' ? '#151713' : '#fffff8') : (meta.media.includes('dark') ? '#151713' : '#fffff8');
    });
  };
  if (!button) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    const theme = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('beckerfuffle-theme', theme); } catch (_) {}
    update();
  });
  preference.addEventListener('change', update);
  window.addEventListener('storage', event => {
    if (event.key !== 'beckerfuffle-theme') return;
    if (event.newValue === 'light' || event.newValue === 'dark') root.dataset.theme = event.newValue;
    else delete root.dataset.theme;
    update();
  });
  update();
})();
