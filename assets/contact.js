
/* ---------- Contact: live clock, greeting, topic doors, Dready's reactions, copy, tilt ---------- */
(() => {
  'use strict';
  const root = document.querySelector('[data-contact]');
  if (!root) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. "Good afternoon from Exeter · 2:32pm" — always UK time */
  const clock = root.querySelector('[data-ct-clock]');
  if (clock && window.Intl) {
    const place = clock.dataset.place || 'the UK';
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', minute: '2-digit', hour12: true });
    const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hourCycle: 'h23' });
    const draw = () => {
      const now = new Date();
      const h = parseInt(hourFmt.format(now), 10);
      const part = h < 5 ? 'Late one' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Late one';
      clock.textContent = `${part} from ${place} · ${fmt.format(now).replace(/\s/g, '').toLowerCase()}`;
    };
    draw();
    setInterval(draw, 30000);
  }

  /* 2. Rotating greeting */
  const greet = root.querySelector('[data-ct-greet]');
  if (greet && !reduce) {
    const words = (greet.dataset.words || '').split('|').map(w => w.trim()).filter(Boolean);
    const word = greet.querySelector('.ct-hero__word');
    let i = 0;
    if (words.length > 1 && word) setInterval(() => {
      if (document.hidden) return;
      word.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        word.textContent = words[i];
        word.classList.remove('is-out');
        word.classList.add('is-in');
        requestAnimationFrame(() => requestAnimationFrame(() => word.classList.remove('is-in')));
      }, 380);
    }, 2800);
  }

  /* 3. Dready's speech bubble */
  const bubble = root.querySelector('[data-ct-bubble]');
  let last = '';
  const say = (text) => {
    if (!bubble || !text || text === last) return;
    last = text;
    bubble.textContent = text;
    bubble.classList.remove('is-pop');
    void bubble.offsetWidth;
    bubble.classList.add('is-pop');
  };

  /* 4. Topic doors → reaction, direct email, order number, placeholder */
  const body = root.querySelector('[data-ct-body]');
  const order = root.querySelector('[data-ct-order]');
  const route = root.querySelector('[data-ct-route]');
  const routeLink = root.querySelector('[data-ct-route-link]');
  root.querySelectorAll('.ct-door__input').forEach(input => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      say(input.dataset.bubble);
      if (order) order.hidden = !input.hasAttribute('data-order');
      if (body) body.placeholder = input.dataset.placeholder || body.dataset.placeholder || '';
      if (route && routeLink) {
        const email = input.dataset.email;
        route.hidden = !email;
        if (email) { routeLink.textContent = email; routeLink.href = 'mailto:' + email; }
      }
    });
  });

  /* 5. Reactions while writing */
  const name = root.querySelector('[data-ct-name]');
  const email = root.querySelector('[data-ct-email]');
  let nameTimer;
  name?.addEventListener('input', () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      const first = name.value.trim().split(/\s+/)[0];
      if (first && first.length > 1) say(`Nice to meet you, ${first.charAt(0).toUpperCase() + first.slice(1)}.`);
    }, 500);
  });
  email?.addEventListener('blur', () => {
    if (!email.value.trim()) return;
    say(email.checkValidity() ? 'Perfect — that’s where we’ll reply.' : 'Double-check that email so we can write back.');
  });
  const count = root.querySelector('[data-ct-count]');
  let stage = -1;
  const stages = [[1, 'Go on…'], [60, 'Nice one, keep going.'], [220, 'Now that’s a proper message.'], [800, 'Pull up a chair — we’re reading every word.']];
  const onBody = () => {
    const n = body.value.length;
    if (count) count.textContent = n;
    let s = -1;
    stages.forEach(([min], idx) => { if (n >= min) s = idx; });
    if (s > stage) say(stages[s][1]);
    stage = s;
  };
  if (body) { body.addEventListener('input', onBody); if (count) count.textContent = body.value.length; }

  /* 6. Send: loading state while Shopify posts the form */
  const form = root.querySelector('#contact_form');
  const submit = root.querySelector('[data-ct-submit]');
  form?.addEventListener('submit', () => {
    if (form.checkValidity && !form.checkValidity()) return;
    say('Sending it with good vibes…');
    if (submit) { submit.classList.add('btn--loading'); submit.setAttribute('aria-busy', 'true'); }
  });

  /* 7. After sending: bring the stamped card into view */
  const done = root.querySelector('[data-ct-done]');
  if (done) {
    done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    done.focus({ preventScroll: true });
  }
  const errors = root.querySelector('#ContactErrors');
  if (errors) { errors.scrollIntoView({ block: 'center' }); errors.focus({ preventScroll: true }); }

  /* 8. Copy email addresses */
  root.querySelectorAll('[data-ct-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.ctCopy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        ta.remove();
      }
      if (!ok) { window.location.href = 'mailto:' + text; return; }
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 1600);
    });
  });

  /* 9. Postcard tilts toward the pointer */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.querySelectorAll('[data-ct-tilt]').forEach(el => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--rx', (((e.clientY - r.top) / r.height) - 0.5) * -7 + 'deg');
        el.style.setProperty('--ry', (((e.clientX - r.left) / r.width) - 0.5) * 9 + 'deg');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }
})();
