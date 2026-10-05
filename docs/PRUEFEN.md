# Freigabeliste

Alle Stellen sind im Prototyp orange gestrichelt mit „PRÜFEN“ markiert (Klasse `lks-pruefen`). Veröffentlichung erst nach Freigabe durch Dr. Benedikt Rosenbaum.

| # | Inhalt | Status | Hinweis |
|---|---|---|---|
| 1 | Formulierung zur Zuweisungsberechtigung | ✅ recherchiert, eingearbeitet | siehe `RECHERCHE.md` Abschnitt 2 |
| 2 | EBM 01875 / 01876, extrabudgetär, Stand-Datum | ✅ eingearbeitet (Stand 29.09.2026) | bundeseinheitlich; keine KVH-Abweichung gefunden |
| 3 | Befundlaufzeit und Übermittlungsweg | ⏳ offen | praxisintern festzulegen (z. B. KIM, Fax, Post) |
| 4 | Kosten PKV | ✅ eingearbeitet | tarifabhängig |
| 4a | Selbstzahler-Angebot und Preis | ⏳ offen | Entscheidung der Praxis |
| 5 | Rauchfrei-Telefon (BIÖG) | ✅ eingearbeitet | 0800 8 31 31 31 |
| 6 | Zuweiser-Kontakt | ✅ Telefon Anmeldung aus dem Flyer | ggf. später eigene Durchwahl/E-Mail |
| 7 | Sprechzeiten bzw. telefonische Erreichbarkeit | ⏳ offen | nicht im Flyer, Website nicht erreichbar |
| 8 | Qualitätsnachweise, KV-Genehmigungen (Dammtor und Asklepios Klinikum Harburg) | ⏳ offen | |
| 9 | Vergleichswert zur Strahlendosis | ✅ eingearbeitet | „ein Fünftel bis ein Viertel einer üblichen Thorax-CT“ (Krebsinformationsdienst) |
| 10 | Bericht, Flyer-PDF | ✅ eingebaut (05.10.2026) | eigener ärztlicher Bericht nach Muster der KV Hamburg (ausfüllbar) und neuer Flyer im Zuweiserbereich |
| 10a | Bestellweg für gedruckte Flyer | ⏳ offen | im Zuweiserbereich markiert |
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
