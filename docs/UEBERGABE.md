# Übergabe an die Theme-Agentur

## 1. Ausgangslage

Weder auf das Theme-Repository noch auf die Live-Website bestand Zugriff (die Netzwerkrichtlinie der Build-Umgebung hat `radiologie-dammtor.de` blockiert). Deshalb ist der Prototyp eigenständig gebaut. Er ist so aufgebaut, dass er sich 1:1 in OctoberCMS-Pages und Twig-Partials überführen lässt.

## 2. Tokens: Abgleich mit dem Live-Theme (offen)

`assets/css/tokens.css` ist die **einzige** Stelle mit Farb- und Typografiewerten. Vor der Integration:

1. Die Markenfarben aus `/themes/ohjunge/assets/` (Theme-CSS) sowie aus `logo.svg` und `logo-icon.svg` auslesen und `--lks-blue`, `--lks-petrol`, `--lks-sage`, `--lks-lightblue`, `--lks-taupe` und `--lks-sand` ersetzen.
2. `--theme-font` auf die im Theme geladene Schrift setzen oder `--lks-font` direkt anpassen. Es wird **keine** neue Schrift nachgeladen.
3. Die Kontrastvarianten (`--lks-*-text`, `--lks-petrol-strong`, `--lks-ink`) mit `node tools/contrast.mjs` neu prüfen. Alle Textkombinationen brauchen mindestens 4,5:1.
4. Optional können die Aufzählungspunkte auf `active-dot.svg` des Themes umgestellt werden (`.lks-dots > li::before`).

Bekannte Kontrastgrenzen der Flyer-Palette: Weiß auf Salbei (2,9:1) und Weiß auf Hellblau (2,4:1) ist für Text **nicht** zulässig. Weiß auf Petrol (4,3:1) reicht nur für große Schrift, daher gibt es für die Kontaktbox `--lks-petrol-strong`.

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
- **OG-Bild** `/assets/og/lungenkrebsscreening.png` (1200 × 630) muss noch erstellt werden, am besten aus `assets/svg/lung-hero.svg` mit Headline.
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
