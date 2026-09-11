/* ==========================================================================
   search.js — بحث فوري في الهيدر عبر اسم المنتج / المادة الفعالة / الشركة / الحيوان / التصنيف
   ========================================================================== */

function vmeSearchMatch(product, q) {
  const haystack = [product.name, product.company, product.subcategory, product.category, product.description, ...(product.animal||[])]
    .filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
}

function vmeInitSearch() {
  const input = document.getElementById('header-search-input');
  const form = document.getElementById('header-search-form');
  const results = document.getElementById('header-search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.hidden = true; results.innerHTML = ''; return; }
    const matches = window.VME.products.filter(p => vmeSearchMatch(p, q)).slice(0, 6);
    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">لا توجد نتائج لـ "${input.value}"</div>`;
    } else {
      results.innerHTML = matches.map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item">
          <img src="${p.image}" alt="">
          <div>
            <strong>${p.name}</strong>
            <span>${p.subcategory || ''}${p.company ? ' • ' + p.company : ''}</span>
          </div>
        </a>`).join('');
    }
    results.hidden = false;
  });

  document.addEventListener('click', (e) => {
    if (!results.contains(e.target) && e.target !== input) results.hidden = true;
  });

  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = encodeURIComponent(input.value.trim());
    window.location.href = `veterinary-medicines.html?q=${q}`;
  });
}
