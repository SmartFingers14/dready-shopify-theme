
  /* ---------- Scroller (horizontal carousel) with prev/next + keyboard ---------- */
  qsa('[data-scroller-wrap]').forEach(wrap => {
    const track = qs('[data-scroller]', wrap);
    const prev = qs('[data-scroller-prev]', wrap);
    const next = qs('[data-scroller-next]', wrap);
    if (!track) return;
    const step = () => { const first = track.firstElementChild; return first ? first.getBoundingClientRect().width + 12 : track.clientWidth * 0.8; };
    const updateBtns = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior }));
    track.addEventListener('scroll', () => requestAnimationFrame(updateBtns), { passive: true });
    window.addEventListener('resize', updateBtns);
    updateBtns();
  });

  /* ---------- Slideshow (comic strip): auto-rotate w/ pause, stops on hover/focus ---------- */
  qsa('[data-slideshow]').forEach(show => {
    const slides = qsa('[data-slide]', show);
    const dots = qsa('[data-slide-dot]', show);
    const prev = qs('[data-slide-prev]', show);
    const next = qs('[data-slide-next]', show);
    const toggle = qs('[data-slide-toggle]', show);
    const live = qs('[data-slide-live]', show);
    const autoplay = show.hasAttribute('data-autoplay') && !prefersReducedMotion.matches;
    const interval = parseInt(show.getAttribute('data-interval') || '5000', 10);
    if (slides.length < 2) return;
    let i = 0, timer = null, paused = !autoplay;

    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', String(k !== i)); s.toggleAttribute('inert', k !== i); });
      dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
      if (live) live.textContent = (show.dataset.slideLabel || 'Slide {{ current }} of {{ total }}').replace('{{ current }}', i + 1).replace('{{ total }}', slides.length);
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (paused) return; stop(); timer = setInterval(() => go(i + 1), interval); };
    const setToggle = () => { if (toggle) { toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel); toggle.classList.toggle('is-paused', paused); } };

    prev?.addEventListener('click', () => { go(i - 1); start(); });
    next?.addEventListener('click', () => { go(i + 1); start(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
    toggle?.addEventListener('click', () => { paused = !paused; paused ? stop() : start(); setToggle(); });
    show.addEventListener('mouseenter', stop);
    show.addEventListener('mouseleave', start);
    show.addEventListener('focusin', stop);
    show.addEventListener('focusout', (e) => { if (!show.contains(e.relatedTarget)) start(); });
    show.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });

    let sx = 0;
    show.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1); });

    if ('IntersectionObserver' in window) new IntersectionObserver((en) => en.forEach(x => x.isIntersecting ? start() : stop()), { threshold: 0.3 }).observe(show);
    go(0); setToggle(); start();
  });
