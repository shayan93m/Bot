// nav.js - منوی مشترک برای همه صفحات
// فقط این فایل را تغییر دهید تا منو در تمام صفحات به‌روز شود

(function() {
  const headerHTML = `
  <header>
    <div style="width: 30px;"></div>
    <div class="logo-container">
      <a href="index.html" class="logo" style="text-decoration:none; color:inherit;">سامانه هوشمند کافی نت من</a>
    </div>
    <button class="hamburger-btn" onclick="toggleMenu()">☰</button>
  </header>
  `;

  const navHTML = `
  <div class="overlay" id="overlay" onclick="toggleMenu()"></div>
  <nav class="nav-menu" id="navMenu">
    <button class="close-btn" onclick="toggleMenu()">✕</button>

    <ul class="nav-top">
      <li><a href="news.html">خبرها</a></li>
      <li><a href="about.html">درباره ما</a></li>
      <li><a href="licenses.html">مجوزهای ما</a></li>
      <li><a href="policy.html">خط مشی مشتریان</a></li>
      <li><a href="rules.html">قوانین سایت</a></li>
      <li><a href="contact.html">ارتباط با ما</a></li>
    </ul>

    <div class="nav-bottom">
      <a href="#" class="nav-orders auth-trigger" id="authMenuLink" style="background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8;">
        👤 <span id="authMenuLabel">ثبت نام / ورود</span>
      </a>
      <a href="orders.html" class="nav-orders">📋 سفارشات من</a>

      <div class="balance-box">
        <div class="balance-label">موجودی حساب شما</div>
        <div class="balance-amount">۵۰۰٬۰۰۰ تومان</div>
        <button class="charge-btn" onclick="alert('به زودی امکان شارژ موجودی فعال می‌شود')">
          ⚡ شارژ موجودی
        </button>
      </div>
    </div>
  </nav>
  `;

  // مدال ثبت‌نام / ورود
  const authModalHTML = `
  <div class="modal" id="authModal">
    <div class="modal-content auth-modal-content">
      <div class="modal-header">
        <h2>ثبت‌نام / ورود</h2>
        <span style="cursor:pointer;" class="close-btn-trigger" id="authCloseBtn">✕</span>
      </div>
      <div class="modal-body">

        <p class="auth-sub">اطلاعات زیر رو کامل کن. نام کاربری شما همون کد ملی خواهد بود.</p>

        <form id="registerForm" novalidate>

            <div class="field" id="authNameField">
              <label for="authFullNameInput">نام و نام خانوادگی</label>
              <input type="text" id="authFullNameInput" placeholder="مثلاً: علی محمدی" autocomplete="name">
              <div class="err">لطفاً نام و نام خانوادگی رو کامل وارد کن</div>
            </div>

            <div class="field" id="authPhoneField">
              <label for="authPhoneInput">شماره همراه</label>
              <input type="tel" id="authPhoneInput" class="ltr-input" placeholder="09xxxxxxxxx" maxlength="11" inputmode="numeric" autocomplete="tel">
              <div class="err">شماره همراه معتبر نیست (باید با 09 شروع بشه و ۱۱ رقم باشه)</div>
            </div>

            <div class="field" id="authNidField">
              <label for="authNidInput">کد ملی <span class="hint">(نام کاربری شما)</span></label>
              <input type="text" id="authNidInput" class="ltr-input" placeholder="xxxxxxxxxx" maxlength="10" inputmode="numeric" autocomplete="off">
              <div class="err">کد ملی وارد شده معتبر نیست یا قبلاً ثبت‌نام کرده است</div>
            </div>

            <div class="field" id="authPassField">
              <label for="authPassInput">رمز عبور</label>
              <div class="pass-wrap">
                <input type="password" id="authPassInput" class="ltr-input" placeholder="••••••••" autocomplete="new-password">
                <span class="toggle-eye" data-target="authPassInput">نمایش</span>
              </div>
              <div class="pass-rules">
                <span id="authRuleLen">حداقل ۸ کاراکتر</span>
                <span id="authRuleLower">حرف کوچک</span>
                <span id="authRuleUpper">حرف بزرگ</span>
                <span id="authRuleNum">عدد</span>
              </div>
              <div class="err">رمز عبور باید شرایط بالا رو داشته باشه</div>
            </div>

            <div class="field" id="authPassConfirmField">
              <label for="authPassConfirmInput">تکرار رمز عبور</label>
              <div class="pass-wrap">
                <input type="password" id="authPassConfirmInput" class="ltr-input" placeholder="••••••••" autocomplete="new-password">
                <span class="toggle-eye" data-target="authPassConfirmInput">نمایش</span>
              </div>
              <div class="err">رمز عبور و تکرار آن یکسان نیستند</div>
            </div>

            <div class="field" id="authCaptchaField">
              <label>کد امنیتی</label>
              <div class="captcha-row">
                <div class="captcha-box" id="authCaptchaQuestion">؟ + ؟</div>
                <div class="captcha-refresh" id="authCaptchaRefresh" title="کد جدید">⟳</div>
                <input type="text" id="authCaptchaAnswer" placeholder="پاسخ" inputmode="numeric" maxlength="3">
              </div>
              <div class="err">پاسخ کد امنیتی اشتباه است</div>
            </div>

            <button type="submit" class="btn-primary" id="authSubmitBtn">ثبت‌نام و ورود</button>
        </form>

      </div>
    </div>
  </div>
  `;

  const authToastHTML = `<div class="toast" id="authToast"></div>`;



  // درج هدر و منو در ابتدای body
  document.addEventListener('DOMContentLoaded', function() {
    // اگر قبلاً هدر وجود داشت، حذفش کن تا تکراری نشود
    const existingHeader = document.querySelector('header');
    const existingOverlay = document.getElementById('overlay');
    const existingNav = document.getElementById('navMenu');
    const existingAuthModal = document.getElementById('authModal');
    const existingAuthToast = document.getElementById('authToast');

    if (existingHeader) existingHeader.remove();
    if (existingOverlay) existingOverlay.remove();
    if (existingNav) existingNav.remove();
    if (existingAuthModal) existingAuthModal.remove();
    if (existingAuthToast) existingAuthToast.remove();

    document.body.insertAdjacentHTML('afterbegin', headerHTML + navHTML + authModalHTML + authToastHTML);
    initAuth();
  });
})();

