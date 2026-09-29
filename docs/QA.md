# QA-Protokoll

Stand: 29.09.2026 · Prüfumgebung: lokaler Build (`public/`), `http-server` ohne Kompression, Chromium 141 (Playwright), Lighthouse 12, axe-core 4.

## Unit-Tests (`npm test`)

33 von 33 Tests bestanden. Abgedeckt sind:

- 10 × 30 = 15,0 PY · 20 × 25 = 25,0 PY · 40 × 10 = 20,0 PY · Phasen 10 J. à 20 + 15 J. à 10 = 17,5 PY
- Altersgrenzen 49 / 50 / 75 / 76, Geburtsjahr an der Grenze → „nicht beurteilbar“
- Rauchstopp vor 9 Jahren → erfüllt, vor genau 10 Jahren → nicht erfüllt, aktiv Rauchende → „entfällt“
- Pausen: 30 J. Zeitraum − 5 J. Pause = 25 J.; Rauchdauer 24 J. → nicht erfüllt; Schwelle 14,9 / 15,0 PY
- erweiterter Modus: Pausen aus Phasenlücken, Rauchstopp = Ende der letzten Phase, Kurzzusammenfassung im Beispielformat
- Ergebnistexte: keine Anspruchs-/Entwarnungsformulierung (Patienten), keine Patientenansprache (Zuweiser)
- Validierung: Rauchbeginn vor aktuellem Alter, Rauchstopp nicht in der Zukunft und nicht vor dem Rauchbeginn, Zigaretten pro Tag 1–100, Pausen, überlappende Phasen

## Lighthouse (Ziel: ≥ 90 in allen Kategorien)

| Seite | Modus | Performance | Barrierefreiheit | Best Practices | SEO |
|---|---|---|---|---|---|
| /lungenkrebsscreening/ | mobil | 100 | 100 | 100 | 100 |
| /lungenkrebsscreening/ | Desktop | 100 | 100 | 100 | 100 |
| /lungenkrebsscreening/patienten/ | mobil | 99 | 100 | 100 | 100 |
| /lungenkrebsscreening/patienten/ | Desktop | 100 | 100 | 100 | 100 |
| /lungenkrebsscreening/zuweiser/ | mobil | 99 | 100 | 100 | 100 |
| /lungenkrebsscreening/zuweiser/ | Desktop | 100 | 100 | 100 | 100 |

Einzelhinweise ohne Einfluss auf das Ziel: Textkompression (gzip/brotli) und Minifizierung übernimmt der Produktionsserver bzw. die Asset-Pipeline des Themes. Im Theme-Kontext kommen dessen eigene Ressourcen hinzu, deshalb nach der Integration erneut messen.

## axe-core (WCAG 2.0/2.1 A + AA + Best Practices)

Nach der Recherche-Überarbeitung erneut geprüft. Geprüft wurden alle vier Seiten bei 1280 px und bei 360 px, mit ausgefülltem Rechner (Ergebniszustand) und geöffneten FAQ: **0 Verstöße.**

## Mobil 360 px

Kein horizontales Scrollen (`scrollWidth` = 360 auf allen Seiten). Die Timeline läuft vertikal, die Swimlane wird zur nummerierten Liste mit farbiger Bahnkennzeichnung.

## Druckansicht Checkliste

Der Button „Checkliste drucken“ druckt nur `#checkliste`, mit Feldern für Patientin/Patient, Datum und Praxisstempel. Das PDF `assets/downloads/checkliste-zuweisung-lungenkrebsscreening.pdf` stammt aus derselben Druckansicht (A4, eine Seite).

## Funktionstest Rechner (Playwright, End-to-End)

- Patientenmodus, Beispiel: 61 J., Rauchstopp 2020, Beginn mit 18, 15 Zig./Tag → 27,8 PY, 37 J., alle Kriterien erfüllt. Die Live-Region meldet das Ergebnis.
- Fehlerfall: Rauchstopp 2030 → Meldung am Feld, `aria-invalid="true"`.
- Zuweisermodus mit zwei Phasen → „Packungsjahre: 17,5 · Rauchdauer: 25 J. · Pausen: 16 J. · Status: aktiv · Alter: 61 · Kriterien rechnerisch erfüllt: 4/4 (Eignungsprofil ärztlich zu prüfen)“. Kopieren in die Zwischenablage funktioniert.
- Netzwerk: Der Rechner sendet keine Anfragen, speichert nichts (kein Storage, keine Cookies) und lädt nichts von externen Quellen nach.

## Noch offen / manuell zu prüfen

- Screenreader-Test (NVDA/Firefox, VoiceOver/Safari), besonders Live-Region und Phasen hinzufügen/entfernen
- Safari/iOS und Firefox (bisher nur Chromium automatisiert geprüft)
- erneute Messung nach der Theme-Integration mit den echten Tokens und der echten Schrift
