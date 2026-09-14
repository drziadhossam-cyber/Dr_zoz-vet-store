/* ==========================================================================
   whatsapp.js — بناء روابط WhatsApp Click-to-Chat (بدون أي API مدفوع)
   ملاحظة: لا تحتوي أي رسالة واتساب على أي سعر إطلاقًا.
   ========================================================================== */

function vmeWaNumber() {
  return (window.VME.settings && window.VME.settings.whatsappNumber) || '';
}

/** رابط استفسار/طلب عن منتج واحد من صفحة المنتج أو بطاقة المنتج */
function vmeBuildProductWaLink(product) {
  const text = encodeURIComponent(`مرحبًا، أريد الاستفسار عن توفر منتج: ${product.name}`);
  return `https://wa.me/${vmeWaNumber()}?text=${text}`;
}

/** رابط إرسال قائمة استفسار تضم عدة منتجات من صفحة السلة/قائمة الاستفسار */
function vmeBuildCartWaLink(items) {
  const lines = ['مرحبًا، أريد الاستفسار عن توفر المنتجات التالية:', ''];
  items.forEach((item, idx) => {
    lines.push(`${idx + 1}- ${item.product.name}${item.qty > 1 ? ' (الكمية المطلوب الاستفسار عنها: ' + item.qty + ')' : ''}`);
  });
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${vmeWaNumber()}?text=${text}`;
}
