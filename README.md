# Lungenkrebsscreening – Unterseite für radiologie-dammtor.de

Statischer Prototyp (HTML/CSS/Vanilla-JS) der neuen Unterseite zur Lungenkrebs-Früherkennung mit Niedrigdosis-CT (LuKrFrühErkV / KFE-RL), vorgesehen zur Übergabe an die Theme-Agentur (OctoberCMS, Theme `ohjunge`).

> **Status:** Prototyp, **nicht zur Veröffentlichung freigegeben.** Orange markierte Stellen („PRÜFEN“) warten noch auf die fachliche bzw. rechtliche Freigabe, siehe [`docs/PRUEFEN.md`](docs/PRUEFEN.md). Die Markenfarben sind am Flyer gemessen, der Abgleich mit dem Live-Theme und der Website-Schrift steht noch aus.

## Seiten

| URL | Inhalt |
|---|---|
| `/lungenkrebsscreening/` | Hub: Hero mit Leitbild, Claims, Zielgruppen-Weiche, Kurzinfo, Kontakt |
| `/lungenkrebsscreening/patienten/` | Patientenbereich inkl. Packungsjahre-Rechner (einfach), Timeline, Nutzen/Risiken, FAQ |
| `/lungenkrebsscreening/zuweiser/` | Zuweiserbereich inkl. Checkliste (Druck + PDF), Swimlane, Befundinhalte, Rechner (erweitert) |
| `/` | Prototyp-Übersicht, Teaser für Startseite und `/ct-diagnostik`, Leitbild-Varianten |

## Schnellstart

```bash
npm test                 # Unit-Tests der Rechenlogik (node --test, keine Abhängigkeiten)
node tools/build.mjs     # setzt src/ + assets/ zu public/ zusammen
npm run serve            # http://localhost:8080 (Ordner public/ lokal ausliefern)
node tools/contrast.mjs  # WCAG-Kontraste der Token-Kombinationen
node tools/make-pdf.mjs  # Checkliste-PDF neu erzeugen (Playwright, Server muss laufen)
```

`public/` ist das Build-Ergebnis und wird mit eingecheckt, damit die Agentur den Prototyp ohne Node öffnen kann.

## Aufbau

```
assets/css/tokens.css      Design-Tokens (--lks-*), einzige Stelle für Farben/Typo
assets/css/lks.css         Komponenten (Klassen mit Präfix lks-)
assets/js/packyears.js     Rechenlogik als reine Funktionen, ohne DOM-Zugriff (portierbares ES-Modul)
assets/js/packyears-ui.js  Oberfläche des Rechners (beide Modi)
assets/downloads/          Checkliste Zuweisung (PDF)
src/partials/              Bausteine (entsprechen späteren Twig-Partials)
src/pages/                 Seiten
test/                      Unit-Tests
tools/                     Build, Kontrastprüfung, PDF-Erzeugung
docs/                      Übergabe, QA-Protokoll, Freigabeliste, Screenshots
```

Weitere Dokumentation:

- [`docs/UEBERGABE.md`](docs/UEBERGABE.md): Integration ins OctoberCMS-Theme
- [`docs/QA.md`](docs/QA.md): QA-Protokoll
- [`docs/PRUEFEN.md`](docs/PRUEFEN.md): Freigabeliste und Nebenbefunde der bestehenden Website
- [`docs/RECHERCHE.md`](docs/RECHERCHE.md): Rechercheergebnisse mit Quellen, Befund zur Flyer-PDF
