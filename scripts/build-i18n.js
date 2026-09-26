const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'i18n');
const INCLUDES_DIR = path.join(ROOT, '_includes');

const PAGE_I18N = {
  'index.html': { en: 'en.json', es: 'es.json' },
  'tutorials.html': { en: 'tutorials-en.json', es: 'tutorials-es.json' },
  'beta.html': { en: 'beta-en.json', es: 'beta-es.json' },
};

function buildHeader(pageName) {
  const headerPath = path.join(INCLUDES_DIR, 'header.html');
  if (!fs.existsSync(headerPath)) {
    console.warn('  _includes/header.html not found, skipping header');
    return null;
  }
  let header = fs.readFileSync(headerPath, 'utf-8');

  if (pageName === 'tutorials.html') {
    header = header
      .replace('href="HOMEPAGE"', 'href="index.html"')
      .replace('href="#features"', 'href="index.html#features"')
      .replace('href="#audience"', 'href="index.html#audience"')
      .replace(/<a href="#faq"[^>]*>[\s\S]*?<\/a>\s*/m, '')
      .replace('<a href="tutorials.html"', '<a href="tutorials.html" class="active"')
      .replace('aria-label="Join the free open beta of Speak2DB">Free Beta</a>', '>Beta</a>')
      .replace('alt="Switch Speak2DB interface to English"', 'alt="English"')
      .replace('alt="Cambiar la interfaz de Speak2DB al español"', 'alt="Español"');
  } else {
    header = header.replace('href="HOMEPAGE"', 'href="#hero"');
  }

  return header;
}

function validateDrift(html, pageName, files) {
  const enExternal = JSON.parse(fs.readFileSync(path.join(I18N_DIR, files.en), 'utf-8'));
  const esExternal = JSON.parse(fs.readFileSync(path.join(I18N_DIR, files.es), 'utf-8'));

  const enInlineMatch = html.match(/<script type="application\/json" id="i18n-en">([\s\S]*?)<\/script>/);
  const esInlineMatch = html.match(/<script type="application\/json" id="i18n-es">([\s\S]*?)<\/script>/);

  const results = [];

  if (enInlineMatch) {
    try {
      const enInline = JSON.parse(enInlineMatch[1]);
      const enKeys = new Set(Object.keys(enInline));
      const externalKeys = new Set(Object.keys(enExternal));
      const missingInInline = [...externalKeys].filter(k => !enKeys.has(k));
      const missingInExternal = [...enKeys].filter(k => !externalKeys.has(k));
      if (missingInInline.length || missingInExternal.length) {
        results.push(`  EN drift: missing in inline [${missingInInline.join(', ')}], missing in external [${missingInExternal.join(', ')}]`);
      }
    } catch (e) {
      results.push(`  EN inline JSON parse error: ${e.message}`);
    }
  }

  if (esInlineMatch) {
    try {
      const esInline = JSON.parse(esInlineMatch[1]);
      const esKeys = new Set(Object.keys(esInline));
      const externalKeys = new Set(Object.keys(esExternal));
      const missingInInline = [...externalKeys].filter(k => !esKeys.has(k));
      const missingInExternal = [...esKeys].filter(k => !externalKeys.has(k));
      if (missingInInline.length || missingInExternal.length) {
        results.push(`  ES drift: missing in inline [${missingInInline.join(', ')}], missing in external [${missingInExternal.join(', ')}]`);
      }
    } catch (e) {
      results.push(`  ES inline JSON parse error: ${e.message}`);
    }
  }

  return results;
}

function build() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  let hasDrift = false;

  for (const [page, files] of Object.entries(PAGE_I18N)) {
    const filePath = path.join(ROOT, page);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping ${page}: not found`);
      continue;
    }

    let html = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // --- Header injection ---
    if (html.includes('<!--HEADER-->')) {
      const headerHtml = buildHeader(page);
      if (headerHtml) {
        html = html.replace('<!--HEADER-->', headerHtml);
        modified = true;
        console.log(`  Injected header into ${page}`);
      }
    } else {
      console.log(`  No HEADER marker in ${page}, skipping header`);
    }

    // --- i18n inline injection ---
    const en = JSON.parse(fs.readFileSync(path.join(I18N_DIR, files.en), 'utf-8'));
    const es = JSON.parse(fs.readFileSync(path.join(I18N_DIR, files.es), 'utf-8'));

    const inlineI18n =
      `    <script type="application/json" id="i18n-en">${JSON.stringify(en)}</script>\n` +
      `    <script type="application/json" id="i18n-es">${JSON.stringify(es)}</script>`;

    const marker = '<!--INLINE_I18N-->';
    const existingBlock = /<script type="application\/json" id="i18n-en">[\s\S]*?<\/script>\s*<script type="application\/json" id="i18n-es">[\s\S]*?<\/script>/;

    if (html.includes(marker)) {
      html = html.replace(marker, inlineI18n);
      modified = true;
    } else if (existingBlock.test(html)) {
      html = html.replace(existingBlock, inlineI18n);
      modified = true;
    } else {
      console.warn(`  No i18n marker or block found in ${page}, skipping i18n embed`);
    }

    // --- Drift validation ---
    const drifts = validateDrift(html, page, files);
    if (drifts.length) {
      hasDrift = true;
      drifts.forEach(d => console.warn(`  ⚠ ${d}`));
    } else {
      console.log(`  ✓ i18n keys match external files`);
    }

    // --- CSS cache bust ---
    html = html.replace(
      /(href="styles\.css)(?:\?v=[^"]*)?(")/g,
      `$1?v=${dateStr}$2`
    );

    if (modified) {
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`Processed ${page} -> ${files.en}, ${files.es}`);
    } else {
      console.log(`No changes for ${page}`);
    }
  }

  if (hasDrift) {
    console.warn('\n⚠ Drift detected between inline i18n and external files.');
    console.warn('  Edit /i18n/*.json, NOT the inline JSON in the HTML file, then run npm run build.');
  }
}

build();
