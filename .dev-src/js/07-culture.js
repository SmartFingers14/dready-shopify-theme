
/* ---------- Culture pages: gallery filters + lightbox, click-to-play video ---------- */
(() => {
  'use strict';
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ===== Gallery walls → one filter bar, one lightbox ===== */
  const walls = qsa('[data-gallery-wall]');
  if (walls.length) {
    const first = walls[0];
    const t = (key, fallback) => first.dataset[key] || fallback;

    /* Filter bar: lives outside the walls so hiding a wall never hides the bar */
    const placeholder = qs('[data-gallery-filters]', first);
    const barWrap = document.createElement('div');
    barWrap.className = 'gallery-filters-wrap page-width';
    barWrap.innerHTML = `<div class="gallery-wall__bar"><div class="gallery-wall__filters" role="group" aria-label="${t('i18nFilter', 'Filter')}"></div><p class="gallery-wall__status muted" aria-live="polite"></p></div>`;
    const filtersEl = qs('.gallery-wall__filters', barWrap);
    const statusEl = qs('.gallery-wall__status', barWrap);
    const anchor = first.closest('.shopify-section') || first;
    anchor.parentNode.insertBefore(barWrap, anchor);
    placeholder?.remove();
    barWrap.style.paddingTop = 'var(--section-pad)';
    walls.forEach(w => { w.style.paddingTop = '0'; });

    const total = walls.reduce((n, w) => n + Number(w.dataset.count || 0), 0);
    const filters = [{ key: 'all', label: t('i18nAll', 'All'), count: total }]
      .concat(walls.map((w, i) => ({ key: String(i), label: w.dataset.label, count: Number(w.dataset.count || 0) })));
    if (walls.length > 1) {
      filters.forEach(f => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'gallery-filter'; b.dataset.filter = f.key;
        b.innerHTML = `${f.label} <span class="gallery-filter__count">${f.count}</span>`;
        filtersEl.appendChild(b);
      });
    }

    const current = walls.findIndex(w => w.hasAttribute('data-current'));
    let active = current >= 0 ? String(current) : 'all';

    const apply = (key, focusFirst = false) => {
      active = key;
      walls.forEach((w, i) => {
        const show = key === 'all' || String(i) === key;
        (w.closest('.shopify-section') || w).hidden = !show;
      });
      qsa('.gallery-filter', filtersEl).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
      const f = filters.find(x => x.key === key);
      statusEl.textContent = f ? `${f.count} ${f.count === 1 ? 'photo' : 'photos'}` : '';
      if (focusFirst) revealVisible();
    };
    filtersEl.addEventListener('click', (e) => {
      const b = e.target.closest('.gallery-filter');
      if (!b || b.dataset.filter === active) return;
      apply(b.dataset.filter, true);
      const top = barWrap.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });

    /* Tiles fade up as they enter (only those below the fold, so the first screen paints instantly) */
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' }) : null;
    const revealVisible = () => {
      qsa('.gallery-tile', document).forEach(tile => {
        if (tile.dataset.reveal === undefined && io && tile.getBoundingClientRect().top > window.innerHeight) {
          tile.dataset.reveal = ''; io.observe(tile);
        }
      });
    };
    apply(active);
    revealVisible();

    /* Lightbox */
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', t('i18nViewer', 'Image viewer'));
    dlg.innerHTML = `
      <div class="lightbox__top">
        <p class="lightbox__count label"><span data-lightbox-index>1</span> / <span data-lightbox-total>1</span><span class="lightbox__cat" data-lightbox-cat></span></p>
        <button type="button" class="lightbox__btn" data-lightbox-close aria-label="${t('i18nClose', 'Close')}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
      <figure class="lightbox__stage" data-lightbox-stage>
        <img class="lightbox__img" data-lightbox-img alt="">
        <figcaption class="lightbox__caption" data-lightbox-caption></figcaption>
      </figure>
      <button type="button" class="lightbox__btn lightbox__nav lightbox__nav--prev" data-lightbox-prev aria-label="${t('i18nPrev', 'Previous')}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></button>
      <button type="button" class="lightbox__btn lightbox__nav lightbox__nav--next" data-lightbox-next aria-label="${t('i18nNext', 'Next')}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`;
    document.body.appendChild(dlg);
    const img = qs('[data-lightbox-img]', dlg);
    const stage = qs('[data-lightbox-stage]', dlg);
    let items = [], index = 0, opener = null;

    const visibleItems = () => qsa('[data-lightbox-item]').filter(b => !b.closest('[hidden]'));
    const preload = (i) => { const b = items[(i + items.length) % items.length]; if (b) { const im = new Image(); im.src = b.dataset.full; } };
    const show = (i) => {
      index = (i + items.length) % items.length;
      const b = items[index];
      const wall = b.closest('[data-gallery-wall]');
      img.classList.add('is-loading');
      img.onload = () => img.classList.remove('is-loading');
      img.src = b.dataset.full;
      img.alt = b.dataset.alt || '';
      qs('[data-lightbox-caption]', dlg).textContent = b.dataset.caption || '';
      qs('[data-lightbox-index]', dlg).textContent = String(index + 1).padStart(2, '0');
      qs('[data-lightbox-total]', dlg).textContent = String(items.length).padStart(2, '0');
      qs('[data-lightbox-cat]', dlg).textContent = wall ? wall.dataset.label : '';
      preload(index + 1); preload(index - 1);
    };
    const open = (btn) => {
      items = visibleItems();
      opener = btn;
      show(items.indexOf(btn));
      document.body.classList.add('lightbox-open');
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      qs('[data-lightbox-close]', dlg).focus();
    };
    const close = () => { if (dlg.open) dlg.close(); };
    dlg.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      img.removeAttribute('src');
      opener?.focus();
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lightbox-item]');
      if (btn) { e.preventDefault(); open(btn); }
    });
    dlg.addEventListener('click', (e) => {
      if (e.target.closest('[data-lightbox-close]')) return close();
      if (e.target.closest('[data-lightbox-prev]')) return show(index - 1);
      if (e.target.closest('[data-lightbox-next]')) return show(index + 1);
      if (e.target === dlg || e.target === stage) close();
    });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });
    let x0 = null;
    stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  }

  /* ===== Click-to-play video (privacy-enhanced YouTube, loaded only on demand) ===== */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-video-play]');
    if (!btn) return;
    const media = btn.closest('[data-video]');
    const id = media && media.dataset.video;
    if (!id) return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    frame.title = media.dataset.videoTitle || 'Video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    media.appendChild(frame);
    btn.remove();
    frame.focus();
  });
})();
