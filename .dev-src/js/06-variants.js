
  /* ---------- Variant picker (product page) ---------- */
  qsa('[data-variant-picker]').forEach(picker => {
    const form = document.getElementById(picker.getAttribute('data-form-id'));
    const jsonEl = qs('[data-variants-json]', picker);
    const data = JSON.parse((jsonEl && jsonEl.textContent) || '[]');
    const idInput = form ? qs('[name="id"]', form) : null;
    const priceEl = qs('[data-product-price]');
    const compareEl = qs('[data-product-compare]');
    const submit = form ? qs('[type="submit"]', form) : null;
    const submitText = submit ? (qs('span', submit) || submit) : null;
    const fieldsets = qsa('fieldset', picker);

    const selected = () => fieldsets.map(fs => { const c = qs('input:checked', fs); return c ? c.value : null; });
    const find = (opts) => data.find(v => v.options.every((o, k) => o === opts[k]));

    const update = () => {
      const opts = selected();
      fieldsets.forEach((fs, idx) => { const out = qs('.variant-picker__selected', fs); if (out && opts[idx]) out.textContent = opts[idx]; });
      // mark availability per option against current selection
      fieldsets.forEach((fs, idx) => qsa('input', fs).forEach(inp => {
        const probe = opts.slice(); probe[idx] = inp.value;
        const match = probe.some(o => !o) ? data.find(v => v.options[idx] === inp.value) : find(probe);
        const label = inp.closest('label');
        if (label) label.classList.toggle('is-unavailable', !match || !match.available);
      }));
      if (opts.some(o => !o)) { if (idInput) idInput.value = ''; return; }
      const v = find(opts);
      if (!v) {
        if (idInput) idInput.value = '';
        if (submit) { submit.disabled = true; if (submitText) submitText.textContent = window.theme.strings.unavailable; }
        return;
      }
      if (idInput) idInput.value = v.id;
      if (priceEl) priceEl.textContent = formatMoney(v.price);
      qsa('[data-gift-value]').forEach(el => { el.textContent = formatMoney(v.price); });
      if (compareEl) {
        const onSale = v.compare_at_price && v.compare_at_price > v.price;
        compareEl.hidden = !onSale;
        if (onSale) compareEl.textContent = formatMoney(v.compare_at_price);
        const priceWrap = priceEl && priceEl.closest('.price');
        if (priceWrap) priceWrap.classList.toggle('price--sale', !!onSale);
      }
      if (submit) { submit.disabled = !v.available; if (submitText) submitText.textContent = v.available ? window.theme.strings.addToCart : window.theme.strings.soldOut; }
      const url = new URL(window.location); url.searchParams.set('variant', v.id); history.replaceState({}, '', url);
      // bring the variant's image to the front of the gallery (and its thumbnail to the top)
      if (v.featured_media && v.featured_media.id) {
        document.dispatchEvent(new CustomEvent('gallery:show', { detail: { mediaId: v.featured_media.id } }));
      }
    };
    picker.addEventListener('change', update);
    update();
  });

  /* ---------- Product gallery: thumbnails + dots ---------- */
  qsa('[data-gallery]').forEach(gal => {
    const track = qs('[data-gallery-track]', gal);
    const thumbWrap = qs('[data-gallery-thumbs]', gal);
    if (!track) return;
    const item = (id) => qs(`[data-media-id="${id}"]`, track);
    const thumb = (id) => thumbWrap ? qs(`[data-media-id="${id}"]`, thumbWrap) : null;
    const setActive = (id) => qsa('[data-gallery-thumb]', gal).forEach(t => t.setAttribute('aria-current', t.dataset.mediaId === String(id) ? 'true' : 'false'));
    qsa('[data-gallery-thumb]', gal).forEach(t => t.addEventListener('click', () => {
      item(t.dataset.mediaId)?.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
      setActive(t.dataset.mediaId);
    }));
    document.addEventListener('gallery:show', (e) => {
      const id = String(e.detail.mediaId);
      const target = item(id);
      if (!target || track.firstElementChild === target) return;
      track.prepend(target);
      const t = thumb(id); if (t) thumbWrap.prepend(t);
      setActive(id);
      // mobile: horizontal snap track — return to the first slide
      if (track.scrollWidth > track.clientWidth) track.scrollTo({ left: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => en.forEach(x => { if (x.isIntersecting) setActive(x.target.dataset.mediaId); }), { root: track, threshold: 0.6 });
      qsa('[data-media-id]', track).forEach(i => io.observe(i));
    }
  });

  /* ---------- Predictive search ---------- */
  qsa('[data-predictive-search]').forEach(wrap => {
    const input = qs('input[type="search"]', wrap);
    const results = qs('[data-predictive-results]', wrap);
    const status = qs('[data-predictive-status]', wrap);
    const idle = qs('[data-predictive-idle]', wrap);
    if (!input || !results) return;
    const showIdle = (on) => { if (idle) idle.hidden = !on; };
    let t, ctrl;
    input.addEventListener('input', () => {
      clearTimeout(t);
      const q = input.value.trim();
      if (q.length < 2) { ctrl?.abort(); results.innerHTML = ''; results.hidden = true; wrap.classList.remove('is-loading'); showIdle(true); return; }
      wrap.classList.add('is-loading');
      t = setTimeout(async () => {
        ctrl?.abort(); ctrl = new AbortController();
        try {
          const url = `${window.theme.routes.predictiveSearch}?q=${encodeURIComponent(q)}&resources[type]=query,collection,product,article,page&resources[limit]=6&resources[limit_scope]=each&resources[options][prefix]=last&section_id=predictive-search`;
          const res = await fetch(url, { signal: ctrl.signal });
          const html = await res.text();
          const tmp = document.createElement('div'); tmp.innerHTML = html;
          const inner = qs('#shopify-section-predictive-search', tmp);
          results.innerHTML = inner ? inner.innerHTML : html;
          results.hidden = false;
          showIdle(false);
          if (status) status.textContent = results.querySelectorAll('.ps-product').length + ' products';
        } catch (_) {} finally { wrap.classList.remove('is-loading'); }
      }, 250);
    });
  });

  document.dispatchEvent(new CustomEvent('theme:ready'));
})();
