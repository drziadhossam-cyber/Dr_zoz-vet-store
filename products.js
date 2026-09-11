/* ==========================================================================
   products.js — عرض المنتجات: الشبكة، صفحة الفئة مع الفلاتر، صفحة التفاصيل
   ملاحظة: لا يعرض الموقع أي أسعار في أي مكان.
   ========================================================================== */

function vmeProductCardHtml(product) {
  return `
  <div class="product-card" data-id="${product.id}">
    <a href="product.html?id=${product.id}" class="thumb">
      ${product.featured ? '<span class="badge">منتج مميز</span>' : ''}
      <img src="${product.image}" alt="${product.name}" loading="lazy">
    </a>
    <div class="body">
      <span class="cat">${product.subcategory || ''}</span>
      <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
      <span class="text-muted" style="font-size:.82rem">${product.company ? 'الشركة: ' + product.company : 'الشركة المصنعة: غير متوفر حاليًا'}</span>
      <div class="actions">
        <a href="product.html?id=${product.id}" class="btn btn-outline">التفاصيل</a>
        <button class="btn btn-primary" data-quick-wa="${product.id}">اطلب عبر WhatsApp</button>
      </div>
    </div>
  </div>`;
}

function vmeRenderGrid(container, products) {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = `<div class="results-empty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب تعديل الفلاتر أو كلمة البحث.</p></div>`;
    return;
  }
  container.innerHTML = products.map(vmeProductCardHtml).join('');
  container.querySelectorAll('[data-quick-wa]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = vmeFindProduct(btn.dataset.quickWa);
      if (product) window.open(vmeBuildProductWaLink(product), '_blank');
    });
  });
}

/* ---------- الصفحة الرئيسية ---------- */
function vmeInitPage_home() {
  const featured = window.VME.products.filter(p => p.featured);
  vmeRenderGrid(document.getElementById('featured-grid'), featured.length ? featured.slice(0, 8) : window.VME.products.slice(0, 8));
  const meds = window.VME.products.filter(p => p.category === 'medicines').slice(0, 8);
  const tools = window.VME.products.filter(p => p.category === 'tools').slice(0, 8);
  vmeRenderGrid(document.getElementById('medicines-preview'), meds);
  vmeRenderGrid(document.getElementById('tools-preview'), tools);
  const statEl = document.getElementById('stat-products');
  if (statEl) statEl.textContent = window.VME.products.length + '+';
}

