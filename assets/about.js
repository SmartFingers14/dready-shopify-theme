
/* ---------- About page: manifesto, tilt, parallax, timeline, chapter rail ---------- */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onFrame = (fn) => { let t = 0; return () => { if (!t) t = requestAnimationFrame(() => { t = 0; fn(); }); }; };
  const scrollFns = [];
  const runAll = () => scrollFns.forEach(fn => fn());
  const tick = onFrame(runAll);

  /* 1. Manifesto — words light up as you scroll through the statement */
  document.querySelectorAll('[data-manifesto-text]').forEach(el => {
    const words = [];
    const split = (text, key) => text.split(/(\s+)/).map(part => {
      if (!part.trim()) return document.createTextNode(part);
      const w = document.createElement('span');
      w.className = 'mw' + (key ? ' mw--key' : '');
      w.textContent = part;
      words.push(w);
      return w;
    });
    let k = 0;
    Array.from(el.childNodes).forEach(n => {
      if (n.nodeType === 3) n.replaceWith(...split(n.textContent, false));
      else if (n.nodeType === 1 && /^(STRONG|B|EM)$/.test(n.tagName)) {
        const frag = split(n.textContent, true);
        frag.forEach(w => { if (w.nodeType === 1) w.dataset.key = String(k % 4); });
        k++;
        n.replaceWith(...frag);
      }
    });
    el.classList.add('is-split');
    if (reduce) { words.forEach(w => w.classList.add('is-lit')); return; }
    let lit = -1;
    scrollFns.push(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      const n = Math.round(p * words.length);
      if (n === lit) return;
      lit = n;
      words.forEach((w, i) => w.classList.toggle('is-lit', i < n));
    });
  });

  /* 2. Hero artwork tilts toward the pointer */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-about-tilt]').forEach(el => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--rx', (((e.clientY - r.top) / r.height) - 0.5) * -8 + 'deg');
        el.style.setProperty('--ry', (((e.clientX - r.left) / r.width) - 0.5) * 10 + 'deg');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* 3. Gentle parallax on overlapping images */
  if (!reduce) {
    const items = Array.from(document.querySelectorAll('[data-parallax]'));
    if (items.length) scrollFns.push(() => {
      const vh = window.innerHeight;
      items.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -speed).toFixed(1) + 'px');
      });
    });
  }

  /* 4. Timeline — progress line, active moments, drag to scroll */
  document.querySelectorAll('[data-about-timeline]').forEach(sec => {
    const track = sec.querySelector('[data-timeline-track]');
    const bar = sec.querySelector('[data-timeline-progress]');
    if (!track) return;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.transform = `scaleX(${Math.max(0.04, p)})`;
    };
    track.addEventListener('scroll', onFrame(update), { passive: true });
    window.addEventListener('resize', onFrame(update));
    update();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(en => en.target.classList.toggle('is-active', en.isIntersecting)), { root: track, threshold: 0.6 });
      track.querySelectorAll('[data-timeline-item]').forEach(li => io.observe(li));
    } else track.querySelectorAll('[data-timeline-item]').forEach(li => li.classList.add('is-active'));
    if (finePointer) {
      let down = false, startX = 0, startLeft = 0, moved = false;
      track.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
        track.classList.add('is-grabbing');
      });
      window.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startLeft - dx;
      });
      window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-grabbing'); });
      track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      track.addEventListener('dragstart', (e) => e.preventDefault());
    }
  });

  /* 5. Floating chapter rail (desktop) */
  const chapters = Array.from(document.querySelectorAll('[data-chapter-nav]'));
  if (chapters.length >= 3) {
    const nav = document.createElement('nav');
    nav.className = 'chapter-rail';
    nav.setAttribute('aria-label', 'Chapters');
    const list = document.createElement('ol');
    list.setAttribute('role', 'list');
    const links = chapters.map(ch => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + ch.id;
      a.className = 'chapter-rail__link';
      a.innerHTML = '<span class="chapter-rail__num"></span><span class="chapter-rail__label"></span>';
      a.querySelector('.chapter-rail__num').textContent = ch.dataset.chapterNum || '';
      a.querySelector('.chapter-rail__label').textContent = ch.dataset.chapterNav;
      li.appendChild(a); list.appendChild(li);
      return a;
    });
    nav.appendChild(list);
    document.body.appendChild(nav);
    const first = chapters[0], last = chapters[chapters.length - 1];
    scrollFns.push(() => {
      const vh = window.innerHeight;
      const shown = first.getBoundingClientRect().top < vh * 0.5 && last.getBoundingClientRect().bottom > vh * 0.5;
      nav.classList.toggle('is-shown', shown);
      let idx = 0;
      chapters.forEach((ch, i) => { if (ch.getBoundingClientRect().top < vh * 0.5) idx = i; });
      links.forEach((a, i) => { if (i === idx) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    });
  }

  if (scrollFns.length) {
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    runAll();
  }
})();
