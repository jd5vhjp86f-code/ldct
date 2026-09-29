/**
 * Erzeugt assets/downloads/checkliste-zuweisung-lungenkrebsscreening.pdf aus der
 * Druckansicht der Zuweiserseite (gleiche Quelle wie „Checkliste drucken“).
 * Voraussetzung: `npm run build` und laufender Server (`npm run serve`), Playwright/Chromium.
 * Aufruf: node tools/make-pdf.mjs [basis-url]
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:8080';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/lungenkrebsscreening/zuweiser/`);
await page.evaluate(() => document.body.classList.add('lks-print-checklist'));
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: new URL('../assets/downloads/checkliste-zuweisung-lungenkrebsscreening.pdf', import.meta.url).pathname,
  format: 'A4',
  margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
  printBackground: true,
  displayHeaderFooter: false,
});
await browser.close();
console.log('PDF erstellt');
