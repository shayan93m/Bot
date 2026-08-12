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
      <a href="login.html" class="nav-orders" style="background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8;">
        👤 ثبت نام / ورود
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

  // درج هدر و منو در ابتدای body
  document.addEventListener('DOMContentLoaded', function() {
    // اگر قبلاً هدر وجود داشت، حذفش کن تا تکراری نشود
    const existingHeader = document.querySelector('header');
    const existingOverlay = document.getElementById('overlay');
    const existingNav = document.getElementById('navMenu');
    
    if (existingHeader) existingHeader.remove();
    if (existingOverlay) existingOverlay.remove();
    if (existingNav) existingNav.remove();

    document.body.insertAdjacentHTML('afterbegin', headerHTML + navHTML);
  });
})();

// تابع باز و بسته کردن منو (باید در اسکوپ global باشد)
function toggleMenu() {
  const nav = document.getElementById('navMenu');
  const overlay = document.getElementById('overlay');
  if (nav) nav.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}
