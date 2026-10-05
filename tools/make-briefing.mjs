/**
 * Erzeugt docs/Briefing-Webagentur-Lungenkrebsscreening.pdf aus docs/briefing-agentur.html.
 * Aufruf: node tools/make-briefing.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + join(root, 'docs/briefing-agentur.html'));
await page.pdf({
  path: join(root, 'docs/Briefing-Webagentur-Lungenkrebsscreening.pdf'),
  format: 'A4', preferCSSPageSize: true, printBackground: true,
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: '<div style="font:8px Arial;color:#5f524a;width:100%;text-align:center">Briefing Webagentur · Unterseite Lungenkrebsscreening · Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>',
});
await browser.close();
console.log('Briefing-PDF erstellt');
