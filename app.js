/* ==========================================================================
   app.js — التهيئة العامة لكل صفحات الموقع
   يقوم بتحميل بيانات المنتجات والإعدادات، وتفعيل عناصر الهيدر/الفوتر المشتركة
   ========================================================================== */

window.VME = window.VME || { settings: null, categories: null, animals: null, products: [] };

/**
 * تحميل بيانات المنتجات من products.json
 * ملاحظة: عند فتح الملفات مباشرة (file://) قد يمنع المتصفح طلب fetch،
 * لذلك يُفضّل تشغيل الموقع عبر سيرفر محلي بسيط أو استضافة فعلية (راجع README.md).
 */
function vmeShowDataErrorBanner(reason) {
  if (document.getElementById('vme-data-error-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'vme-data-error-banner';
  banner.setAttribute('dir', 'rtl');
  banner.style.cssText = 'position:fixed;top:0;right:0;left:0;z-index:9999;background:#C1553B;color:#fff;padding:12px 16px;font-family:Tajawal,Arial,sans-serif;font-size:14px;text-align:center;';
  banner.textContent = 'تعذّر تحميل بيانات المنتجات (products.json). تأكد أن هذا الملف مرفوع فعليًا على نفس مجلد الموقع على الاستضافة. تفاصيل: ' + reason;
  document.body.prepend(banner);
}

async function vmeLoadData() {
  if (window.VME.products.length) return window.VME;
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    window.VME.settings = json.settings;
    window.VME.categories = json.categories;
    window.VME.animals = json.animals;
    window.VME.products = json.products;
  } catch (err) {
    console.error('تعذر تحميل بيانات المنتجات:', err);
    vmeShowDataErrorBanner(err.message || String(err));
  }
  return window.VME;
}

function vmeFindProduct(id) {
  return window.VME.products.find(p => p.id === id);
}

/* ---------- عناصر مشتركة: قائمة الجوال، عداد السلة، زر واتساب ---------- */

function vmeInitMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.drawer-close');
  if (!toggle || !drawer) return;
  toggle.addEventListener('click', () => drawer.classList.add('open'));
  closeBtn && closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.classList.remove('open'); });
}

function vmeInitSearchToggle() {
  const icon = document.querySelector('[data-search-toggle]');
  const bar = document.querySelector('.search-bar');
  if (!icon || !bar) return;
  icon.addEventListener('click', () => {
    bar.classList.toggle('force-show');
    bar.style.display = bar.classList.contains('force-show') ? 'flex' : '';
    if (bar.classList.contains('force-show')) bar.querySelector('input').focus();
  });
}

function vmeUpdateCartCount() {
  const badgeEls = document.querySelectorAll('[data-cart-count]');
  const count = vmeCartCount();
  badgeEls.forEach(el => { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; });
}

async function vmeInitCommon() {
  await vmeLoadData();

  // زر واتساب العائم + زر واتساب في الهيدر
  const waNumber = (window.VME.settings && window.VME.settings.whatsappNumber) || '';
  const generalMsg = encodeURIComponent('السلام عليكم، أريد الاستفسار عن منتجات Dr_Zoz Vet Store.');
  document.querySelectorAll('[data-wa-general]').forEach(el => {
    el.href = `https://wa.me/${waNumber}?text=${generalMsg}`;
  });

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  vmeInitMobileNav();
  vmeInitSearchToggle();
  vmeUpdateCartCount();
  if (typeof vmeInitSearch === 'function') vmeInitSearch();

  // تمييز رابط الصفحة الحالية في القائمة
  const page = document.body.dataset.page;
  document.querySelectorAll(`.main-nav a[data-page], .mobile-drawer a[data-page]`).forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });

  // استدعاء دالة التهيئة الخاصة بالصفحة إن وجدت
  if (page && typeof window['vmeInitPage_' + page] === 'function') {
    window['vmeInitPage_' + page]();
  }
}

document.addEventListener('DOMContentLoaded', vmeInitCommon);