// تابع باز و بسته کردن منو (باید در اسکوپ global باشد)
function toggleMenu() {
  const nav = document.getElementById('navMenu');
  const overlay = document.getElementById('overlay');
  if (nav) nav.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}

// =====================================================
// منطق مدال ثبت‌نام / ورود (مستقل، روی همه صفحات کار می‌کند)
// =====================================================
const AUTH_STORAGE_KEY = 'kafinet_user';
let authCaptchaResult = 0;

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function updateAuthMenuUI() {
  const label = document.getElementById('authMenuLabel');
  const link = document.getElementById('authMenuLink');
  if (!label || !link) return;

  const user = getLoggedInUser();
  if (user && user.fullName) {
    label.textContent = user.fullName;
    link.title = 'برای خروج از حساب کلیک کنید';
  } else {
    label.textContent = 'ثبت نام / ورود';
    link.title = '';
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.classList.add('modal-open');
  generateAuthCaptcha();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
  const scrollY = document.body.style.top;
  document.body.classList.remove('modal-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
}

function generateAuthCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  authCaptchaResult = a + b;
  const q = document.getElementById('authCaptchaQuestion');
  const ans = document.getElementById('authCaptchaAnswer');
  if (q) q.textContent = `${a} + ${b} = ؟`;
  if (ans) ans.value = '';
}

function showAuthToast(msg, type) {
  const toast = document.getElementById('authToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => { toast.className = 'toast'; }, 2600);
}

function isValidPhoneNumber(v) {
  return /^09\d{9}$/.test(v);
}

function isValidNationalId(code) {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false; // رد کردن کدهای تکراری مثل 0000000000
  const check = parseInt(code[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(code[i], 10) * (10 - i);
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

function passwordChecks(v) {
  return {
    len: v.length >= 8,
    lower: /[a-z]/.test(v),
    upper: /[A-Z]/.test(v),
    num: /[0-9]/.test(v),
  };
}

function updateAuthPassRules() {
  const authPassInput = document.getElementById('authPassInput');
  const c = passwordChecks(authPassInput ? authPassInput.value : '');
  const map = { authRuleLen: c.len, authRuleLower: c.lower, authRuleUpper: c.upper, authRuleNum: c.num };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('ok', map[id]);
  });
  return c.len && c.lower && c.upper && c.num;
}

function initAuth() {
  updateAuthMenuUI();

  const authMenuLink = document.getElementById('authMenuLink');
  const authCloseBtn = document.getElementById('authCloseBtn');
  const authModal = document.getElementById('authModal');
  const registerForm = document.getElementById('registerForm');
  const authCaptchaRefresh = document.getElementById('authCaptchaRefresh');
  const authCaptchaAnswer = document.getElementById('authCaptchaAnswer');
  const authPassInput = document.getElementById('authPassInput');

  if (authMenuLink) {
    authMenuLink.addEventListener('click', (e) => {
      e.preventDefault();
      const user = getLoggedInUser();
      if (user) {
        if (confirm(`${user.fullName} عزیز، می‌خواهید از حساب خود خارج شوید؟`)) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          updateAuthMenuUI();
          showAuthToast('با موفقیت از حساب خارج شدید');
        }
        return;
      }
      toggleMenu();
      openAuthModal();
    });
  }

  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  document.querySelectorAll('#authModal .toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? 'مخفی' : 'نمایش';
    });
  });

  const authPhoneInput = document.getElementById('authPhoneInput');
  if (authPhoneInput) {
    authPhoneInput.addEventListener('input', () => {
      authPhoneInput.value = authPhoneInput.value.replace(/[^0-9]/g, '');
    });
  }

  const authNidInput = document.getElementById('authNidInput');
  if (authNidInput) {
    authNidInput.addEventListener('input', () => {
      authNidInput.value = authNidInput.value.replace(/[^0-9]/g, '');
    });
  }

  if (authPassInput) authPassInput.addEventListener('input', updateAuthPassRules);

  if (authCaptchaRefresh) authCaptchaRefresh.addEventListener('click', generateAuthCaptcha);
  if (authCaptchaAnswer) {
    authCaptchaAnswer.addEventListener('input', () => {
      authCaptchaAnswer.value = authCaptchaAnswer.value.replace(/[^0-9]/g, '');
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const authFullNameInput = document.getElementById('authFullNameInput');
      const authNameField = document.getElementById('authNameField');
      const authPhoneField = document.getElementById('authPhoneField');
      const authNidField = document.getElementById('authNidField');
      const authPassField = document.getElementById('authPassField');
      const authPassConfirmInput = document.getElementById('authPassConfirmInput');
      const authPassConfirmField = document.getElementById('authPassConfirmField');
      const authCaptchaField = document.getElementById('authCaptchaField');
      const submitBtn = document.getElementById('authSubmitBtn');

      function setInvalid(field) { if (field) field.classList.add('invalid'); }
      function clearInvalid(field) { if (field) field.classList.remove('invalid'); }

      if (!authFullNameInput.value.trim() || authFullNameInput.value.trim().length < 3) {
        setInvalid(authNameField); valid = false;
      } else clearInvalid(authNameField);

      if (!isValidPhoneNumber(authPhoneInput.value.trim())) {
        setInvalid(authPhoneField); valid = false;
      } else clearInvalid(authPhoneField);

      if (!isValidNationalId(authNidInput.value.trim())) {
        setInvalid(authNidField); valid = false;
      } else clearInvalid(authNidField);

      const passOk = updateAuthPassRules();
      if (!passOk) {
        setInvalid(authPassField); valid = false;
      } else clearInvalid(authPassField);

      if (!authPassConfirmInput.value || authPassConfirmInput.value !== authPassInput.value) {
        setInvalid(authPassConfirmField); valid = false;
      } else clearInvalid(authPassConfirmField);

      if (parseInt(authCaptchaAnswer.value, 10) !== authCaptchaResult) {
        setInvalid(authCaptchaField); valid = false;
        generateAuthCaptcha();
      } else clearInvalid(authCaptchaField);

      if (!valid) {
        showAuthToast('لطفاً خطاهای فرم را برطرف کنید', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'در حال ثبت...';

      const payload = {
        fullName: authFullNameInput.value.trim(),
        phone: authPhoneInput.value.trim(),
        nationalId: authNidInput.value.trim(),
        password: authPassInput.value, // TODO: هرگز رمز را متن‌ساده ذخیره نکنید؛ باید در بک‌اند هش شود
      };

      // TODO: اینجا payload باید به بک‌اند واقعی (مثلاً Cloudflare Worker + دیتابیس) ارسال شود
      console.log('Register payload:', payload);

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ثبت‌نام و ورود';

        // شبیه‌سازی ورود موفق (تا زمانی که بک‌اند واقعی وصل شود)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          fullName: payload.fullName,
          nationalId: payload.nationalId,
          phone: payload.phone,
        }));

        updateAuthMenuUI();
        registerForm.reset();
        updateAuthPassRules();
        closeAuthModal();
        showAuthToast(`خوش آمدید ${payload.fullName}!`, 'success');
      }, 600);
    });
  }
}
