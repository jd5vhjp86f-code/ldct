/**
 * Minimaler Build ohne Abhängigkeiten: setzt die Seiten aus src/pages mit den
 * Partials aus src/partials zusammen und schreibt den statischen Prototyp nach public/.
 *
 * Include-Syntax (angelehnt an Twig `{% include 'x' with {...} %}`):
 *   <!-- @include lung-hero id="hub" label="Lungen-Symbol" -->
 * Im Partial werden {{schlüssel}} ersetzt. Sonderfall {{a11y}}: mit `label`
 * wird role="img" + aria-label gesetzt, sonst aria-hidden (dekorativ).
 *
 * Aufruf:
 *   node tools/build.mjs            → public/          (Prototyp, GitHub Pages)
 *   node tools/build.mjs --agentur  → dist/agentur/    (Produktionsfassung für das Theme:
 *     ohne Prototyp-Kopf/-Fuß, ohne noindex/robots.txt/CNAME, feste Pfade
 *     /lungenkrebsscreening… und Assets unter ASSET_BASE)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, cpSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const AGENTUR = process.argv.includes('--agentur');
const ASSET_BASE = '/themes/ohjunge/assets/lks/';
const out = AGENTUR ? join(root, 'dist', 'agentur') : join(root, 'public');

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function render(html, depth = 0) {
  if (depth > 10) throw new Error('Include-Tiefe überschritten');
  return html.replace(/<!--\s*@include\s+([\w-]+)((?:\s+[\w-]+="[^"]*")*)\s*-->/g, (_, name, attrs) => {
    const params = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    params.a11y = params.label
      ? `role="img" aria-label="${escAttr(params.label)}"`
      : 'aria-hidden="true" focusable="false"';
    const partial = readFileSync(join(src, 'partials', `${name}.html`), 'utf8').trimEnd();
    const filled = partial.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, k) => params[k] ?? '');
    return render(filled, depth + 1);
  });
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
// Agentur: Assets liegen bereits in der Zielstruktur des Themes (ASSET_BASE)
const assetOut = AGENTUR ? join(out, ...ASSET_BASE.split('/').filter(Boolean)) : join(out, 'assets');
cpSync(join(root, 'assets'), assetOut, { recursive: true });
if (AGENTUR) {
  rmSync(join(assetOut, 'robots-prototyp.txt'));
} else {
  // Prototyp: komplette Sperre für Suchmaschinen (entfällt im Theme)
  cpSync(join(root, 'assets', 'robots-prototyp.txt'), join(out, 'robots.txt'));
  // GitHub Pages: keine Jekyll-Verarbeitung
  writeFileSync(join(out, '.nojekyll'), '');
  // Eigene Domain für GitHub Pages (Prototyp)
  writeFileSync(join(out, 'CNAME'), 'ldct.rosenbaum.hamburg\n');
}

/** Produktionsfassung: Prototyp-Rahmen entfernen, relative Pfade auf feste URLs umstellen. */
function toProduction(html, pagePath) {
  html = html
    .replace(/\s*<!-- Prototyp: nicht indexieren[^>]*-->\s*<meta name="robots"[^>]*>/, '')
    .replace(/\s*<link rel="icon"[^>]*>/, '')
    .replace(/\s*<a class="lks-skip"[^>]*>.*?<\/a>/, '')
    .replace(/<header class="lks-proto-header">[\s\S]*?<\/header>/, '<!-- THEME: Seitenkopf und Navigation aus dem Layout -->')
    .replace(/<footer class="lks-proto-footer">[\s\S]*?<\/footer>/, '<!-- THEME: Fußbereich aus dem Layout -->');
  const base = new URL(pagePath, 'https://prototyp.invalid/');
  return html.replace(/\b(href|src)="([^"#][^"]*)"/g, (m, attr, url) => {
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) return m;
    const abs = new URL(url, base);
    let p = abs.pathname;
    if (p.startsWith('/assets/')) p = ASSET_BASE + p.slice('/assets/'.length);
    else if (p !== '/') p = p.replace(/\/$/, '');
    return `${attr}="${p}${abs.hash}"`;
  });
}

const pagesDir = join(src, 'pages');
for (const file of walk(pagesDir).filter((f) => f.endsWith('.html'))) {
  const rel = relative(pagesDir, file);
  if (AGENTUR && rel === 'index.html') continue; // Prototyp-Übersicht entfällt
  const target = join(out, rel);
  mkdirSync(dirname(target), { recursive: true });
  let html = render(readFileSync(file, 'utf8'));
  if (AGENTUR) html = toProduction(html, '/' + rel.replace(/index\.html$/, ''));
  writeFileSync(target, html);
  console.log('Seite  ', rel);
}

if (AGENTUR) {
  // Teaser für Startseite und /ct-diagnostik als eigenständiges Snippet
  const snip = join(out, 'snippets');
  mkdirSync(snip, { recursive: true });
  writeFileSync(join(snip, 'teaser-startseite-ct-diagnostik.html'),
    toProduction(render('<!-- @include teaser id="lks-teaser" base="" -->'), '/') + '\n');
  console.log('Snippet', 'snippets/teaser-startseite-ct-diagnostik.html');
}

// Eigenständige SVG-Dateien der Leitbild-Varianten (für Druck, Agentur, CMS-Medien)
const svgDir = join(assetOut, 'svg');
mkdirSync(svgDir, { recursive: true });
const standaloneCss = `<style>.lks-lung__left{fill:#68b1d4}.lks-lung__right{fill:#45aa9a}.lks-lung__rings{color:rgba(255,255,255,.35)}</style>`;
for (const [name, variant] of [['lung-hero', 'hero'], ['lung-small', 'small'], ['lung-mono', 'mono']]) {
  let svg = render(`<!-- @include ${name} id="file" label="Lungen-Symbol der Radiologie Dammtor" -->`);
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  if (variant === 'hero') svg = svg.replace(/(<svg[^>]*>)/, `$1<rect width="240" height="240" fill="#007ba9"/>`);
  if (variant !== 'mono') svg = svg.replace(/(<svg[^>]*>)/, `$1${standaloneCss}`);
  writeFileSync(join(svgDir, `${name}.svg`), `${svg}\n`);
  console.log('SVG    ', relative(out, join(svgDir, `${name}.svg`)));
}
