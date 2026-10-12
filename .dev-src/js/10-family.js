
/* ---------- Join the family: photo wall + sign-up ---------- */
(() => {
  'use strict';
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  qsa('[data-family]').forEach(section => {
    /* Photo wall: pause button, pause off-screen (saves battery/CPU) */
    const wall = qs('[data-family-wall]', section);
    const pauseBtn = qs('[data-family-pause]', section);
    if (wall && pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        const paused = wall.classList.toggle('is-paused');
        pauseBtn.setAttribute('aria-pressed', String(paused));
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => wall.classList.toggle('is-offscreen', !e.isIntersecting)).observe(wall);
      }
    }

    /* Sign-up */
    const form = qs('[data-family-form]', section);
    if (!form) return;
    const body = qs('[data-family-body]', form);
    const success = qs('[data-family-success]', form);
    const email = qs('input[type="email"]', form);
    const errorEl = qs('[data-family-error]', form);
    const errorText = qs('[data-family-error-text]', form);
    const submit = qs('[data-family-submit]', form);
    const tagsInput = qs('[data-family-tags]', form);
    const defaultError = errorText ? errorText.textContent : '';
    if (!body || !email) return;

    const showError = (msg) => {
      if (errorText) errorText.textContent = msg || defaultError;
      if (errorEl) errorEl.hidden = false;
      email.setAttribute('aria-invalid', 'true');
    };
    const clearError = () => { if (errorEl) errorEl.hidden = true; email.removeAttribute('aria-invalid'); };
    const validate = () => { const ok = email.value.trim() !== '' && email.checkValidity(); if (ok) clearError(); return ok; };

    email.addEventListener('blur', () => { if (email.value && !validate()) showError(); });
    email.addEventListener('input', () => { if (email.getAttribute('aria-invalid')) validate(); });
    email.addEventListener('invalid', (e) => { e.preventDefault(); showError(); });

    /* Interests become customer tags (interest-music, …) */
    const syncTags = () => {
      if (!tagsInput) return;
      const picked = qsa('[data-family-interest]:checked', form).map(i => i.value);
      tagsInput.value = [tagsInput.dataset.base].concat(picked).filter(Boolean).join(',');
    };
    qsa('[data-family-interest]', form).forEach(i => i.addEventListener('change', syncTags));

    const showSuccess = () => {
      body.hidden = true;
      success.hidden = false;
      requestAnimationFrame(() => success.classList.add('is-shown'));
      success.focus();
    };

    let native = false;
    form.addEventListener('submit', async (e) => {
      if (native) return;               // fallback path: let the browser post normally
      e.preventDefault();
      syncTags();
      if (!validate()) { showError(); email.focus(); return; }
      submit.disabled = true; submit.classList.add('btn--loading'); submit.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin' });
        if (/\/challenge/.test(res.url)) { native = true; form.submit(); return; }   // Shopify spam check → normal post
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const scope = doc.getElementById(form.id);
        if (/customer_posted=true/.test(res.url) || (scope && scope.querySelector('[data-family-success].is-shown'))) {
          showSuccess();
        } else {
          const msg = scope && scope.querySelector('[data-family-error-text]');
          showError(msg && msg.textContent.trim());
          email.focus();
        }
      } catch (err) {
        native = true; form.submit();     // network hiccup → normal post
      } finally {
        submit.disabled = false; submit.classList.remove('btn--loading'); submit.removeAttribute('aria-busy');
      }
    });
  });
})();
