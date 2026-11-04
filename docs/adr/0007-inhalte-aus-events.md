# ADR-0007: Inhalte aus Events: Seiten, Beiträge, Materialien, Lizenzstand

## Status
angenommen · 04.11.2026 · Entscheidung der Maintainer · Bezug: Issues `4a3d1b54…` (Schaufenster live), `371d9cbf…` (Spielregeln), `9770e756…` (Material-Detail), `516faa60…` (Lizenzstand) (gitworkshop)

## Kontext
ADR-0006 legt fest, dass Ansichten live von den Relays laden und der Schnappschuss Rückfall bleibt. Das Schaufenster der Community (Seiten, Beiträge, Navigation, Fußzeile) und der Materialpool zeigten bisher eingebettete Texte und Beispielwerte. Redaktionelle Inhalte gehören aber nicht in den Hub-Code: Wer sie pflegt, soll sie veröffentlichen können, ohne die Datei zu ändern. Beim Material kommt hinzu, dass die Lizenz bestimmt, was mit einem Eintrag geschehen darf (weitergeben, bearbeiten, in die Sammlung legen).

## Entscheidung
1. Die Inhalte des Schaufensters kommen als Events vom Schaufenster-Schlüssel `npub1tgftg8kptdrxxg0g3sm3hckuglv3j0uu3way4vylc5qyt0f44m0s3gun6e`. Seiten sind `kind:30023` mit dem Label `["l","seite","foerbico/typ"]`, Beiträge sind `kind:30023` ohne dieses Label, Menü und Fußzeile sind Listen `kind:30004` mit `d=navigation` und `d=fusszeile`, Termine sind `kind:31923`. Die vier Spielregeln-Seiten werden über feste `d`-Namen gefunden, die als Konvention zwischen Code und Inhalt gelten: `spielregeln-qualitaetskriterien`, `spielregeln-metadatenprofil`, `spielregeln-redaktion`, `spielregeln-ablaeufe`. Fehlt eine Seite, erscheint sie als „in Vorbereitung“ mit Link, nie als toter Link.
2. Markdown rendert der Hub mit einem eigenen Renderer (`mdSeite`): zuerst wird maskiert, dann werden die Auszeichnungen gesetzt; Links und Bilder nur mit `http(s)`; keine Tabellen, keine HTML-Durchreichung.
3. Die Teamseite bleibt ein Schnappschuss mit Initialen, weil Porträts urheberrechtlich geschützt sind (ADR-0002 Punkt 3).
4. Materialien kommen als `kind:30142` von allen drei Relays, mit einer Abfrage je Relay. Ein Material wird über `pubkey:d` bestimmt. Die Detailansicht nimmt den Eintrag zuerst aus dem Listen-Zwischenspeicher und fragt nur bei einem Fehlgriff gezielt nach (`#d`, und `authors` nur, wenn `p` gegeben und ein gültiger 64-Hex-Schlüssel ist). Das JSON-LD wird aus den Tags gebildet, ohne erfundene Werte; ein einzelnes `prefLabel` bleibt eine Zeichenkette.
5. Der Lizenzstand folgt aus `license:id`: offen (CC0, Public Domain, CC BY, CC BY-SA), geschützt (NC, ND, Urheberrecht, Stock-Lizenzen) oder unbekannt (fehlend oder nicht erkannt; gilt wie geschützt). Aktionen, die der Stand nicht erlaubt, bleiben sichtbar, sind deaktiviert und tragen einen Hinweis. Die Auswertung eines Prüf-Markers (`l=geprueft`, NIP-32) ist angelegt; bisher trägt kein Event das Label; die Regel, wer prüfen darf, ist Stufe B.

Verworfen: Texte im Hub-Code (jede Änderung bräuchte eine Auslieferung); eine Markdown-Bibliothek von außen (zusätzliche Abhängigkeit und HTML-Durchreichung, die der Hub nicht will); Ausblenden gesperrter Aktionen (die Regel bliebe unsichtbar); Materialidentität nur über `d` (verschiedene Schlüssel können denselben Namen vergeben).

## Folgen
Der Inhaltsstrang liefert die vier Seiten; sie erscheinen ohne Codeänderung, sobald sie veröffentlicht sind. Etappe 4 wendet die Lizenzregel auf Sammlung und Katalog an. Die Schnappschüsse `schnappschuss:termine` und `schnappschuss:beitraege` bleiben Rückfall und werden vor Vorführungen erneuert. Die Quellen und Abfragen stehen in [docs/daten.md](../daten.md).
