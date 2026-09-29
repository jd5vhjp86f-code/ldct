/**
 * Minimaler Build ohne Abhängigkeiten: setzt die Seiten aus src/pages mit den
 * Partials aus src/partials zusammen und schreibt den statischen Prototyp nach public/.
 *
 * Include-Syntax (angelehnt an Twig `{% include 'x' with {...} %}`):
 *   <!-- @include lung-hero id="hub" label="Lungen-Symbol" -->
 * Im Partial werden {{schlüssel}} ersetzt. Sonderfall {{a11y}}: mit `label`
 * wird role="img" + aria-label gesetzt, sonst aria-hidden (dekorativ).
 *
 * Aufruf: node tools/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, cpSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const out = join(root, 'public');

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
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
// Prototyp: komplette Sperre für Suchmaschinen (entfällt im Theme)
cpSync(join(root, 'assets', 'robots-prototyp.txt'), join(out, 'robots.txt'));
// GitHub Pages: keine Jekyll-Verarbeitung
writeFileSync(join(out, '.nojekyll'), '');

const pagesDir = join(src, 'pages');
for (const file of walk(pagesDir).filter((f) => f.endsWith('.html'))) {
  const rel = relative(pagesDir, file);
  const target = join(out, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, render(readFileSync(file, 'utf8')));
  console.log('Seite  ', rel);
}

// Eigenständige SVG-Dateien der Leitbild-Varianten (für Druck, Agentur, CMS-Medien)
const svgDir = join(out, 'assets', 'svg');
mkdirSync(svgDir, { recursive: true });
const standaloneCss = `<style>.lks-lung__left{fill:#68b1d4}.lks-lung__right{fill:#45aa9a}.lks-lung__rings{color:rgba(255,255,255,.35)}</style>`;
for (const [name, variant] of [['lung-hero', 'hero'], ['lung-small', 'small'], ['lung-mono', 'mono']]) {
  let svg = render(`<!-- @include ${name} id="file" label="Lungen-Symbol der Radiologie Dammtor" -->`);
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  if (variant === 'hero') svg = svg.replace(/(<svg[^>]*>)/, `$1<rect width="240" height="240" fill="#007ba9"/>`);
  if (variant !== 'mono') svg = svg.replace(/(<svg[^>]*>)/, `$1${standaloneCss}`);
  writeFileSync(join(svgDir, `${name}.svg`), `${svg}\n`);
  console.log('SVG    ', `assets/svg/${name}.svg`);
}
