const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const date = new Date().toISOString().slice(0, 10);

// Single source of truth for sitemap URLs
const urls = [
  { loc: 'https://www.speak2db.com/', priority: '1.0', changefreq: 'weekly' },
  { loc: 'https://www.speak2db.com/tutorials.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://www.speak2db.com/beta.html', priority: '0.5', changefreq: 'monthly' },
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n') +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf-8');
console.log(`  ✓ sitemap.xml generated (${urls.length} URLs, lastmod ${date})`);
