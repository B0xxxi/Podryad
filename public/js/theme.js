const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function updateButtonClasses(theme) {
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(button => {
    if (theme === 'dark') {
      button.classList.remove('button--light');
      button.classList.add('button--dark');
    } else {
      button.classList.remove('button--dark');
      button.classList.add('button--light');
    }
  });
}

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateButtonClasses(theme);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

document.addEventListener('DOMContentLoaded', initTheme);
