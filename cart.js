/* ==========================================================================
   cart.js — قائمة استفسار المنتجات باستخدام LocalStorage (بدون Backend، بدون أسعار)
   ========================================================================== */

const VME_CART_KEY = 'vme_cart_v1';

function vmeGetCartRaw() {
  try {
    return JSON.parse(localStorage.getItem(VME_CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function vmeSaveCartRaw(cart) {
  localStorage.setItem(VME_CART_KEY, JSON.stringify(cart));
  vmeUpdateCartCount();
}

function vmeCartCount() {
  return vmeGetCartRaw().reduce((sum, item) => sum + item.qty, 0);
}

function vmeAddToCart(productId, qty) {
  qty = Math.max(1, parseInt(qty, 10) || 1);
  const cart = vmeGetCartRaw();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  vmeSaveCartRaw(cart);
}

function vmeSetQty(productId, qty) {
  qty = Math.max(1, parseInt(qty, 10) || 1);
  const cart = vmeGetCartRaw();
  const existing = cart.find(i => i.id === productId);
  if (existing) { existing.qty = qty; vmeSaveCartRaw(cart); }
}

function vmeRemoveFromCart(productId) {
  const cart = vmeGetCartRaw().filter(i => i.id !== productId);
  vmeSaveCartRaw(cart);
}

/* ---------- عرض صفحة قائمة الاستفسار (cart.html) ---------- */

function vmeRenderCartPage() {
  const cartRaw = vmeGetCartRaw();
  const items = cartRaw
    .map(i => ({ qty: i.qty, product: vmeFindProduct(i.id) }))
    .filter(i => i.product);

  const wrap = document.getElementById('cart-content');
  if (!wrap) return;

  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="empty-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
        <h3>لا توجد منتجات في قائمة الاستفسار</h3>
        <p>تصفح الأدوية أو الأدوات وأضف ما تحتاج الاستفسار عن توفره.</p>
        <a href="veterinary-medicines.html" class="btn btn-primary">تصفح الأدوية البيطرية</a>
      </div>`;
    return;
  }

  const rows = items.map(({ product, qty }) => `
    <tr>
      <td>
        <div class="cart-row-thumb">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <strong>${product.name}</strong><br>
            <span class="text-muted" style="font-size:.8rem">${product.subcategory || ''}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="qty-selector">
          <button type="button" data-qty-btn="-" data-id="${product.id}">−</button>
          <input type="text" value="${qty}" data-qty-input data-id="${product.id}" inputmode="numeric">
          <button type="button" data-qty-btn="+" data-id="${product.id}">+</button>
        </div>
      </td>
      <td><button class="cart-remove" data-remove="${product.id}">حذف</button></td>
    </tr>`).join('');

  wrap.innerHTML = `
    <div class="cart-layout">
      <div style="overflow-x:auto">
        <table class="cart-table">
          <thead><tr><th>المنتج</th><th>الكمية</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <aside class="cart-summary">
        <h3>ملخص قائمة الاستفسار</h3>
        <div class="row"><span>عدد المنتجات</span><span>${items.reduce((s, i) => s + i.qty, 0)}</span></div>
        <p class="text-muted" style="font-size:.82rem">لا يعرض الموقع أي أسعار. التوفر النهائي يتم تأكيده عبر واتساب.</p>
        <a href="#" id="cart-wa-btn" class="btn btn-accent btn-block">إرسال الاستفسار عبر WhatsApp</a>
      </aside>
    </div>`;

  wrap.querySelectorAll('[data-qty-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const input = wrap.querySelector(`[data-qty-input][data-id="${id}"]`);
      let val = parseInt(input.value, 10) || 1;
      val = btn.dataset.qtyBtn === '+' ? val + 1 : Math.max(1, val - 1);
      vmeSetQty(id, val);
      vmeRenderCartPage();
    });
  });
  wrap.querySelectorAll('[data-qty-input]').forEach(input => {
    input.addEventListener('change', () => { vmeSetQty(input.dataset.id, input.value); vmeRenderCartPage(); });
  });
  wrap.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => { vmeRemoveFromCart(btn.dataset.remove); vmeRenderCartPage(); });
  });

  const waBtn = document.getElementById('cart-wa-btn');
  if (waBtn) waBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(vmeBuildCartWaLink(items), '_blank');
  });
}

function vmeInitPage_cart() {
  vmeRenderCartPage();
}
