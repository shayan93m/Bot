// index.js

export const PROXY_URL = "https://bot-v2.youcoweb.workers.dev";
export let services = [];
export let currentSelectedServiceObj = null;

let currentCategory = 'همه';
let categoriesList = ['همه'];
let savedScrollY = 0;
let captchaResult = 0;

// نمایش مدال «سامانه در دسترس نیست» به‌جای alert پیش‌فرض مرورگر
function showInactiveNotice() {
  closeAllModals();
  const modal = document.getElementById('inactiveModal');
  if (modal) {
    modal.style.display = 'flex';
    lockBodyScroll();
  } else {
    alert('این خدمت اکنون غیرفعال است');
  }
}

// بررسی وضعیت فعال/غیرفعال بودن یک خدمت
// قانون: status = 1 یعنی غیرفعال. خالی/۰/نامشخص یعنی فعال.
function isServiceActive(item) {
  if (!item) return true;
  const status = item.status;
  if (status === undefined || status === null || status === '') return true; // پیش‌فرض: فعال
  const s = String(status).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'غیرفعال' || s === 'inactive' || s === 'off') return false;
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  // بارگذاری لیست خدمات از پوشه data
  fetch('data/services.json')
    .then(response => {
      if (!response.ok) throw new Error("فایل JSON در مسیر data/services.json یافت نشد.");
      return response.json();
    })
    .then(data => {
      services = data;
      renderCategories();
      renderServices();
    })
    .catch(error => {
      console.error('خطا در بارگذاری خدمات:', error);
    });

  // رویداد بستن تمام مدال‌ها با دکمه بستن (✕)
  document.querySelectorAll('.close-btn-trigger').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // بستن مدال‌ها با کلیک روی فضای بیرون کادر (Overlay Click)
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  });

  // جستجوی زنده
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('keyup', liveSearch);

  // ناوبری بین دسته‌بندی‌ها با کشیدن انگشت (سوایپ) روی صفحه
  setupCategorySwipe();

  // فرم ثبت سفارش
  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', submitOrder);

  // دکمه ثبت سفارش داخل مدال جزئیات خدمت
  const openOrderFromServiceBtn = document.getElementById('openOrderFromServiceBtn');
  if (openOrderFromServiceBtn) {
    openOrderFromServiceBtn.addEventListener('click', () => {
      if (!isServiceActive(currentSelectedServiceObj)) {
        showInactiveNotice();
        return;
      }
      openOrderModal();
    });
  }

  // لود پویای ماژول هوش مصنوعی از پوشه ia
  const aiBtn = document.getElementById('aiBtn');
  if (aiBtn) {
    aiBtn.addEventListener('click', async () => {
      try {
        const aiModule = await import('./ia/ai.js');
        aiModule.openAiChat();
      } catch (err) {
        console.error("خطا در بارگذاری ماژول هوش مصنوعی:", err);
      }
    });
  }
});

// قفل کردن اسکرول صفحه هنگام باز شدن مدال
export function lockBodyScroll() {
  savedScrollY = window.scrollY;
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.classList.add('modal-open');
}

