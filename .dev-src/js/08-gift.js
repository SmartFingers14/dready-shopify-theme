
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
