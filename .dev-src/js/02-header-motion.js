
  /* ---------- Header: solid on scroll + hide on scroll-down ---------- */
  const header = qs('[data-header]');
  if (header) {
    let lastY = window.scrollY, ticking = false;
    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      if (header.hasAttribute('data-hide-on-scroll')) {
        const goingDown = y > lastY && y > 160;
        header.classList.toggle('is-hidden', goingDown && !qs('.mega-menu.is-open', header));
      }
      lastY = y; ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  /* ---------- Mega menu (hover on desktop, click on touch; keyboard accessible) ---------- */
  const megaHeader = qs('[data-header]');
  const syncMegaState = () => megaHeader?.classList.toggle('is-mega-open', !!qs('[data-mega-item].is-open'));
  const closeMegaItem = (el) => {
    el.classList.remove('is-open');
    qs('.mega-menu', el)?.classList.remove('is-open');
    qs('[data-mega-trigger]', el)?.setAttribute('aria-expanded', 'false');
    syncMegaState();
  };
  qsa('[data-mega-item]').forEach(item => {
    const trigger = qs('[data-mega-trigger]', item);
    const panel = qs('.mega-menu', item);
    if (!trigger || !panel) return;
    let closeTimer;
    const openPanel = () => {
      clearTimeout(closeTimer);
      qsa('[data-mega-item].is-open').forEach(i => i !== item && closeMegaItem(i));
      item.classList.add('is-open'); panel.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true');
      syncMegaState();
    };
    if (!isTouch) {
      item.addEventListener('mouseenter', openPanel);
      item.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => closeMegaItem(item), 120); });
    }
    trigger.addEventListener('click', (e) => {
      if (isTouch || trigger.tagName === 'BUTTON') { e.preventDefault(); item.classList.contains('is-open') ? closeMegaItem(item) : openPanel(); }
    });
    trigger.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); openPanel(); qs('a', panel)?.focus(); } });
    item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMegaItem(item); trigger.focus(); } });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) closeMegaItem(item); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-mega-item]')) qsa('[data-mega-item].is-open').forEach(closeMegaItem); });

  /* ---------- Mobile menu: nested panels ---------- */
  qsa('[data-mobile-menu]').forEach(menu => {
    menu.addEventListener('click', (e) => {
      const next = e.target.closest('[data-submenu-open]');
      const back = e.target.closest('[data-submenu-back]');
      if (next) {
        e.preventDefault();
        const panel = qs(`[data-submenu="${next.getAttribute('data-submenu-open')}"]`, menu);
        if (panel) {
          panel.removeAttribute('hidden');
          requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-active')));
          next.setAttribute('aria-expanded', 'true');
          qs('[data-submenu-back]', panel)?.focus({ preventScroll: true });
        }
      }
      if (back) {
        e.preventDefault();
        const panel = back.closest('[data-submenu]');
        panel.classList.remove('is-active');
        setTimeout(() => panel.setAttribute('hidden', ''), 300);
        const opener = qs(`[data-submenu-open="${panel.getAttribute('data-submenu')}"]`, menu);
        opener?.setAttribute('aria-expanded', 'false');
        opener?.focus();
      }
    });
    // Closing the drawer returns it to the top level next time
    menu.addEventListener('drawer:close', () => {
      setTimeout(() => {
        if (menu.classList.contains('is-open')) return;
        qsa('[data-submenu].is-active', menu).forEach(p => { p.classList.remove('is-active'); p.setAttribute('hidden', ''); });
        qsa('[data-submenu-open]', menu).forEach(b => b.setAttribute('aria-expanded', 'false'));
      }, 400);
    });
  });

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    qsa('.reveal, .reveal-stagger').forEach(el => io.observe(el));
  } else {
    qsa('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Announcement marquee: pause control + reduced motion ---------- */
  qsa('[data-marquee]').forEach(m => {
    const btn = qs('[data-marquee-toggle]', m);
    if (prefersReducedMotion.matches) m.classList.add('is-paused');
    const setLabel = () => { if (btn) { const paused = m.classList.contains('is-paused'); btn.setAttribute('aria-pressed', String(paused)); btn.setAttribute('aria-label', paused ? btn.dataset.playLabel : btn.dataset.pauseLabel); } };
    btn?.addEventListener('click', () => { m.classList.toggle('is-paused'); setLabel(); });
    m.addEventListener('mouseenter', () => m.classList.add('is-hover'));
    m.addEventListener('mouseleave', () => m.classList.remove('is-hover'));
    setLabel();
  });

  /* ---------- Hero video: pause control, stop off-screen, reduced motion ---------- */
  qsa('[data-video-hero]').forEach(wrap => {
    const video = qs('video', wrap);
    const btn = qs('[data-video-toggle]', wrap);
    if (!video) return;
    const setState = (playing) => { wrap.classList.toggle('is-playing', playing); if (btn) { btn.setAttribute('aria-pressed', String(!playing)); btn.setAttribute('aria-label', playing ? btn.dataset.pauseLabel : btn.dataset.playLabel); } };
    const play = () => video.play().then(() => setState(true)).catch(() => setState(false));
    const pause = () => { video.pause(); setState(false); };
    let userPaused = prefersReducedMotion.matches;
    if (userPaused) pause(); else play();
    btn?.addEventListener('click', () => { userPaused = !video.paused; video.paused ? play() : pause(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { en.forEach(x => { if (x.isIntersecting) { if (!userPaused) play(); } else video.pause(); }); }, { threshold: 0.2 }).observe(wrap);
    }
  });
