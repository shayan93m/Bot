// nav.js

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
});

function initNavbar() {
  const headerHtml = `
    <header class="app-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--card-bg, #ffffff); border-bottom: 1px solid var(--border-color, #e2e8f0); position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
      <div class="header-right" style="display: flex; align-items: center; gap: 12px;">
        <!-- دکمه دارک مود در سمت راست منو -->
        <button id="themeToggleBtn" class="theme-toggle-btn" title="تغییر تم (روز / شب)">
          🌙
        </button>
        <a href="index.html" class="brand-logo" style="font-weight: 800; font-size: 1.1rem; text-decoration: none; color: var(--text-color, #1e293b);">
          کافی‌نت من
        </a>
      </div>

      <nav class="header-nav">
        <ul style="display: flex; list-style: none; gap: 15px; margin: 0; padding: 0;">
          <li><a href="index.html" style="text-decoration: none; color: var(--text-color, #1e293b); font-weight: 600; font-size: 0.95rem;">صفحه اصلی</a></li>
          <li><a href="licenses.html" style="text-decoration: none; color: var(--text-color, #1e293b); font-weight: 600; font-size: 0.95rem;">مجوزها</a></li>
        </ul>
      </nav>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHtml);

  // اتصال رویداد کلیک دکمه تغییر تم
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
}

// مدیریت دارک‌مود و همگام‌سازی با تم سیستم‌عامل/گوشی
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // انتخاب تم بر اساس ذخیره قبلی یا تنظیمات گوشی کاربر
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

  // شنود تغییرات تم گوشی به صورت زنده
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerText = theme === 'dark' ? '☀️' : '🌙';
  }
}
