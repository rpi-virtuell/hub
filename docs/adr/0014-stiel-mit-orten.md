# ADR-0014: Stiel mit den Orten

## Status
Entwurf · 24.11.2026 · ergänzt [ADR-0013](0013-mitte-plus-vier.md); der Gedanke kommt aus dem Maintainer-Kreis als eigenständiger Prototyp; die Entscheidung fällt im Maintainer-Treffen

## Kontext
ADR-0013 ließ offen, wie die Orte zur Blume kommen. Bisher stehen sie in der Leiste unten links, einem eigenen Widget neben der Konsole. Zwei Widgets für eine zusammenhängende Frage machen die Bedienung unklar: Die Blume sagt, was ich hier finde, die Leiste sagt, wohin ich gehen kann.

Ein Prototyp aus dem Maintainer-Kreis zeigt eine andere Form: Unter der Blume wächst ein Stiel, daran hängen die Orte als kleine Blätter. Die Blume wandert mit dem Stiel auf jede Instanz. Auf einer Instanz zeigen die Blätter der Blume nur, was zu dieser Instanz gehört, und eine Hinweiszeile sagt das in einem Satz.

## Entscheidung
1. **Die Orte hängen am Stiel der Blume.** Der Stiel zeigt dieselben Einträge wie die Leiste. Der Ort, an dem ich bin, ist markiert.
2. **Mitte und Stiel gehören zusammen.** Die Mitte sagt, wo ich bin. Der Stiel sagt, wohin ich gehen kann. Die Markierung am Stiel entspricht dem Namen in der Mitte.
3. **Der Stiel wandert mit.** In der schwebenden Form der Konsole ist er immer da. In der großen Form steht er nur mit dem Attribut `stiel`, auf der Startseite ist es gesetzt. `stiel="off"` blendet ihn aus.
4. **Ein Ereignis für beide.** Ein Klick auf ein Blatt am Stiel löst `relihub-leiste-select` aus, wie ein Klick in der Leiste, mit `quelle: 'stiel'` im Detail. Die Anwendung entscheidet, wohin der Ort führt.
5. **Schnittstelle.** `RelihubSteuerkonsole.setOrte(items)` setzt die Orte, `setOrt(id)` markiert den aktuellen. Die Leiste reicht ihre Einträge von selbst weiter. Der Zuschnitt ist kein Ort und bleibt in der Leiste.
6. **Erst die Orte der Leiste, dann das übrige Ökosystem.** Unter den Orten der Leiste hängen die weiteren Orte aus der Partnerliste, zum Beispiel reliGlobal oder die Konfi-Arbeit. Wer im Hub noch keine eigene Ansicht hat, ist heller gezeichnet und führt zu seiner Kachel auf der Startseite. Eine fremde Seite öffnet sich in einem neuen Fenster.
7. **Mehr Orte als Platz.** An der großen Blume sind bis zu acht Blätter sichtbar, an der schwebenden bis zu sechs. Zwei Knöpfe blättern weiter, der aktuelle Ort ist beim Öffnen im Blick.
8. **Hinweiszeile zum Filter.** In der relilab-Ansicht steht über den Bereichen Communities, Termine und Menschen ein Satz: Der Bereich kommt aus dem gemeinsamen Datenraum und ist auf relilab gefiltert.

## Folgen
- Die Leiste bleibt vorerst stehen. Stiel und Leiste zeigen dasselbe, bis entschieden ist, ob die Leiste entfällt.
- Die Startseite ist länger, weil unter der Blume Raum für den Stiel bleibt.
- Unten aufgeklappte Knospen und die oberen Blätter am Stiel liegen nah beieinander.

## Offen
1. **Entfällt die Leiste?** Der Stiel kann sie ersetzen. Das Anpassen der Orte je Person und je Community hängt heute an der Leiste.
2. **Blätter und Knospen** regelt [ADR-0015](0015-belegung-der-blume.md).
3. **Eigene Seiten je Art und Instanz.** Der Prototyp zeigt für relilab je eine gefilterte Seite für Termine, Material, News, Personen und Communities, mit einer Reihe zum Wechseln. Der Hub hat davon erst Teile.
4. **Gestaltung des Stiels.** Form und Farbe sind aus dem Prototyp übernommen und dort als vorläufig bezeichnet.
