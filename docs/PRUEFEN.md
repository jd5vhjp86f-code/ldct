# Freigabeliste

Alle Stellen sind im Prototyp orange gestrichelt mit „PRÜFEN“ markiert (Klasse `lks-pruefen`). Veröffentlichung erst nach Freigabe durch Dr. Benedikt Rosenbaum.

| # | Inhalt | Status | Hinweis |
|---|---|---|---|
| 1 | Formulierung zur Zuweisungsberechtigung | ✅ recherchiert, eingearbeitet | siehe `RECHERCHE.md` Abschnitt 2 |
| 2 | EBM 01875 / 01876, extrabudgetär, Stand-Datum | ✅ eingearbeitet (Stand 29.09.2026) | bundeseinheitlich; keine KVH-Abweichung gefunden |
| 3 | Befundlaufzeit und Übermittlungsweg | ✅ eingearbeitet (05.10.2026) | 14 Tage inkl. Zweitbefundung; elektronisch oder postalisch an Patient und Zuweiser |
| 4 | Privat Versicherte und Selbstzahlende | ✅ entschieden (05.10.2026) | nur allgemeiner Hinweis, dass sie teilnehmen können; keine Preise |
| 5 | Rauchfrei-Telefon (BIÖG) | ✅ eingearbeitet | 0800 8 31 31 31 |
| 6 | Zuweiser-Kontakt | ✅ Telefon Anmeldung aus dem Flyer | ggf. später eigene Durchwahl/E-Mail |
| 7 | Telefonische Erreichbarkeit | ✅ eingearbeitet (05.10.2026) | 9–17 Uhr |
| 8 | Qualitätsnachweise, KV-Genehmigungen | ✅ entschieden (05.10.2026) | werden nicht veröffentlicht; keine Veröffentlichungspflicht |
| 9 | Vergleichswert zur Strahlendosis | ✅ eingearbeitet | „ein Fünftel bis ein Viertel einer üblichen Thorax-CT“ (Krebsinformationsdienst) |
| 10 | Bericht, Flyer-PDF | ✅ eingebaut (05.10.2026) | eigener ärztlicher Bericht nach Muster der KV Hamburg (ausfüllbar) und neuer Flyer im Zuweiserbereich |
| 11 | **Doppelbefundung** | ⚠️ korrigiert | Zweitbefundung nach KFE-RL nur bei auffälligem Erstbefund; bitte bestätigen, ob freiwillig alle Untersuchungen doppelt befundet werden |
| 12 | **Alle medizinischen Texte**: fachliche Endabnahme | ⏳ offen | u. a. FAQ „Vorbereitung“, Nutzen/Risiken |

Zusätzlich vor dem Livegang:

- Design-Tokens: Markenfarben sind am Flyer gemessen; Abgleich mit dem Live-Theme und der Website-Schrift steht aus (siehe `UEBERGABE.md`, Abschnitt 2)
- Quellenlinks einmal selbst öffnen: Sie stammen aus Websuchen, direkte Abrufe waren aus der Build-Umgebung blockiert. Der G-BA-Link zur Versicherteninformation ist korrigiert (siehe `RECHERCHE.md` Abschnitt 9).
- OG-Bild erstellen

# Nebenbefunde auf der bestehenden Website (unabhängig vom Projekt)

- Footer: MRT/CT-Telefon **040 3500485-0**, an anderen Stellen **040 3500484-0**. Vermutlich ein Zahlendreher.
- Tippfehler: „Radiolgie Walddörfer“ (2×), „Dr. med.Benedikt“ (Leerzeichen fehlt), im MRT-Teaser der Startseite „dass“ statt „das“ und „Köperinneren“.
- Flyer-PDF: bestätigt. Die PDF ist eine Rastergrafik mit Texterkennungsebene; daher die kaputten Trennungen, ein verstümmelter Titel, keine Sprache und kein Beschnitt. Details und Empfehlung in `RECHERCHE.md` Abschnitt 11.

Diese Punkte stammen aus dem Projektplan. Aus der Build-Umgebung konnten sie nicht erneut überprüft werden.
