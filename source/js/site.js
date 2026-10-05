/* The existing theme needs only a navigation toggle and mobile post ordering. */
(() => {
  const toggle = document.querySelector('.btn-navbar');
  const navigation = document.getElementById('site-navigation');
  if (toggle && navigation) {
    // Navigation is expanded when JavaScript is unavailable.
    const setExpanded = expanded => {
      toggle.setAttribute('aria-expanded', String(expanded));
      navigation.style.height = expanded ? 'auto' : '0px';
      navigation.classList.toggle('in', expanded);
    };
    setExpanded(false);
    toggle.addEventListener('click', () => {
      setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  const mobile = window.matchMedia('(max-width: 767px)');
  const posts = [...document.querySelectorAll('.blog-index article')].map(article => ({
    row: article.querySelector('.row-fluid'),
    meta: article.querySelector('.post-meta'),
    content: article.querySelector('.post-container'),
    date: article.querySelector('.date-time')
  })).filter(post => post.meta && post.content && post.date);
  const arrange = () => posts.forEach(({row, meta, content, date}) => {
    if (mobile.matches) {
      row.append(meta);
      content.querySelector('.link').after(date);
    } else {
      row.insertBefore(meta, content);
      meta.prepend(date);
    }
  });
  arrange();
  mobile.addEventListener('change', arrange);
})();
