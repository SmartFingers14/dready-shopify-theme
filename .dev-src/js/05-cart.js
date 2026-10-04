
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
      const submit = qs('[type="submit"]', form);
      const idInput = qs('[name="id"]', form);
      const qtyInput = qs('[name="quantity"]', form);
      const errorEl = qs('[data-form-error]', form);
      if (!idInput || !idInput.value) { if (errorEl) { errorEl.hidden = false; errorEl.textContent = form.dataset.chooseSize || 'Choose a size'; errorEl.focus?.(); } return; }
      if (errorEl) errorEl.hidden = true;
      submit?.classList.add('btn--loading'); submit?.setAttribute('aria-busy', 'true');
      try {
        await Cart.add(idInput.value, parseInt((qtyInput && qtyInput.value) || '1', 10));
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
