# Freigabeliste

Alle Stellen sind im Prototyp orange gestrichelt mit „PRÜFEN“ markiert (Klasse `lks-pruefen`). Veröffentlichung erst nach Freigabe durch Dr. Benedikt Rosenbaum.

| # | Inhalt | Seite | Hinweis |
|---|---|---|---|
| 1 | Formulierung zur Zuweisungsberechtigung | Patienten (Teilnahme), Zuweiser (7.1) | Gegen die aktuelle KFE-RL (§ 43) und die KV Hamburg abgleichen; nicht jede Hausarztpraxis ist berechtigt |
| 2 | EBM 01875 / 01876, extrabudgetäre Vergütung, Stand-Datum | Zuweiser (Abrechnung) | Mit der KV Hamburg abgleichen; Referenz war die Information der KV Saarland |
| 3 | Befundlaufzeit und Übermittlungsweg | Patienten (Timeline), Zuweiser (Befund) | z. B. KIM, Fax, Post |
| 4 | Kosten für PKV und Selbstzahlende | Patienten (FAQ) | |
| 5 | Rauchfrei-Telefon (BIÖG): Nummer und Link | Patienten (Rauchstopp) | Vor Veröffentlichung auf der offiziellen Seite verifizieren |
| 6 | Zuweiser-Kontakt (eigene Durchwahl/E-Mail) | Zuweiser (Kontakt) | |
| 7 | Sprechzeiten bzw. telefonische Erreichbarkeit | alle Kontaktboxen | aus der bestehenden Website übernehmen |
| 8 | Weitere Qualitätsnachweise und KV-Genehmigung | Zuweiser (Qualität) | Zertifikat CT-Lunge laut Website-Footer |
| 9 | Vergleichswert zur Strahlendosis (optional) | Patienten (FAQ) | nur mit Quelle (z. B. BfS) |
| 10 | Link zur BÄK-Berichtsvorlage, Flyer-PDF | Zuweiser (Downloads) | Flyer mit bedingten Trennstrichen neu exportieren |
| 11 | **Alle medizinischen Texte**: fachliche Endabnahme | alle | u. a. FAQ „Vorbereitung“ (nicht nüchtern, Atemanhalten), Nutzen/Risiken |

Zusätzlich vor dem Livegang:

- Design-Tokens mit dem Live-Theme abgleichen (siehe `UEBERGABE.md`, Abschnitt 2)
- Quellenlinks (G-BA, BÄK, KBV) auf Aktualität prüfen. Aus der Build-Umgebung waren sie nicht abrufbar, die URLs sind unverändert aus dem Projektplan übernommen.
- OG-Bild erstellen

# Nebenbefunde auf der bestehenden Website (unabhängig vom Projekt)

- Footer: MRT/CT-Telefon **040 3500485-0**, an anderen Stellen **040 3500484-0**. Vermutlich ein Zahlendreher.
- Tippfehler: „Radiolgie Walddörfer“ (2×), „Dr. med.Benedikt“ (Leerzeichen fehlt), im MRT-Teaser der Startseite „dass“ statt „das“ und „Köperinneren“.
- Flyer-PDF: Die Textebene enthält kaputte Trennungen („HAUS-ARZT P-RAXIS“, „LUNGENKREBS S-CREENING“). Beim Export bedingte Trennstriche verwenden, sonst leiden Screenreader und Suchmaschinen.

Diese Punkte stammen aus dem Projektplan. Aus der Build-Umgebung konnten sie nicht erneut überprüft werden.
