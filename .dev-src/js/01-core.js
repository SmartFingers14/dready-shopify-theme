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
