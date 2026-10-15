
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

  /* ---------- Footer: columns open on desktop, accordion on phones; back to top; sign-up busy state ---------- */
  qsa('[data-footer]').forEach(footer => {
    const cols = qsa('details.footer__col', footer);
    const phone = window.matchMedia('(max-width: 767px)');
    const syncCols = () => cols.forEach(d => { d.open = !phone.matches; });
    syncCols();
    phone.addEventListener('change', syncCols);
    qs('[data-back-to-top]', footer)?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
      qs('a[href], button', document.body)?.focus({ preventScroll: true });
    });
    const form = qs('[data-footer-form]', footer);
    form?.addEventListener('submit', () => { form.classList.add('is-busy'); qs('button[type="submit"]', form)?.setAttribute('aria-busy', 'true'); });
  });
