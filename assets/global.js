/* =====================================================================
   DREADY ORIGINAL — global.js
   Vanilla web components, no build step. Progressive enhancement:
   everything renders server-side; JS adds drawers, quick-add, motion.
   ===================================================================== */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Utilities ---------- */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const formatMoney = (cents, format = (window.theme && window.theme.moneyFormat) || '{{amount}}') => {
    const value = (cents / 100).toFixed(2);
    const [whole, dec] = value.split('.');
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const map = {
      amount: `${withCommas}.${dec}`,
      amount_no_decimals: withCommas,
      amount_with_comma_separator: `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`,
      amount_no_decimals_with_comma_separator: whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => map[key] ?? map.amount);
  };

  const toast = (msg) => {
    const el = qs('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-visible'), 2600);
  };

  const trapFocus = (container) => {
    const focusable = () => qsa('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', container).filter(el => el.offsetParent !== null);
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const els = focusable();
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  };

  window.theme = Object.assign(window.theme || {}, { formatMoney, toast });

  /* ---------- Drawer manager (cart, search, menu) ---------- */
  const Drawers = (() => {
    let active = null, release = null, opener = null;
    const overlay = () => qs('[data-overlay]');

    const open = (id, triggerEl) => {
      const drawer = document.getElementById(id);
      if (!drawer) return;
      if (active && active !== drawer) close(false);
      opener = triggerEl || document.activeElement;
      active = drawer;
      drawer.classList.add('is-open');
      drawer.removeAttribute('aria-hidden');
      overlay()?.classList.add('is-open');
      document.body.classList.add('drawer-open');
      release = trapFocus(drawer);
      const focusTarget = qs('[data-autofocus]', drawer) || qs('.drawer__close', drawer);
      setTimeout(() => focusTarget?.focus(), 50);
      qsa(`[aria-controls="${id}"]`).forEach(b => b.setAttribute('aria-expanded', 'true'));
      drawer.dispatchEvent(new CustomEvent('drawer:open'));
    };

    const close = (restoreFocus = true) => {
      if (!active) return;
      const drawer = active;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      overlay()?.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      if (release) release(); release = null;
      qsa(`[aria-controls="${drawer.id}"]`).forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (restoreFocus && opener && typeof opener.focus === 'function') opener.focus();
      active = null;
      drawer.dispatchEvent(new CustomEvent('drawer:close'));
    };

    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('[data-drawer-open]');
      if (openBtn) { e.preventDefault(); open(openBtn.getAttribute('data-drawer-open'), openBtn); return; }
      if (e.target.closest('[data-drawer-close]') || e.target.matches('[data-overlay]')) { e.preventDefault(); close(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && active) close(); });

    return { open, close, get active() { return active; } };
  })();
  window.theme.drawers = Drawers;

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
  const closeMegaItem = (el) => {
    el.classList.remove('is-open');
    qs('.mega-menu', el)?.classList.remove('is-open');
    qs('[data-mega-trigger]', el)?.setAttribute('aria-expanded', 'false');
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
        if (panel) { panel.classList.add('is-active'); panel.removeAttribute('hidden'); qs('[data-submenu-back]', panel)?.focus(); }
      }
      if (back) {
        e.preventDefault();
        const panel = back.closest('[data-submenu]');
        panel.classList.remove('is-active');
        setTimeout(() => panel.setAttribute('hidden', ''), 300);
        qs(`[data-submenu-open="${panel.getAttribute('data-submenu')}"]`, menu)?.focus();
      }
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

  /* ---------- Product card: touch image swap (hover fallback) ---------- */
  if (isTouch) {
    qsa('[data-card-media][data-has-second]').forEach(media => {
      let sx = 0;
      media.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
      media.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 30) { e.preventDefault(); media.classList.toggle('show-second'); } });
    });
  }

  /* ---------- Flip cards (events) ---------- */
  qsa('[data-flip]').forEach(card => {
    const btn = qs('[data-flip-toggle]', card);
    const back = qs('[data-flip-back]', card);
    const set = (on) => { card.classList.toggle('is-flipped', on); btn?.setAttribute('aria-expanded', String(on)); back?.toggleAttribute('inert', !on); };
    btn?.addEventListener('click', () => set(!card.classList.contains('is-flipped')));
    qs('[data-flip-close]', card)?.addEventListener('click', () => { set(false); btn?.focus(); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Escape' && card.classList.contains('is-flipped')) { set(false); btn?.focus(); } });
    set(false);
  });

  /* ---------- Shop the look hotspots ---------- */
  qsa('[data-hotspots]').forEach(scene => {
    const pins = qsa('[data-hotspot]', scene);
    const pops = qsa('[data-hotspot-pop]', scene);
    const closeAll = () => { pins.forEach(p => p.setAttribute('aria-expanded', 'false')); pops.forEach(p => { p.hidden = true; }); };
    pins.forEach(pin => pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const pop = document.getElementById(pin.getAttribute('aria-controls'));
      const isOpen = pin.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!isOpen && pop) { pin.setAttribute('aria-expanded', 'true'); pop.hidden = false; }
    }));
    scene.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    document.addEventListener('click', (e) => { if (!scene.contains(e.target)) closeAll(); });
  });

  /* ---------- Quantity inputs ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty-change]');
    if (!btn) return;
    const input = qs('input', btn.closest('[data-qty]'));
    if (!input) return;
    const min = parseInt(input.min || '0', 10);
    const val = Math.max(min, (parseInt(input.value, 10) || 0) + parseInt(btn.getAttribute('data-qty-change'), 10));
    input.value = val;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- Details-based disclosure: close others in a group ---------- */
  qsa('[data-accordion-single]').forEach(group => {
    qsa('details', group).forEach(d => d.addEventListener('toggle', () => { if (d.open) qsa('details', group).forEach(o => { if (o !== d) o.open = false; }); }));
  });

  /* ---------- Localization form auto-submit ---------- */
  qsa('[data-localization-form] select').forEach(sel => sel.addEventListener('change', () => sel.form.submit()));

  /* ---------- Copy link ---------- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    try { await navigator.clipboard.writeText(btn.getAttribute('data-copy')); toast(btn.dataset.copiedLabel || 'Copied'); } catch (_) {}
  });

  /* ---------- Cart API + drawer rendering ---------- */
  const Cart = (() => {
    const routes = () => window.theme.routes;
    const sectionId = 'cart-drawer';

    const request = async (url, body) => {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.description || data.message || window.theme.strings.cartError);
      return data;
    };

    const renderDrawer = (html) => {
      const drawer = document.getElementById('CartDrawer');
      if (!drawer || !html) return;
      const tmp = document.createElement('div'); tmp.innerHTML = html;
      const fresh = qs('#CartDrawer', tmp) || qs('.drawer', tmp);
      if (fresh) { const wasOpen = drawer.classList.contains('is-open'); drawer.innerHTML = fresh.innerHTML; if (wasOpen) drawer.classList.add('is-open'); }
    };

    const updateCounts = (count) => {
      qsa('[data-cart-count]').forEach(el => { el.textContent = count; el.classList.toggle('is-empty', count === 0); });
    };

    const refresh = async () => {
      const res = await fetch(`${routes().cart}?section_id=${sectionId}`);
      renderDrawer(await res.text());
      const cart = await (await fetch(`${routes().cart}.js`)).json();
      updateCounts(cart.item_count);
      return cart;
    };

    const add = async (variantId, quantity = 1, properties) => {
      await request(routes().cartAdd + '.js', { items: [{ id: variantId, quantity, properties }] });
      const cart = await refresh();
      document.dispatchEvent(new CustomEvent('cart:added', { detail: { variantId, cart } }));
      return cart;
    };

    const change = async (line, quantity) => {
      const data = await request(routes().cartChange + '.js', { line, quantity, sections: sectionId });
      renderDrawer(data.sections && data.sections[sectionId]);
      updateCounts(data.item_count);
      return data;
    };

    return { add, change, refresh };
  })();
  window.theme.cart = Cart;

  const useDrawer = () => !(window.theme.settings && window.theme.settings.cartType === 'page');

  /* ---------- Quick add (size on card) ---------- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault();
    if (btn.disabled) return;
    const id = btn.getAttribute('data-quick-add');
    btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true');
    try {
      await Cart.add(id, 1);
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 1200);
      if (useDrawer()) Drawers.open('CartDrawer', btn); else toast(window.theme.strings.addedToCart);
    } catch (err) {
      toast(err.message || window.theme.strings.cartError);
    } finally {
      btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy');
    }
  });

  /* ---------- Product form submit ---------- */
  qsa('form[data-product-form]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) { form.reportValidity(); return; }
      const submit = qs('[type="submit"]', form);
      const idInput = qs('[name="id"]', form);
      const qtyInput = qs('[name="quantity"]', form);
      const errorEl = qs('[data-form-error]', form);
      if (!idInput || !idInput.value) { if (errorEl) { errorEl.hidden = false; errorEl.textContent = form.dataset.chooseSize || 'Choose a size'; errorEl.focus?.(); } return; }
      if (errorEl) errorEl.hidden = true;
      submit?.classList.add('btn--loading'); submit?.setAttribute('aria-busy', 'true');
      try {
        // line-item properties (e.g. gift card recipient); disabled fields are skipped by FormData
        const properties = {};
        new FormData(form).forEach((value, key) => {
          const m = key.match(/^properties\[(.+)\]$/);
          if (m && value !== '') properties[m[1]] = value;
        });
        await Cart.add(idInput.value, parseInt((qtyInput && qtyInput.value) || '1', 10), Object.keys(properties).length ? properties : undefined);
        if (useDrawer()) Drawers.open('CartDrawer', submit); else window.location.href = window.theme.routes.cart;
      } catch (err) {
        if (errorEl) { errorEl.hidden = false; errorEl.textContent = err.message; } else toast(err.message);
      } finally {
        submit?.classList.remove('btn--loading'); submit?.removeAttribute('aria-busy');
      }
    });
  });

  /* ---------- Cart drawer line changes (delegated; survives re-render) ---------- */
  document.addEventListener('click', async (e) => {
    const rm = e.target.closest('[data-cart-remove]');
    if (!rm) return;
    e.preventDefault();
    const drawer = rm.closest('.drawer'); drawer?.classList.add('is-busy');
    try { await Cart.change(parseInt(rm.getAttribute('data-cart-remove'), 10), 0); } catch (err) { toast(err.message); } finally { drawer?.classList.remove('is-busy'); }
  });
  document.addEventListener('change', async (e) => {
    const input = e.target.closest('[data-cart-line-qty]');
    if (!input) return;
    const drawer = input.closest('.drawer'); drawer?.classList.add('is-busy');
    try { await Cart.change(parseInt(input.getAttribute('data-cart-line-qty'), 10), parseInt(input.value, 10)); } catch (err) { toast(err.message); } finally { drawer?.classList.remove('is-busy'); }
  });

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
    if (!input || !results) return;
    let t, ctrl;
    input.addEventListener('input', () => {
      clearTimeout(t);
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = ''; results.hidden = true; return; }
      t = setTimeout(async () => {
        ctrl?.abort(); ctrl = new AbortController();
        try {
          const url = `${window.theme.routes.predictiveSearch}?q=${encodeURIComponent(q)}&resources[type]=product,article,page&resources[limit]=6&section_id=predictive-search`;
          const res = await fetch(url, { signal: ctrl.signal });
          const html = await res.text();
          const tmp = document.createElement('div'); tmp.innerHTML = html;
          const inner = qs('#shopify-section-predictive-search', tmp);
          results.innerHTML = inner ? inner.innerHTML : html;
          results.hidden = false;
          if (status) status.textContent = results.querySelectorAll('a').length + ' results';
        } catch (_) {}
      }, 250);
    });
  });

  document.dispatchEvent(new CustomEvent('theme:ready'));
})();

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

