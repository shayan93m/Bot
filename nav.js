// nav.js

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
});

function initNavbar() {
  const headerHtml = `
    <header class="app-header">
      <div class="header-right">
        <!-- دکمه دارک مود سمت راست -->
        <button id="themeToggleBtn" class="theme-toggle-btn" title="تغییر تم (روز / شب)">
          🌙
        </button>
        <a href="index.html" class="brand-logo">کافی‌نت من</a>
      </div>

      <!-- دکمه منوی همبرگری برای موبایل -->
      <button class="menu-toggle-btn" id="menuToggleBtn" aria-label="منو">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- لینک‌های منو -->
      <nav class="header-nav" id="headerNav">
        <ul>
          <li><a href="index.html">صفحه اصلی</a></li>
          <li><a href="licenses.html">مجوزها</a></li>
        </ul>
      </nav>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHtml);

  // رویداد منوی همبرگری
  const menuBtn = document.getElementById('menuToggleBtn');
  const nav = document.getElementById('headerNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // رویداد تغییر تم
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

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
