
/* ---------- Policy pages: headings, table of contents, read time, progress ---------- */
(() => {
  'use strict';
  const root = document.querySelector('[data-policy]');
  if (!root) return;
  const body = root.querySelector('[data-policy-body]');
  if (!body) return;
  const content = body.querySelector('.shopify-policy__body .rte') || body.querySelector('.shopify-policy__body') || body;

  /* 1. Shopify policies are often one long run of text + <br>s with bold titles.
        Rebuild them into real paragraphs, and lone bold lines into headings. */
  const BLOCK = /^(H[1-6]|UL|OL|TABLE|DIV|BLOCKQUOTE|HR|FIGURE)$/;
  const isBlank = (n) => n.nodeType === 3 ? !n.textContent.trim() : (n.nodeType === 1 && n.tagName !== 'BR' && !n.textContent.trim() && !n.querySelector('img'));
  const out = document.createDocumentFragment();
  let lines = [[]];
  const flush = () => {
    let para = null;
    const endPara = () => { if (para) out.appendChild(para); para = null; };
    lines.forEach(line => {
      const real = line.filter(n => !isBlank(n));
      if (!real.length) { endPara(); return; }
      const only = real.length === 1 && real[0].nodeType === 1 && /^(STRONG|B)$/.test(real[0].tagName) ? real[0] : null;
      const text = only ? only.textContent.trim().replace(/\s+/g, ' ') : '';
      if (only && text.length <= 90 && !/[.:,]$/.test(text)) {
        endPara();
        const h = document.createElement('h2');
        h.textContent = text.replace(/^SECTION\s+(\d+)\s*[-–—]\s*/i, '$1 · ');
        out.appendChild(h);
        return;
      }
      if (para) para.appendChild(document.createElement('br')); else para = document.createElement('p');
      line.forEach(n => para.appendChild(n));
    });
    endPara();
    lines = [[]];
  };
  const eat = (nodes) => nodes.forEach(n => {
    if (n.nodeType === 1 && n.tagName === 'BR') lines.push([]);
    else lines[lines.length - 1].push(n);
  });
  Array.from(content.childNodes).forEach(n => {
    if (n.nodeType === 1 && BLOCK.test(n.tagName)) { flush(); out.appendChild(n); }
    else if (n.nodeType === 1 && n.tagName === 'P') { flush(); eat(Array.from(n.childNodes)); flush(); }
    else if (n.nodeType === 1 || n.nodeType === 3) eat([n]);
  });
  flush();
  content.replaceChildren(out);

  /* 2. Table of contents from h2 */
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const heads = Array.from(content.querySelectorAll('h2'));
  const tocWrap = root.querySelector('[data-policy-toc-wrap]');
  const toc = root.querySelector('[data-policy-toc]');
  const used = {};
  heads.forEach(h => {
    let id = slug(h.textContent) || 'section';
    used[id] = (used[id] || 0) + 1;
    if (used[id] > 1) id += '-' + used[id];
    h.id = id;
  });
  if (toc && heads.length > 1) {
    heads.forEach(h => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const t = h.textContent.trim();
      a.href = '#' + h.id; a.className = 'policy-toc__link';
      a.textContent = /[a-z]/.test(t) ? t : t.charAt(0) + t.slice(1).toLowerCase();
      li.appendChild(a); toc.appendChild(li);
    });
    tocWrap.hidden = false;
    if (window.matchMedia('(max-width: 1023px)').matches) tocWrap.open = false;
  }

  /* 3. Read time + last updated (taken from the policy text itself) */
  const words = content.textContent.trim().split(/\s+/).length;
  const rt = document.querySelector('[data-policy-readtime]');
  if (rt && words > 120) { rt.querySelector('span').textContent = Math.max(1, Math.round(words / 220)) + ' min read'; rt.hidden = false; }
  const m = content.textContent.match(/Last updated:?\s*([A-Z][a-z]+ \d{1,2}, \d{4})/);
  const up = document.querySelector('[data-policy-updated]');
  if (m && up) { up.querySelector('span').textContent = 'Updated ' + m[1]; up.hidden = false; }

  /* 4. Reading progress + active section */
  const bar = document.querySelector('[data-policy-progress]');
  const onScroll = () => {
    const r = body.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.6;
    const pct = Math.min(1, Math.max(0, -r.top / (total || 1)));
    if (bar) bar.style.transform = `scaleX(${pct})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if ('IntersectionObserver' in window && toc && heads.length > 1) {
    const links = Array.from(toc.querySelectorAll('a'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.removeAttribute('aria-current'));
        const a = links.find(l => l.getAttribute('href') === '#' + en.target.id);
        if (a) a.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(h => io.observe(h));
  }
})();
