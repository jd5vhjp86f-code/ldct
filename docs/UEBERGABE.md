# Übergabe an die Theme-Agentur

Kurzfassung für die Agentur: `docs/Briefing-Webagentur-Lungenkrebsscreening.pdf`. Dieses Dokument enthält die technischen Details.

## 1. Ausgangslage

Weder auf das Theme-Repository noch auf die Live-Website bestand Zugriff (die Netzwerkrichtlinie der Build-Umgebung hat `radiologie-dammtor.de` blockiert). Deshalb ist der Prototyp eigenständig gebaut. Er ist so aufgebaut, dass er sich 1:1 in OctoberCMS-Pages und Twig-Partials überführen lässt.

## 2. Tokens: Abgleich mit dem Live-Theme (offen)

`assets/css/tokens.css` ist die **einzige** Stelle mit Farb- und Typografiewerten. Vor der Integration:

1. Die Markenfarben sind am Praxis-Flyer gemessen (siehe `RECHERCHE.md` Abschnitt 11). Mit `/themes/ohjunge/assets/` (Theme-CSS) sowie `logo.svg` und `logo-icon.svg` abgleichen und nur bei Abweichungen `--lks-blue`, `--lks-petrol`, `--lks-sage`, `--lks-lightblue`, `--lks-taupe` und `--lks-sand` ersetzen.
2. `--theme-font` auf die im Theme geladene Schrift setzen oder `--lks-font` direkt anpassen. Es wird **keine** neue Schrift nachgeladen.
3. Die Kontrastvarianten (`--lks-*-text`, `--lks-petrol-strong`, `--lks-ink`) mit `node tools/contrast.mjs` neu prüfen. Alle Textkombinationen brauchen mindestens 4,5:1.
4. Optional können die Aufzählungspunkte auf `active-dot.svg` des Themes umgestellt werden (`.lks-dots > li::before`).

Bekannte Kontrastgrenzen der Flyer-Palette: Weiß auf Salbei (2,8:1) und Weiß auf Hellblau (2,4:1) ist für Text **nicht** zulässig. Weiß auf Petrol (4,1:1) reicht nur für große Schrift, daher gibt es für die Kontaktbox `--lks-petrol-strong`. Der Flyer setzt Weiß auf Petrol auch in kleiner Schrift ein – im Druck unkritischer, im Web nicht AA-konform.

## 3. Überführung in OctoberCMS

| Prototyp | OctoberCMS |
|---|---|
| `src/pages/lungenkrebsscreening/index.html` | Page `lungenkrebsscreening.htm`, URL `/lungenkrebsscreening` |
| `src/pages/lungenkrebsscreening/patienten/index.html` | Page, URL `/lungenkrebsscreening/patienten` |
| `src/pages/lungenkrebsscreening/zuweiser/index.html` | Page, URL `/lungenkrebsscreening/zuweiser` |
| `src/partials/*.html` | `partials/lks/*.htm` |
| `<!-- @include name key="wert" -->` | `{% partial 'lks/name' key='wert' %}` |
| `{{schlüssel}}` im Partial | `{{ schlüssel }}` (Twig) |
| `{{a11y}}` in den Leitbild-Partials | `{% if label %}role="img" aria-label="{{ label }}"{% else %}aria-hidden="true" focusable="false"{% endif %}` |
| `head`, `site-header`, `site-footer` | entfallen, dafür das Layout des Themes; Meta-Daten in die Page-Settings (title, description, og) |
| `assets/css/*.css`, `assets/js/*.js` | `/themes/ohjunge/assets/…`, per `{% put styles %}` / `{% put scripts %}` nur auf diesen Seiten |

Hinweise:

- **Navigation:** Leistungen → Lungenkrebsscreening (neben CT-Diagnostik). Den Teaser (`partials/teaser.html`) auf der Startseite und auf `/ct-diagnostik` einbinden.
- **JSON-LD** (`MedicalWebPage`, `BreadcrumbList`) steht im `<head>` jeder Seite und muss mit übernommen werden.
- **OG-Bild** liegt unter `assets/og/lungenkrebsscreening.png` (1200 × 630, erzeugt mit `node tools/make-og.mjs` aus `src/og.html`). Im `<head>` ist es unter `https://www.radiologie-dammtor.de/themes/ohjunge/assets/lks/og/lungenkrebsscreening.png` referenziert.
- **Produktionsfassung:** `node tools/build.mjs --agentur` schreibt nach `dist/agentur/`: nur Inhaltsbereich (Kopf und Fuß aus dem Theme-Layout), ohne `noindex`/`robots.txt`, feste URLs (`/lungenkrebsscreening…`) und alle Assets unter `themes/ohjunge/assets/lks/`. Das Teaser-Snippet liegt unter `snippets/`.
- **Downloads:** ärztlicher Bericht (ausfüllbar, nach Muster der KV Hamburg), Flyer und Checkliste liegen unter `assets/downloads/`.
- **Doctolib** ist nur verlinkt, nicht eingebettet.
- **Checkliste drucken:** Der Button setzt `body.lks-print-checklist`. Dafür muss `#checkliste` ein **direktes Kind von `<main>`** sein.
- Der **Rechner** arbeitet ohne Abhängigkeiten, es genügt `<script type="module" src="…/packyears-ui.js">`. Er sendet und speichert nichts. Kein Tracking-Skript darf sich an seine Eingabefelder hängen.
- Klassen `lks-proto-*` und `lks-pruefen` gehören nur zum Prototyp und entfallen in der Produktion.

