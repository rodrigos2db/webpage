let currentLanguage = 'en';
let translations = {};

function detectPreferredLanguage() {
  const preferredLang = localStorage.getItem('language');
  const browserRaw = navigator.language || navigator.userLanguage || 'en';
  const browserLang = browserRaw.slice(0, 2);
  if (preferredLang === 'en' || preferredLang === 'es') return preferredLang;
  return browserLang === 'es' ? 'es' : 'en';
}

function upgradeLanguageSelectors() {
  document.querySelectorAll('.lang-switcher').forEach((legacy) => {
    const selector = document.createElement('div');
    selector.className = 'language-selector';
    selector.dataset.languageSelector = '';
    selector.innerHTML = `
      <button type="button" data-language-trigger onclick="togglePageLanguageMenu(this)"
        aria-haspopup="menu" aria-expanded="false">
        <img data-language-flag src="uk.svg" alt="" aria-hidden="true">
        <span data-language-code>EN</span><span aria-hidden="true">▾</span>
      </button>
      <div data-language-menu role="menu" class="language-menu hidden">
        <button type="button" role="menuitemradio" data-language="es" onclick="selectPageLanguage(this, 'es')">
          <span data-language-check></span><img src="spain.svg" alt="" aria-hidden="true"><span data-language-label="es">Spanish</span>
        </button>
        <button type="button" role="menuitemradio" data-language="en" onclick="selectPageLanguage(this, 'en')">
          <span data-language-check></span><img src="uk.svg" alt="" aria-hidden="true"><span data-language-label="en">English</span>
        </button>
      </div>`;
    legacy.replaceWith(selector);
  });
}

function updateLanguageSelectors() {
  const isEs = currentLanguage === 'es';
  document.querySelectorAll('[data-language-selector]').forEach((selector) => {
    const flag = selector.querySelector('[data-language-flag]');
    const code = selector.querySelector('[data-language-code]');
    const trigger = selector.querySelector('[data-language-trigger]');
    if (flag) flag.src = isEs ? 'spain.svg' : 'uk.svg';
    if (code) code.textContent = currentLanguage.toUpperCase();
    if (trigger) {
      trigger.title = isEs ? 'Seleccionar idioma' : 'Select language';
      trigger.setAttribute('aria-label', trigger.title);
    }
    selector.querySelectorAll('[data-language-label]').forEach((label) => {
      const language = label.dataset.languageLabel;
      label.textContent = language === 'es'
        ? (isEs ? 'Español' : 'Spanish')
        : (isEs ? 'Inglés' : 'English');
    });
    selector.querySelectorAll('[role="menuitemradio"]').forEach((item) => {
      item.setAttribute('aria-checked', String(item.dataset.language === currentLanguage));
      const check = item.querySelector('[data-language-check]');
      if (check) check.textContent = item.dataset.language === currentLanguage ? '✓' : '';
    });
  });
}

function togglePageLanguageMenu(trigger) {
  const selector = trigger.closest('[data-language-selector]');
  const menu = selector.querySelector('[data-language-menu]');
  const open = menu.classList.toggle('hidden') === false;
  trigger.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector('[role="menuitemradio"]')?.focus();
}

async function selectPageLanguage(item, language) {
  const selector = item.closest('[data-language-selector]');
  await setLanguage(language);
  selector.querySelector('[data-language-menu]').classList.add('hidden');
  selector.querySelector('[data-language-trigger]').setAttribute('aria-expanded', 'false');
}

async function loadTranslations(lang) {
  if (translations[lang]) return translations[lang];
  const el = document.getElementById('i18n-' + lang);
  if (el) {
    try {
      translations[lang] = JSON.parse(el.textContent);
      return translations[lang];
    } catch(e) {}
  }
  try {
    const response = await fetch(`i18n/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations[lang] = await response.json();
    return translations[lang];
  } catch (err) {
    console.error(`Failed to load translations for "${lang}":`, err);
    return null;
  }
}

async function setLanguage(lang) {
  const dict = await loadTranslations(lang);
  if (!dict) return;

  localStorage.setItem('language', lang);
  currentLanguage = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (dict[key]) {
      el.innerText = dict[key];
    }
    const placeholderKey = el.getAttribute('data-placeholder-key');
    if (placeholderKey && dict[placeholderKey]) {
      el.setAttribute('placeholder', dict[placeholderKey]);
    }
  });

  const pageKey = document.body.dataset.page || 'index';
  if (dict['page-title-' + pageKey]) {
    document.title = dict['page-title-' + pageKey];
  }
  updateLanguageSelectors();
}

document.addEventListener('DOMContentLoaded', async () => {
  upgradeLanguageSelectors();
  const langToSet = detectPreferredLanguage();
  console.log(`🌐 Idioma detectado: ${langToSet}`);

  await setLanguage(langToSet);
  document.body.style.visibility = 'visible';

  document.addEventListener('mousedown', (event) => {
    document.querySelectorAll('[data-language-selector]').forEach((selector) => {
      if (!selector.contains(event.target)) {
        selector.querySelector('[data-language-menu]')?.classList.add('hidden');
        selector.querySelector('[data-language-trigger]')?.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('[data-language-selector]').forEach((selector) => {
      selector.querySelector('[data-language-menu]')?.classList.add('hidden');
      selector.querySelector('[data-language-trigger]')?.setAttribute('aria-expanded', 'false');
    });
  });
});
