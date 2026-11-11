# ADR-0012: Ökosystem als Blume mit Kelch

## Status
Entwurf · 11.11.2026 · ersetzt die Darstellung der Ökosystem-Ansicht aus [ADR-0009](0009-beziehungsgefuege-mitmachen-anmeldung.md), das Beziehungsgefüge selbst bleibt; die Entscheidung fällt im Maintainer-Treffen

## Kontext
Die Ökosystem-Ansicht zeigte vier Reihen: Menschen, Termine, Communities, Materialien. Wer eine Karte wählte, sah in den anderen Reihen das Verbundene. Das war richtig gerechnet, aber schwer zu lesen: Die Reihen stehen untereinander, drei davon liegen meist außerhalb des Bildschirms, und was sich nach einer Wahl ändert, sieht man nur beim Scrollen.

Aus dem Maintainer-Kreis kam ein Gegenentwurf als eigenständige Seite mit einem festen Datenstand: die Blume als Bild der Verbundenheit. Das gewählte Objekt liegt im Kelch, die Blätter ringsum zeigen, womit es verbunden ist. Der Entwurf war ausdrücklich als andere Darstellung derselben Ansicht gedacht, nicht als Startseite und nicht als Menü.

Das trifft auch die Kritik an der Blume als Menüführung: Als Beziehungsbild leistet die Form etwas, das eine Liste nicht leistet.

## Entscheidung

1. **Kelch und fünf Blätter.** In der Mitte liegt der gewählte Eintrag. Vier Blätter tragen Menschen, Communities, Materialien und Termine, in Lage und Farbe wie im Logo. Das obere Blatt sucht über alle vier.
2. **Ein Blick statt vier Reihen.** Nach einer Wahl zeigen die drei fremden Blätter die direkten Nachbarn. Das Blatt des eigenen Typs zeigt erst direkt Verbundene, dann ähnlich Verbundene, also Einträge mit gemeinsamen Nachbarn, mit der Zahl des Gemeinsamen.
3. **Gehandelt wird im Kelch.** Folgen, Beitreten, Zusagen, Vielleicht und Gefällt mir stehen am gewählten Eintrag, dazu der Weg zur Detailseite. Ohne Anmeldung mit Schlüssel sind die Knöpfe grau und sagen, was fehlt. Die Regeln des Schreibens bleiben die aus ADR-0009.
4. **Die Wahl wandert sichtbar.** Der angetippte Eintrag bewegt sich in den Kelch, die Blätter blenden nach. Wer Bewegung im System abgestellt hat, sieht den Wechsel ohne Bewegung.
5. **Weg.** Die letzten sieben Stationen stehen als Kette über der Blume. Ein Schritt zurück ist ein Klick, die Wahl steht weiter in der Adresse (`#oekosystem?wahl=<id>`).
6. **Daten bleiben live.** Die Blume liest dasselbe Gefüge wie vorher, mit denselben Sichtbarkeitsregeln, demselben Rückfall auf den Schnappschuss und dem Zuschnitt auf eine Community. Der feste Datenstand des Entwurfs wird nicht übernommen.
7. **Schmale Schirme.** Unter 760 Pixeln stehen Suche, Kelch und Blätter untereinander. Nach einer Wahl rückt der Kelch in den Blick.
8. **Mehr als ins Blatt passt.** Ein Blatt zeigt höchstens 60 Zeilen. „Alle ›“ öffnet die ganze Liste mit eigenem Filter.

## Folgen
- Die Reihenfolge der Reihen (`reihen=` in der Adresse), die Tauschknöpfe und die Filterfelder je Reihe entfallen. Alte Adressen mit `reihen=` öffnen die Blume und ignorieren den Wert.
- Die Blume der Ökosystem-Ansicht und die Blume der Konsole haben verschiedene Mitten: hier ein Eintrag, dort „Ich möchte“ ([ADR-0011](0011-matrix-dinge-und-aktionsformen.md)). Das ist gewollt, die eine zeigt Beziehungen, die andere führt ins Tun.
- Einträge ohne Verbindung erscheinen ohne Auswahl in ihrem Blatt und in der Suche, nach einer Wahl aber in keinem Blatt.

## Offen
1. **Die vier Zeichen im Kelch.** Der Kelch trägt jetzt die gebauten Handlungen als Knöpfe. Die Zeichenreihe aus ADR-0011 (Auge, Pfeil, Stift, Sprechblase) könnte sie ordnen.
2. **Das Ich im Kelch.** Wer angemeldet ist, könnte beim Öffnen selbst im Kelch liegen. Das wäre „vier plus ich“ als Bild.
3. **Platz im Kelch.** Lange Titel und zwei Knöpfe füllen den Kreis fast ganz. Mehr Handlungen brauchen eine andere Form, zum Beispiel ein Menü am Kelch.
4. **Schmale Schirme.** Die Blumenform geht dort verloren. Ob eine verkleinerte Blume besser trägt als die Liste, ist nicht geprüft.
5. **Institutionen** haben weiter keinen eigenen Ort.
