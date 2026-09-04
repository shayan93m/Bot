// nav.js - منوی مشترک برای همه صفحات
// فقط این فایل را تغییر دهید تا منو در تمام صفحات به‌روز شود

(function() {
  const headerHTML = `
  <header>
    <button class="account-icon-btn" id="accountIconBtn" title="حساب کاربری">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12z" stroke="currentColor" stroke-width="1.8"/>
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
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
    </div>
  </nav>
  `;

  // مدال ثبت‌نام / ورود
  const authModalHTML = `
  <div class="modal" id="authModal">
    <div class="modal-content auth-modal-content">
      <div class="modal-header">
        <h2 id="authModalTitle">ورود</h2>
        <span style="cursor:pointer;" class="close-btn-trigger" id="authCloseBtn">✕</span>
      </div>
      <div class="modal-body">

        <!-- فرم ورود -->
        <div id="loginFormWrap">
          <p class="auth-sub">با کد ملی و رمز عبوری که ثبت کردی وارد شو.</p>

          <form id="loginForm" novalidate>

            <div class="field" id="authLoginNidField">
              <label for="authLoginNidInput">نام کاربری (کد ملی)</label>
              <input type="text" id="authLoginNidInput" class="ltr-input" placeholder="xxxxxxxxxx" maxlength="10" inputmode="numeric" autocomplete="username">
              <div class="err">کد ملی یا رمز عبور اشتباه است</div>
            </div>

            <div class="field" id="authLoginPassField">
              <label for="authLoginPassInput">رمز عبور</label>
              <div class="pass-wrap">
                <input type="password" id="authLoginPassInput" class="ltr-input" placeholder="••••••••" autocomplete="current-password">
                <span class="toggle-eye" data-target="authLoginPassInput">نمایش</span>
              </div>
              <div class="err">کد ملی یا رمز عبور اشتباه است</div>
            </div>

            <div class="field" id="authLoginCaptchaField">
              <label>کد امنیتی</label>
              <div class="captcha-row">
                <div class="captcha-box" id="authLoginCaptchaQuestion">؟ + ؟</div>
                <div class="captcha-refresh" id="authLoginCaptchaRefresh" title="کد جدید">⟳</div>
                <input type="text" id="authLoginCaptchaAnswer" placeholder="پاسخ" inputmode="numeric" maxlength="3">
              </div>
              <div class="err">پاسخ کد امنیتی اشتباه است</div>
            </div>

            <button type="submit" class="btn-primary" id="authLoginSubmitBtn">ورود</button>
          </form>

          <div class="auth-switch-row">
            <a href="#" id="forgotPassLink">فراموشی رمز عبور</a>
            <a href="#" id="goToRegisterLink">حساب ندارید؟ ثبت‌نام کنید</a>
          </div>
        </div>

        <!-- فرم ثبت‌نام -->
        <div id="registerFormWrap" style="display:none;">
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

          <div class="auth-switch-row">
            <a href="#" id="goToLoginLink">قبلاً ثبت‌نام کرده‌اید؟ وارد شوید</a>
          </div>
        </div>

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
const REGISTERED_ACCOUNT_KEY = 'kafinet_registered_account'; // اطلاعات ثبت‌نام (برای ورود بعدی) که با خروج پاک نمی‌شود
let authCaptchaResult = 0;
let authLoginCaptchaResult = 0;

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getRegisteredAccount() {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = 'index.html';
}

function updateAccountIconUI() {
  const btn = document.getElementById('accountIconBtn');
  if (!btn) return;
  const user = getLoggedInUser();
  if (user && user.fullName) {
    btn.title = `حساب کاربری (${user.fullName})`;
    btn.classList.add('logged-in');
  } else {
    btn.title = 'ثبت‌نام / ورود';
    btn.classList.remove('logged-in');
  }
}

function showLoginView() {
  const loginWrap = document.getElementById('loginFormWrap');
  const registerWrap = document.getElementById('registerFormWrap');
  const title = document.getElementById('authModalTitle');
  if (loginWrap) loginWrap.style.display = 'block';
  if (registerWrap) registerWrap.style.display = 'none';
  if (title) title.textContent = 'ورود';
  generateAuthLoginCaptcha();
}

function showRegisterView() {
  const loginWrap = document.getElementById('loginFormWrap');
  const registerWrap = document.getElementById('registerFormWrap');
  const title = document.getElementById('authModalTitle');
  if (loginWrap) loginWrap.style.display = 'none';
  if (registerWrap) registerWrap.style.display = 'block';
  if (title) title.textContent = 'ثبت‌نام';
  generateAuthCaptcha();
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.classList.add('modal-open');
  showLoginView(); // پیش‌فرض: فرم ورود
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

function generateAuthLoginCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  authLoginCaptchaResult = a + b;
  const q = document.getElementById('authLoginCaptchaQuestion');
  const ans = document.getElementById('authLoginCaptchaAnswer');
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
  updateAccountIconUI();

  const accountIconBtn = document.getElementById('accountIconBtn');
  const authCloseBtn = document.getElementById('authCloseBtn');
  const authModal = document.getElementById('authModal');
  const registerForm = document.getElementById('registerForm');
  const authCaptchaRefresh = document.getElementById('authCaptchaRefresh');
  const authCaptchaAnswer = document.getElementById('authCaptchaAnswer');
  const authPassInput = document.getElementById('authPassInput');

  // فرم ورود
  const loginForm = document.getElementById('loginForm');
  const authLoginNidInput = document.getElementById('authLoginNidInput');
  const authLoginPassInput = document.getElementById('authLoginPassInput');
  const authLoginCaptchaRefresh = document.getElementById('authLoginCaptchaRefresh');
  const authLoginCaptchaAnswer = document.getElementById('authLoginCaptchaAnswer');
  const goToRegisterLink = document.getElementById('goToRegisterLink');
  const goToLoginLink = document.getElementById('goToLoginLink');
  const forgotPassLink = document.getElementById('forgotPassLink');

  if (goToRegisterLink) {
    goToRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterView(); });
  }
  if (goToLoginLink) {
    goToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginView(); });
  }
  if (forgotPassLink) {
    forgotPassLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthToast('این قابلیت به‌زودی اضافه می‌شود', 'error');
    });
  }

  if (authLoginNidInput) {
    authLoginNidInput.addEventListener('input', () => {
      authLoginNidInput.value = authLoginNidInput.value.replace(/[^0-9]/g, '');
    });
  }

  if (authLoginCaptchaRefresh) authLoginCaptchaRefresh.addEventListener('click', generateAuthLoginCaptcha);
  if (authLoginCaptchaAnswer) {
    authLoginCaptchaAnswer.addEventListener('input', () => {
      authLoginCaptchaAnswer.value = authLoginCaptchaAnswer.value.replace(/[^0-9]/g, '');
    });
  }

  document.querySelectorAll('#loginFormWrap .toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? 'مخفی' : 'نمایش';
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const nidField = document.getElementById('authLoginNidField');
      const passField = document.getElementById('authLoginPassField');
      const captchaField = document.getElementById('authLoginCaptchaField');
      const submitBtn = document.getElementById('authLoginSubmitBtn');

      function setInvalid(field) { if (field) field.classList.add('invalid'); }
      function clearInvalid(field) { if (field) field.classList.remove('invalid'); }

      [nidField, passField].forEach(clearInvalid);

      if (parseInt(authLoginCaptchaAnswer.value, 10) !== authLoginCaptchaResult) {
        setInvalid(captchaField); valid = false;
        generateAuthLoginCaptcha();
      } else clearInvalid(captchaField);

      if (!valid) {
        showAuthToast('کد امنیتی درست وارد نشده', 'error');
        return;
      }

      const enteredNid = authLoginNidInput.value.trim();
      const enteredPass = authLoginPassInput.value;

      // TODO: این فقط شبیه‌سازی محلی است. برای ورود واقعی و امن، باید به بک‌اند واقعی وصل شود.
      const account = getRegisteredAccount();

      if (!account || account.nationalId !== enteredNid || account.password !== enteredPass) {
        setInvalid(nidField);
        setInvalid(passField);
        showAuthToast('کد ملی یا رمز عبور اشتباه است', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'در حال ورود...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ورود';

        // شروع نشست کاربر (بدون ذخیره رمز در نشست فعال)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          fullName: account.fullName,
          nationalId: account.nationalId,
          phone: account.phone,
        }));

        updateAccountIconUI();
        closeAuthModal();
        showAuthToast(`خوش آمدید ${account.fullName}!`, 'success');
        window.location.href = 'my-account.html';
      }, 400);
    });
  }

  if (accountIconBtn) {
    accountIconBtn.addEventListener('click', () => {
      const user = getLoggedInUser();
      if (user) {
        window.location.href = 'my-account.html';
        return;
      }
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

        // ذخیره اطلاعات ثبت‌نام برای ورودهای بعدی (باقی می‌ماند حتی بعد از خروج)
        // TODO: هرگز رمز را متن‌ساده ذخیره نکنید؛ باید در بک‌اند هش شود
        localStorage.setItem(REGISTERED_ACCOUNT_KEY, JSON.stringify(payload));

        // شروع نشست فعلی (بدون رمز در نشست فعال)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          fullName: payload.fullName,
          nationalId: payload.nationalId,
          phone: payload.phone,
        }));

        updateAccountIconUI();
        registerForm.reset();
        updateAuthPassRules();
        closeAuthModal();
        showAuthToast(`خوش آمدید ${payload.fullName}!`, 'success');
        window.location.href = 'my-account.html';
      }, 600);
    });
  }
}