/* ---------- صفحات الفئات (الأدوية / الأدوات) مع الفلاتر ---------- */
function vmeUniqueValues(products, field, isArray) {
  const set = new Set();
  products.forEach(p => {
    if (isArray && Array.isArray(p[field])) p[field].forEach(v => set.add(v));
    else if (p[field]) set.add(p[field]);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
}

function vmeSetupCategoryPage(categoryId) {
  const all = window.VME.products.filter(p => p.category === categoryId);
  const grid = document.getElementById('category-grid');
  const subSelect = document.getElementById('filter-subcategory');
  const animalSelect = document.getElementById('filter-animal');
  const companySelect = document.getElementById('filter-company');
  const sortSelect = document.getElementById('filter-sort');
  const countLabel = document.getElementById('results-count');

  function fillSelect(select, values, placeholder) {
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join('');
  }
  fillSelect(subSelect, vmeUniqueValues(all, 'subcategory'), 'كل التصنيفات');
  fillSelect(animalSelect, vmeUniqueValues(all, 'animal', true), 'كل أنواع الحيوانات');
  fillSelect(companySelect, vmeUniqueValues(all, 'company').filter(v => v && v !== 'غير متوفر حاليًا'), 'كل الشركات');

  function applyAndRender() {
    let list = all.slice();
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim().toLowerCase();
    const animalParam = params.get('animal');
    const subParam = params.get('sub');

    if (q) {
      list = list.filter(p => vmeSearchMatch(p, q));
    }
    if (subSelect && subSelect.value) list = list.filter(p => p.subcategory === subSelect.value);
    else if (subParam) list = list.filter(p => p.subcategory === subParam);

    if (animalSelect && animalSelect.value) list = list.filter(p => (p.animal || []).includes(animalSelect.value));
    else if (animalParam) list = list.filter(p => (p.animal || []).includes(animalParam));

    if (companySelect && companySelect.value) list = list.filter(p => p.company === companySelect.value);

    if (sortSelect && sortSelect.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    if (sortSelect && sortSelect.value === 'company') list.sort((a, b) => (a.company || '').localeCompare(b.company || '', 'ar'));

    vmeRenderGrid(grid, list);
    if (countLabel) countLabel.textContent = `${list.length} منتج`;
  }

  [subSelect, animalSelect, companySelect, sortSelect].forEach(el => {
    el && el.addEventListener('change', applyAndRender);
  });

  const searchInInput = document.getElementById('in-page-search');
  if (searchInInput) {
    searchInInput.addEventListener('input', () => {
      const params = new URLSearchParams(window.location.search);
      if (searchInInput.value) params.set('q', searchInInput.value); else params.delete('q');
      history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
      applyAndRender();
    });
    const initQ = new URLSearchParams(window.location.search);
    if (initQ.get('q')) searchInInput.value = initQ.get('q');
  }

  // دعم فتح الصفحة مباشرة برابط يحدد تصنيفًا أو حيوانًا (من الصفحة الرئيسية)
  const initParams = new URLSearchParams(window.location.search);
  if (initParams.get('sub') && subSelect) subSelect.value = initParams.get('sub');
  if (initParams.get('animal') && animalSelect) animalSelect.value = initParams.get('animal');

  applyAndRender();
}

function vmeInitPage_medicines() { vmeSetupCategoryPage('medicines'); }
function vmeInitPage_tools() { vmeSetupCategoryPage('tools'); }

/* ---------- صفحة تفاصيل المنتج ---------- */
function vmeInitPage_product() {
  const params = new URLSearchParams(window.location.search);
  const product = vmeFindProduct(params.get('id'));
  const wrap = document.getElementById('product-detail-wrap');
  if (!wrap) return;

  if (!product) {
    wrap.innerHTML = `<div class="results-empty"><h3>المنتج غير موجود</h3><p>ربما تم حذفه أو تغيير رابطه.</p><a class="btn btn-primary" href="index.html">العودة للرئيسية</a></div>`;
    return;
  }

  document.title = `${product.name} | Dr_Zoz Vet Store`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${product.name} - ${product.subcategory || ''} - Dr_Zoz Vet Store`);

  const specRows = [
    ['الشركة المصنعة', product.company],
    ['الفئة', product.subcategory],
    ['الحيوان المستهدف', (product.animal || []).join('، ') || 'غير متوفر حاليًا'],
    ['الاستخدام العام', product.usage],
  ];

  wrap.innerHTML = `
    <div class="product-detail">
      <div class="thumb-lg"><img src="${product.image}" alt="${product.name}"></div>
      <div>
        <span class="cat">${product.subcategory || ''}</span>
        <h1>${product.name}</h1>
        <p>${product.description || ''}</p>
        <table class="spec-table">
          ${specRows.map(([k, v]) => `<tr><td>${k}</td><td>${v || 'غير متوفر حاليًا'}</td></tr>`).join('')}
        </table>
        <div class="detail-actions">
          <a class="btn btn-accent" id="detail-wa-order" href="#">اطلب عبر WhatsApp</a>
          <button class="btn btn-outline" id="detail-add-cart">أضف إلى قائمة الاستفسار</button>
        </div>
        <div class="disclaimer-box">
          هذا العرض لأغراض التعريف بالمنتج فقط، ولا يمثل وصفة علاجية أو جرعة دوائية. يُرجى تأكيد التوفر عبر واتساب، والرجوع للطبيب البيطري المختص والجهة المرخصة قبل استخدام أي دواء.
        </div>
      </div>
    </div>`;

  document.getElementById('detail-add-cart').addEventListener('click', (e) => {
    vmeAddToCart(product.id, 1);
    e.target.textContent = 'أُضيف ✓';
    setTimeout(() => { e.target.textContent = 'أضف إلى قائمة الاستفسار'; }, 1400);
  });
  document.getElementById('detail-wa-order').addEventListener('click', (e) => {
    e.preventDefault();
    window.open(vmeBuildProductWaLink(product), '_blank');
  });
}
