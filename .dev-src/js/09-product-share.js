
/* ---------- Product share: copy link + device share sheet ---------- */
(() => {
  'use strict';
  document.querySelectorAll('[data-share]').forEach(wrap => {
    const url = wrap.dataset.shareUrl;
    const title = wrap.dataset.shareTitle;
    const status = wrap.querySelector('[data-share-status]');
    const copyBtn = wrap.querySelector('[data-share-copy]');
    const nativeWrap = wrap.querySelector('[data-share-native-wrap]');

    const copied = () => {
      copyBtn.classList.add('is-copied');
      if (status) status.textContent = copyBtn.dataset.copiedStatus || 'Link copied';
      setTimeout(() => copyBtn.classList.remove('is-copied'), 2000);
    };
    const legacyCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = url; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (ok) copied(); else window.prompt('', url);
    };
    copyBtn?.addEventListener('click', () => {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(copied, legacyCopy);
      else legacyCopy();
    });

    if (navigator.share && nativeWrap) {
      nativeWrap.hidden = false;
      nativeWrap.querySelector('[data-share-native]').addEventListener('click', () => {
        navigator.share({ title, url }).catch(() => {});
      });
    }
  });
})();
