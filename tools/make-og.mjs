/**
 * Erzeugt das Open-Graph-Bild assets/og/lungenkrebsscreening.png (1200 × 630)
 * aus src/og.html. Voraussetzung: Playwright/Chromium.
 * Aufruf: node tools/make-og.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const partial = readFileSync(join(root, 'src/partials/lung-hero.html'), 'utf8')
  .replace('{{a11y}}', 'aria-hidden="true"');
const html = readFileSync(join(root, 'src/og.html'), 'utf8').replace('<!-- @include lung-hero -->', partial);
const tmp = join(root, 'src/.og-tmp.html');
writeFileSync(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('file://' + tmp);
await page.screenshot({ path: join(root, 'assets/og/lungenkrebsscreening.png') });
await browser.close();
rmSync(tmp);
console.log('OG-Bild erstellt');
