// Prüft WCAG-Kontraste der Token-Kombinationen. Aufruf: node tools/contrast.mjs
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../assets/css/tokens.css', import.meta.url), 'utf8');
const t = Object.fromEntries([...css.matchAll(/--(lks-[\w-]+):\s*(#[0-9a-f]{3,6})/gi)].map((m) => [m[1], m[2]]));
const lum = (hex) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['lks-white', 'lks-blue', 'Hero-Text'], ['lks-white', 'lks-petrol', ''], ['lks-white', 'lks-petrol-strong', 'Kontaktbox'],
  ['lks-white', 'lks-sage', 'nur Grafik'], ['lks-white', 'lks-lightblue', 'nur Grafik'],
  ['lks-taupe', 'lks-white', ''], ['lks-taupe', 'lks-sand', ''],   ['lks-blue-text', 'lks-white', 'Links'], ['lks-blue-text', 'lks-sand', ''], ['lks-petrol-text', 'lks-white', 'Kicker'], ['lks-petrol-text', 'lks-sand', ''],
  ['lks-sage-text', 'lks-white', ''], ['lks-ink', 'lks-sage', 'Icons/Label'], ['lks-ink', 'lks-lightblue', 'Icons'], ['lks-blue', 'lks-white', ''], ['lks-sage', 'lks-white', 'Grafik ≥3:1?'], ['lks-lightblue', 'lks-white', 'Grafik ≥3:1?'],
];
let fail = 0;
for (const [fg, bg, note] of pairs) {
  const r = ratio(t[fg], t[bg]);
  const ok = r >= 4.5 ? 'AA' : r >= 3 ? 'AA groß/Grafik' : '—';
  console.log(`${fg.padEnd(18)} auf ${bg.padEnd(18)} ${r.toFixed(2).padStart(5)}:1  ${ok.padEnd(15)} ${note}`);
}
