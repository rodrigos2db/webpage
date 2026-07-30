let currentLanguage = 'en';
let translations = {};

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
  });

  const pageKey = document.body.dataset.page || 'index';
  if (dict['page-title-' + pageKey]) {
    document.title = dict['page-title-' + pageKey];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const preferredLang = localStorage.getItem('language');
  const browserRaw = navigator.language || navigator.userLanguage || 'en';
  const browserLang = browserRaw.slice(0, 2);

  let langToSet = 'en';
  if (preferredLang && (preferredLang === 'en' || preferredLang === 'es')) {
    langToSet = preferredLang;
  } else if (browserLang === 'es') {
    langToSet = 'es';
  }
  console.log(`🌐 Idioma detectado: ${langToSet} (navegador: ${browserLang}, preferido: ${preferredLang})`);

  await setLanguage(langToSet);
  document.body.style.visibility = 'visible';
});