// بستن تمام مدال‌ها و بازگرداندن وضعیت اسکرول
export function closeAllModals() {
  ['serviceModal', 'orderModal', 'aiModal', 'inactiveModal', 'orderSuccessModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  document.body.style.position = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY);
}

// رندر دسته‌بندی‌ها
function renderCategories() {
  const categories = ['همه', ...new Set(services.map(s => s.cat))];
  categoriesList = categories;
  const container = document.getElementById('categoriesBar');
  if (!container) return;
  container.innerHTML = categories.map(cat => `
    <button class="category-chip ${cat === currentCategory ? 'active' : ''}">${cat}</button>
  `).join('');

  container.querySelectorAll('.category-chip').forEach((btn, index) => {
    btn.addEventListener('click', () => filterCategory(categories[index]));
  });
}

function filterCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderServices();

  // اسکرول نوار دسته‌بندی برای نمایش دسته فعال
  const activeChip = document.querySelector('.category-chip.active');
  if (activeChip) activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

// ناوبری بین دسته‌بندی‌ها با کشیدن انگشت روی صفحه (سوایپ راست/چپ)
function setupCategorySwipe() {
  const target = document.getElementById('servicesGrid');
  if (!target) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;

  target.addEventListener('touchstart', (e) => {
    if (document.body.classList.contains('modal-open')) return;
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  target.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    if (document.body.classList.contains('modal-open')) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const SWIPE_THRESHOLD = 60;
    // فقط وقتی سوایپ افقی باشد نه اسکرول عمودی
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    const currentIndex = categoriesList.indexOf(currentCategory);
    if (currentIndex === -1) return;

    let nextIndex;
    if (deltaX < 0) {
      // کشیدن به چپ => دسته قبلی
      nextIndex = Math.max(currentIndex - 1, 0);
    } else {
      // کشیدن به راست => دسته بعدی
      nextIndex = Math.min(currentIndex + 1, categoriesList.length - 1);
    }

    if (nextIndex !== currentIndex) {
      filterCategory(categoriesList[nextIndex]);
    }
  }, { passive: true });
}

// رندر کارت‌های خدمات
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  const filtered = currentCategory === 'همه'
    ? services
    : services.filter(s => s.cat === currentCategory);

  grid.innerHTML = filtered.map(s => `
    <div class="service-card${isServiceActive(s) ? '' : ' service-inactive'}" data-id="${s.id}">
      <h3>${s.id}. ${s.title}</h3>
      <span class="category-tag">${s.cat || ''}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => openServiceModal(card.dataset.id));
  });
}

// باز کردن مدال جزئیات خدمت
export function openServiceModal(serviceId) {
  const item = services.find(s => s.id == serviceId);
  if (!item) return;
  currentSelectedServiceObj = item;
  document.getElementById('modalTitle').innerText = `${item.id}. ${item.title}`;
  document.getElementById('modalDesc').innerText = item.decs || item.desc || 'توضیحی برای این خدمت ثبت نشده است.';
  document.getElementById('modalDocs').innerText = item.docs || 'مدارک خاصی ذکر نشده است.';
  document.getElementById('modalCost').innerText = item.cost || 'طبق تعرفه';
  document.getElementById('modalTime').innerText = item.time || 'سریع';
  document.getElementById('modalSystemTime').innerText = item.systemTime || item.system_time || 'مشخص‌نشده';
  
  // تنظیم وضعیت خدمت
  const active = isServiceActive(item);
  const statusEl = document.getElementById('modalStatus');
  if (statusEl) {
    statusEl.innerText = active ? 'فعال' : 'غیرفعال';
    statusEl.style.color = active ? '#10b981' : '#ef4444';
  }

  // فعال/غیرفعال کردن ظاهری دکمه ثبت سفارش بر اساس وضعیت خدمت
  const orderBtn = document.getElementById('openOrderFromServiceBtn');
  if (orderBtn) {
    orderBtn.classList.toggle('disabled', !active);
  }

  document.getElementById('serviceModal').style.display = 'flex';
  lockBodyScroll();
}

// باز کردن مدال ثبت سفارش و ساخت فیلدهای پویا
export function openOrderModal(serviceIdentifier) {
  if (serviceIdentifier) {
    const found = services.find(s => `${s.id}. ${s.title}` === serviceIdentifier || s.id == serviceIdentifier || s.title == serviceIdentifier);
    if (found) currentSelectedServiceObj = found;
  }

  // محافظت نهایی: اگر خدمت غیرفعال باشد، مدال ثبت سفارش هرگز باز نشود
  if (!isServiceActive(currentSelectedServiceObj)) {
    showInactiveNotice();
    return;
  }

  closeAllModals();
  const titleText = currentSelectedServiceObj
    ? `${currentSelectedServiceObj.id}. ${currentSelectedServiceObj.title}`
    : 'خدمات عمومی';
  document.getElementById('orderServiceTitle').innerText = titleText;
  const container = document.getElementById('dynamicInputsContainer');
  container.innerHTML = '';

  const rawDocs = currentSelectedServiceObj?.docs || '';
  let docItems = rawDocs.split(/،|-|\n/).map(d => d.trim()).filter(d => d.length > 0);

  docItems = docItems.map(d => {
    const lower = d.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    if (
      (lower.includes('سیم کارت') || lower.includes('تلفن') || lower.includes('موبایل') || lower.includes('شماره')) &&
      (lower.includes('بنام متقاضی') || lower.includes('به نام متقاضی') || lower.includes('بنام شخص متقاضی') || lower.includes('به نام شخص متقاضی'))
    ) {
      return 'تلفن همراه بنام متقاضی';
    }
    return d;
  });

  const hasApplicantPhone = docItems.some(d => d === 'تلفن همراه بنام متقاضی');

  docItems = docItems.filter(d => {
    if (d === 'تلفن همراه بنام متقاضی') return true;
    if (d.includes('تماس') || d.includes('موبایل') || d.includes('تلفن') || d.includes('شماره تماس') || d.includes('شماره همراه')) {
      return false;
    }
    return true;
  });

  if (!hasApplicantPhone) {
    const phoneGroup = document.createElement('div');
    phoneGroup.className = 'form-group';
    phoneGroup.innerHTML = `
      <label>تلفن همراه:</label>
      <input type="tel" class="dynamic-doc-input" data-label="تلفن همراه" required placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹">
    `;
    container.appendChild(phoneGroup);
  }

  docItems.forEach((doc) => {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'form-group';

    const isFileField = doc.startsWith('**');
    const cleanLabel = isFileField ? doc.replace(/^\*\*\s*/, '').trim() : doc;

    const label = document.createElement('label');
    label.innerText = cleanLabel + ':';
    fieldGroup.appendChild(label);

    let input;
    if (isFileField) {
      input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.heic,.heif,.jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx,.zip,.rar';
      input.className = 'dynamic-doc-input dynamic-file-input';
      input.dataset.label = cleanLabel;
      input.required = true;
      input.style.cssText = 'padding:10px; border:1px dashed #94a3b8; border-radius:8px; background:#f8fafc; width:100%;';
      fieldGroup.appendChild(input);
      const hint = document.createElement('small');
      hint.style.cssText = 'display:block; margin-top:6px; color:#64748b; font-size:0.78rem;';
      hint.innerText = 'فرمت‌های مجاز: JPG, PNG, HEIC , PDF، Word، ZIP';
      fieldGroup.appendChild(hint);
    } else if (cleanLabel.includes('آدرس') || cleanLabel.includes('توضیحات')) {
      input = document.createElement('textarea');
      input.rows = 2;
      input.className = 'dynamic-doc-input';
      input.dataset.label = cleanLabel;
      input.required = true;
      input.placeholder = 'وارد کنید...';
      fieldGroup.appendChild(input);
    } else {
      input = document.createElement('input');
      if (cleanLabel.includes('تماس') || cleanLabel.includes('موبایل') || cleanLabel.includes('تلفن') || cleanLabel.includes('کد ملی') || cleanLabel.includes('پستی') || cleanLabel.includes('حساب') || cleanLabel.includes('شبا')) {
        input.type = 'tel';
      } else {
        input.type = 'text';
      }
      input.className = 'dynamic-doc-input';
      input.dataset.label = cleanLabel;
      input.required = true;
      input.placeholder = 'وارد کنید...';
      fieldGroup.appendChild(input);
    }
    container.appendChild(fieldGroup);
  });

  const fileGroup = document.createElement('div');
  fileGroup.className = 'form-group';
  fileGroup.innerHTML = `
    <label>پیوست فایل (اختیاری - می‌توانید چند فایل انتخاب کنید):</label>
    <input type="file" id="orderFiles" class="dynamic-doc-input" data-label="فایل‌های پیوست" multiple accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx,.zip,.rar" style="padding:10px; border:1px dashed #94a3b8; border-radius:8px; background:#f8fafc;">
    <small style="display:block; margin-top:6px; color:#64748b; font-size:0.78rem;">فرمت‌های مجاز: JPG, PNG, HEIC , PDF، Word، ZIP</small>
  `;
  container.appendChild(fileGroup);

  document.getElementById('orderModal').style.display = 'flex';
  lockBodyScroll();
  generateCaptcha();
}

// ساخت کد امنیتی
function generateCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  captchaResult = a + b;
  const el = document.getElementById('captchaQuestion');
  if (el) el.innerText = `${a} + ${b} = ؟`;
  const input = document.getElementById('captchaAnswer');
  if (input) input.value = '';
}

// سیستم جستجوی لحظه‌ای
function liveSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsContainer = document.getElementById('searchResults');
 
  if (query === '') {
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    return;
  }

  const filtered = services.filter(s => {
    const title = String(s.title || '').toLowerCase();
    const cat = String(s.cat || '').toLowerCase();
    const id = String(s.id || '').toLowerCase();
    const desc = String(s.decs || s.desc || '').toLowerCase();

    return title.includes(query) || cat.includes(query) || id.includes(query) || desc.includes(query);
  });

  if (filtered.length > 0) {
    resultsContainer.innerHTML = filtered.map(s => `
      <li data-id="${s.id}">
        <strong>${s.id}. ${s.title}</strong>
        <span style="font-size:0.78rem; color:#64748b; margin-right:6px;">(${s.cat || 'عمومی'})</span>
      </li>
    `).join('');
    resultsContainer.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', () => selectSearchResult(item.dataset.id));
    });
    resultsContainer.style.display = 'block';
  } else {
    resultsContainer.innerHTML = '<li style="color:#94a3b8; text-align:center; padding: 18px;">موردی یافت نشد</li>';
    resultsContainer.style.display = 'block';
  }
}

function selectSearchResult(serviceId) {
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('searchInput').value = '';
  openServiceModal(serviceId);
}

// ارسال سفارش به ورکر پروکسی
async function submitOrder(e) {
  e.preventDefault();

  const userCaptcha = parseInt(document.getElementById('captchaAnswer').value, 10);
  if (userCaptcha !== captchaResult) {
    alert('کد امنیتی اشتباه است. لطفاً دوباره محاسبه کنید.');
    generateCaptcha();
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.innerText = 'در حال ارسال...';
  submitBtn.disabled = true;

  const name = document.getElementById('custName').value;
  const notes = document.getElementById('custNotes').value || 'ندارد';
  const dynamicInputs = document.querySelectorAll('.dynamic-doc-input:not([type="file"])');
  let collectedDocsData = "";
  dynamicInputs.forEach(input => {
    const labelText = input.dataset.label;
    const val = input.value.trim() || 'وارد نشده';
    collectedDocsData += `\n📌 *${labelText}:* \`${val}\``;
  });

  const serviceTitle = currentSelectedServiceObj
    ? `${currentSelectedServiceObj.id}. ${currentSelectedServiceObj.title}`
    : 'مشخص‌نشده';

  const messageText = `📦 *سفارش جدید دریافت شد!*
────────────────
🛠 *خدمت:* ${serviceTitle}
👤 *نام مشتری:* ${name}${collectedDocsData}
📝 *توضیحات تکمیلی:* ${notes}
🌐 *منبع سفارش:* وب‌سایت
📅 *تاریخ ثبت:* ${new Date().toLocaleDateString('fa-IR')}
⏱ *زمان ثبت:* ${new Date().toLocaleTimeString('fa-IR')}`;

  try {
    // ۱. ارسال اطلاعات متنی به Worker
    const textRes = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'text', text: messageText })
    });

    if (!textRes.ok) throw new Error('خطا در ارسال اطلاعات سفارش');

    // ۲. ارسال فایل‌های پویای مدارک به Worker
    const dynamicFiles = document.querySelectorAll('.dynamic-file-input');
    for (const input of dynamicFiles) {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const label = input.dataset.label || 'فایل';
        const formData = new FormData();
        formData.append('type', 'file');
        formData.append('document', file, file.name);
        formData.append('caption', `📎 ${label} | ${serviceTitle} — ${name}`);
        
        await fetch(PROXY_URL, { method: 'POST', body: formData });
      }
    }

    // ۳. ارسال فایل‌های پیوست عمومی به Worker
    const fileInput = document.getElementById('orderFiles');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const formData = new FormData();
        formData.append('type', 'file');
        formData.append('document', file, file.name);
        formData.append('caption', `📎 پیوست سفارش: ${serviceTitle} — ${name} (${i + 1}/${fileInput.files.length})`);
        
        await fetch(PROXY_URL, { method: 'POST', body: formData });
      }
    }

    document.getElementById('custName').value = '';
    document.getElementById('custNotes').value = '';
    if (fileInput) fileInput.value = '';
    closeAllModals();

    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) {
      successModal.style.display = 'flex';
      lockBodyScroll();
    } else {
      alert('✅ سفارش شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.');
    }

  } catch (err) {
    console.error('Submit Error:', err);
    const msg = (err && err.message) ? err.message : String(err);
    alert('خطا در ارسال سفارش:\n' + msg);
  } finally {
    submitBtn.innerText = 'ارسال سفارش';
    submitBtn.disabled = false;
  }
}
