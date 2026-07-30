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
- Fuentes HTML escaneadas por Tailwind: index.html, tutorials.html, beta.html, _includes/header.html
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
  js/i18n.js              # Engine i18n (carga traducciones, setLanguage, data-key)
  scripts/
    build-i18n.js         # Build: inyecta header + i18n + valida drift
  input.css               # Entry point de Tailwind v4
  styles.css              # Generado: Tailwind v4 compiled
  index.html              # Sin build: contiene <!--HEADER--> + <!--INLINE_I18N--> markers
  tutorials.html          # Sin build: contiene <!--HEADER--> + <!--INLINE_I18N--> markers
  beta.html               # Sin build: contiene <!--INLINE_I18N--> marker
```