## 4. Leitbild (Lungen-Symbol)

Das Motiv ist ein eigener Nachbau als Inline-SVG in drei Varianten:

- `lung-hero`: groß auf `--lks-blue`, Ringe pulsieren langsam vom Zielpunkt aus, nur bei `prefers-reduced-motion: no-preference`.
- `lung-small`: Abschnittsmarker, Kacheln, Teaser, Favicon.
- `lung-mono`: einfarbig (`currentColor`), Bronchien und Zielpunkt ausgestanzt, geeignet für Druck und kleine Größen.

Eigenständige Dateien liegen nach dem Build in `public/assets/svg/`. Der Zielpunkt dient nur als Leitbild, **nicht** als Warnsignal im Rechner-Ergebnis.

## 5. Packungsjahre-Rechner

- Die Logik steckt in `assets/js/packyears.js` (`calculatePackYears`, `evaluateCriteria`, `validateInput`, `buildSummary`), die Tests in `test/packyears.test.js`.
- **Einfacher Modus** (Patienten): Alter oder Geburtsjahr, Status, Rauchbeginn, Rauchstopp, Zigaretten pro Tag, Pausen.
- **Erweiterter Modus** (Zuweiser): beliebig viele Phasen (von/bis in Kalenderjahren, Zigaretten pro Tag). Lücken zwischen den Phasen gelten als Pausen, das Ende der letzten Phase gilt bei ehemals Rauchenden als Rauchstopp. Dazu kommt eine kopierbare Kurzzusammenfassung.
- **Geburtsjahr:** Daraus lässt sich das Alter nur auf ±1 Jahr bestimmen. Liegt es an der Grenze (50 bzw. 75/76), lautet das Ergebnis „nicht beurteilbar“ statt einer falschen Zu- oder Absage.
- **Aktiv Rauchende:** Das Kriterium „Rauchstopp“ bekommt den Status „entfällt“ und zählt als erfüllt (daher „4/4“ in der Zusammenfassung).
- **Packungsjahre** werden auf dem angezeigten, auf eine Nachkommastelle gerundeten Wert mit der Schwelle von 15 verglichen, damit Anzeige und Bewertung übereinstimmen.
- **Genauigkeit im einfachen Modus:** Die Rauchdauer wird auf ganze Jahre gerechnet (Jahr des Rauchstopps minus Geburtsjahr minus Alter bei Rauchbeginn) und kann daher um ±1 Jahr abweichen. Das reicht für eine Orientierung, das Ergebnis wird ausdrücklich nicht als Anspruch formuliert.

## 6. Freigegebene Entscheidungen (29.09.2026, Dr. Benedikt Rosenbaum)

Diese Punkte weichen vom ursprünglichen Plan ab oder präzisieren ihn. Sie sind freigegeben und bei der Integration beizubehalten:

1. **Alter aus dem Geburtsjahr:** Liegt das Alter an einer Grenze (50 bzw. 75/76), ist das Alterskriterium „nicht beurteilbar“. Das Gesamtergebnis lautet dann „Einzelne Angaben lassen sich rechnerisch nicht eindeutig beurteilen …“.
2. **Aktiv Rauchende:** Das Kriterium „Rauchstopp“ hat den Status „entfällt“ und zählt als erfüllt, daher „4/4“ in der Kurzzusammenfassung.
3. **Zuweiser-Rechner:** eigene Ergebnistexte (`RESULT_TEXT_CLINICIAN` in `packyears.js`) ohne Patientenansprache. Die Patiententexte aus dem Plan gelten nur für den einfachen Modus.
4. **Kontaktbox:** Hintergrund `--lks-petrol-strong` (`#007273`, Weiß darauf 5,8:1), weil Weiß auf dem Flyer-Petrol nur 4,1:1 erreicht. Beim Token-Abgleich mit dem Theme einen gleichwertig dunklen Petrol-Ton festlegen und mit `node tools/contrast.mjs` prüfen (mindestens 4,5:1).

## 7. Silbentrennung (05.10.2026)

- Keine automatische Silbentrennung in Überschriften, Kickern, Labels, Buttons und Navigation; Überschriften werden mit `text-wrap: balance` ausgewogen umbrochen.
- Fließtext wird nur bis 640 px Breite automatisch getrennt, und nur bei Wörtern ab 12 Zeichen mit mindestens 5 Zeichen vor und nach der Trennstelle.
- Bewusste Trennstellen sind als `&shy;` gesetzt (z. B. „Lungenkrebs&shy;früherkennung“ in der Abrechnungstabelle und in der Checkliste).
- Lange Einzelwörter in Überschriften (Hero, Dokumenttitel) skalieren über Container-Query-Einheiten (`cqi`) mit der Spaltenbreite, statt getrennt zu werden.
- Hinweis zum Testen: Chromium unter Linux bringt oft keine deutschen Trennmuster mit. Ob automatisch getrennt wird, deshalb auf Safari (macOS/iOS) und Firefox prüfen.
