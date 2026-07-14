const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'i18n');

const PAGE_I18N = {
  'asijuhjkrkflccl45lsldkERrt9.html': { en: 'en.json', es: 'es.json' },
  'tutorials.html': { en: 'en.json', es: 'es.json' },
  'beta.html': { en: 'beta-en.json', es: 'beta-es.json' },
};

function build() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (const [page, files] of Object.entries(PAGE_I18N)) {
    const filePath = path.join(ROOT, page);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping ${page}: not found`);
      continue;
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    const en = JSON.parse(fs.readFileSync(path.join(I18N_DIR, files.en), 'utf-8'));
    const es = JSON.parse(fs.readFileSync(path.join(I18N_DIR, files.es), 'utf-8'));

    const inlineI18n =
      `    <script type="application/json" id="i18n-en">${JSON.stringify(en)}</script>\n` +
      `    <script type="application/json" id="i18n-es">${JSON.stringify(es)}</script>`;

    const marker = '<!--INLINE_I18N-->';
    const existingBlock = /<script type="application\/json" id="i18n-en">[\s\S]*?<\/script>\s*<script type="application\/json" id="i18n-es">[\s\S]*?<\/script>/;

    if (html.includes(marker)) {
      html = html.replace(marker, inlineI18n);
    } else if (existingBlock.test(html)) {
      html = html.replace(existingBlock, inlineI18n);
    } else {
      console.warn(`No i18n marker or block found in ${page}, skipping i18n embed`);
    }

    html = html.replace(
      /(href="styles\.css)(?:\?v=[^"]*)?(")/g,
      `$1?v=${dateStr}$2`
    );

    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`Processed ${page} -> ${files.en}, ${files.es}`);
  }
}

build();