/* ---------- Gift card: "Send as a gift" recipient form ---------- */
(() => {
  'use strict';
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  qsa('[data-gift-recipient]').forEach(wrap => {
    const toggle = qs('[data-gift-toggle]', wrap);
    const fields = qs('[data-gift-fields]', wrap);
    const email = qs('[data-gift-email]', wrap);
    const emailError = qs('[data-gift-email-error]', wrap);
    const message = qs('[data-gift-message]', wrap);
    const count = qs('[data-gift-count]', wrap);
    const date = qs('[data-gift-date]', wrap);
    const offset = qs('[data-gift-offset]', wrap);
    if (!toggle || !fields) return;

    /* Shopify uses the buyer's UTC offset (minutes) to send on the chosen local date */
    if (offset) offset.value = String(new Date().getTimezoneOffset());

    /* Delivery date: today … +90 days (Shopify's limit) */
    if (date) {
      const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const today = new Date();
      const max = new Date(); max.setDate(max.getDate() + 90);
      date.min = iso(today); date.max = iso(max);
    }

    const sync = () => {
      const on = toggle.checked;
      fields.hidden = !on;
      fields.disabled = !on;
      toggle.setAttribute('aria-expanded', String(on));
      if (on) setTimeout(() => email?.focus(), 30);
      else if (emailError) { emailError.hidden = true; email?.removeAttribute('aria-invalid'); }
    };
    toggle.addEventListener('change', sync);
    sync();

    /* Validate the email on blur and while correcting it */
    const validate = () => {
      if (!email || fields.disabled) return true;
      const ok = email.value.trim() !== '' && email.checkValidity();
      if (emailError) emailError.hidden = ok;
      if (ok) email.removeAttribute('aria-invalid'); else email.setAttribute('aria-invalid', 'true');
      return ok;
    };
    email?.addEventListener('blur', () => { if (email.value) validate(); });
    email?.addEventListener('input', () => { if (email.getAttribute('aria-invalid')) validate(); });
    email?.addEventListener('invalid', (e) => { e.preventDefault(); validate(); email.focus(); });

    /* Message counter */
    const updateCount = () => { if (count && message) count.textContent = String(message.value.length); };
    message?.addEventListener('input', updateCount);
    updateCount();

    /* Reset after a successful add so the next card starts clean */
    document.addEventListener('cart:added', () => {
      if (!toggle.checked) return;
      qsa('input:not([type=hidden]), textarea', fields).forEach(i => { i.value = ''; });
      toggle.checked = false; sync(); updateCount();
    });
  });
})();
