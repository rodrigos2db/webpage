# Reglas de edición para speak2db/webpage

## i18n — traducciones (single source of truth)

**NO editar los bloques `<script type="application/json">` inline en los HTML.**
Las traducciones se editan exclusivamente en:

| Archivo | Para |
|---|---|
| `i18n/en.json` | index.html (116 claves) |
| `i18n/es.json` | index.html (116 claves) |
| `i18n/beta-en.json` | beta.html (88 claves) |
| `i18n/beta-es.json` | beta.html (88 claves) |
| `i18n/tutorials-en.json` | tutorials.html (20 claves) |
| `i18n/tutorials-es.json` | tutorials.html (20 claves) |
| `i18n/promo-en.json` | promo.html (28 claves) |
| `i18n/promo-es.json` | promo.html (28 claves) |

`promo.html` es una landing suelta **sin navbar** (`<!--HEADER-->` no aplica):
se sirve en `/promo` (prod) y `/promo/qa` (QA) — la ruta es la señal de
entorno, el JS elige la API (`api` vs `qa-api`), inyecta `noindex` y el badge
`[QA]`. Solo `/promo` entra en el sitemap y `/promo/qa` lleva además el header
`X-Robots-Tag: noindex, nofollow` en `app.yaml`.

### `promo.html` — avisos y atribución reCAPTCHA

- El formulario responde a `already_sent` del backend (cooldown de 15 min del
  `POST /promo/send-code`) con `promo-already-sent-title` /
  `promo-already-sent-desc`, sustituyendo el título y la descripción del
  bloque de éxito vía `promoShowSuccess()` (`{minutes}` se rellena con
  `ceil(retry_after_s/60)`, y "min" es invariante en EN/ES para no tener
  plural). Ese es el motivo de los ids `promo-success-title` y
  `promo-success-desc`: **no quitarlos**, el JS los usa.
- Los minutos de la ventana viven en el backend (`PROMO_RESEND_COOLDOWN_MIN`)
  pero el texto estático de `promo-success-desc` los escribe a mano ("15
  min"). Si cambias el env, cambia también ese string.
- La atribución legal de reCAPTCHA (bajo `promo-privacy`) está **estática en
  inglés y sin `data-key`**, igual que `beta.html`: `setLanguage()` asigna
  `innerText`, así que borraría los `<a>` a las políticas de Google.

El build step (`npm run build`) valida que no haya drift entre los archivos externos y los inline.

## Navbar / header — single source of truth

El markup del navbar está en `_includes/header.html`.
Se inyecta en index.html y tutorials.html via `npm run build`.
Para cambiar el header: editar **solo** `_includes/header.html` y correr `npm run build`.

## Build

```bash
npm run build          # regenera styles.css + inyecta header + refresh i18n
npm run build:css      # solo regenerar styles.css desde input.css
npm run build:i18n     # solo inyectar header + i18n
```

Correr `npm run build` **antes de cada commit** para asegurar consistencia.

## js/i18n.js — single source of truth para el engine i18n

El engine i18n (carga de traducciones, detección de idioma, `setLanguage()`) vive en `js/i18n.js`.
**No duplicar inline en los HTML.**
- Las funciones `setLanguage()` y `loadTranslations()` son globales (usadas por `onclick` en navbar).
- Cada página debe tener `<script src="js/i18n.js"></script>` al final del `<body>`.
- No requiere build step — es un archivo estático.
- La página muestra `visibility: hidden` hasta que el engine aplica las traducciones (FOUC guard via inline `<style>`).

## Archivos fuente (antes del build)

`_includes/header.html` → `<!--HEADER-->` marker
`i18n/*.json` → `<!--INLINE_I18N-->` marker (o reemplazo automático)

Los HTML contienen `<!--HEADER-->` como placeholder. El build lo reemplaza con el contenido de `_includes/header.html`.

## CSS

- `styles.css` se genera desde `input.css` + Tailwind v4
- Fuentes HTML escaneadas por Tailwind (`tailwind.config.js`): index.html, tutorials.html, beta.html, promo.html, _includes/header.html
- No editar `styles.css` directamente, siempre regenerar vía `npm run build:css`
- Clases utilitarias repetitivas (btn-primary, btn-secondary) pueden agregarse como rules en input.css

## Estructura de archivos

```
webpage/
  _includes/
    header.html           # ÚNICO markup del navbar
  i18n/
    en.json               # Fuente de traducciones EN (index)
    es.json               # Fuente de traducciones ES (index)
    tutorials-en.json     # Fuente de traducciones EN (tutorials, 20 claves)
    tutorials-es.json     # Fuente de traducciones ES (tutorials, 20 claves)
    beta-en.json          # Fuente de traducciones EN (beta)
    beta-es.json          # Fuente de traducciones ES (beta)
    promo-en.json         # Fuente de traducciones EN (promo, 28 claves)
    promo-es.json         # Fuente de traducciones ES (promo, 28 claves)
  js/i18n.js              # Engine i18n (carga traducciones, setLanguage, data-key)
  scripts/
    build-i18n.js         # Build: inyecta header + i18n + valida drift
    build-sitemap.js      # Build: genera sitemap.xml (incluye /promo)
  input.css               # Entry point de Tailwind v4
  styles.css              # Generado: Tailwind v4 compiled
  index.html              # Sin build: contiene <!--HEADER--> + <!--INLINE_I18N--> markers
  tutorials.html          # Sin build: contiene <!--HEADER--> + <!--INLINE_I18N--> markers
  beta.html               # Sin build: contiene <!--INLINE_I18N--> marker
  promo.html              # Sin build: contiene <!--INLINE_I18N--> marker
```
