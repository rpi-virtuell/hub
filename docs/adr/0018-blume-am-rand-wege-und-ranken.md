# ADR-0018: Blume am Rand, Wege je Ort und Ranken zu den Nachbarn

## Status
Entwurf · 26.11.2026 · folgt auf ADR-0017 nach der Rückmeldung aus dem Projektteam und der klickbaren Skizze (`wuchsformen.html`)

## Kontext
Die Räume der Communities im Hub sahen nach dem letzten Umbau wie vollwertige Seiten aus. Aus dem Projektteam kam der Einwand, der Hub wirke so wie eine Zentrale, in die alle Gruppen umziehen sollen. Gemeint ist das Gegenteil: Der Hub ist kein Ort, er verbindet Orte über einen gemeinsamen Datenraum. Drei Prüffragen gelten seither für jede Entscheidung:

- Ermöglichen wir die eigene Identität der Beteiligten?
- Unterstützen wir schrittweises Hineinwachsen?
- Verhindern wir, dass der Hub Zentralinstanz wird?

Dazu gehört ein Stufenmodell, das jeder Ort in seinem Tempo geht: Daten teilen, das Zeichen zeigen, die Bedienung nutzen, die Nachbarn zeigen.

## Entscheidung
1. **Blume am Rand.** Die Navigation sitzt als Blume am linken Rand und schaut halb herein. Ein Klick rollt sie heraus. Sie ersetzt die Blütenleiste aus ADR-0017.
2. **Wege als Streifen.** Aus dem Rand springt je Inhaltsart ein Streifen in ihrer Farbe: Material, Termine, News, Aktivitäten, Menschen. An jedem Streifen hängen direkt zwei Wege, einer holt etwas heraus, einer gibt etwas hinein. Ein zweiter Klick ist nicht nötig. Im Hub führen die Wege auf die Seiten für Material, Termine, News, Aktivitäten, Personen und Communities.
3. **Orte als Ranken.** Unter den Streifen schauen alle Orte des Ökosystems als kurze Ranken aus dem Rand. Beim Überfahren oder Antippen wachsen sie mit ihren Namen heraus. Besuchte Orte rücken nach oben, die Reihenfolge bleibt im Browser.
4. **Der Klick auf einen Ort führt auf seine Seite.** Hat ein Ort eine eigene Seite, lädt sie in einen Rahmen unter die Navigation. Blume, Wege, Ranken und die Hilfe unten rechts bleiben stehen. Eine Zeile sagt, wo man ist, und führt in einen neuen Tab oder zu dem, was der Ort im Datenraum teilt. Orte ohne eigene Seite öffnen ihre Ansicht im Hub.
5. **Jeder Ort legt seine Wege selbst fest.** Je Weg steht in einer kleinen Tabelle, wohin er führt:
   - auf einen Navigationspunkt der eigenen Seite, zum Beispiel „Termine finden“ auf die Terminseite der Community,
   - in den ganzen Datenraum, zum Beispiel auf alle Termine im Hub,
   - in einen selbst gewählten Ausschnitt, zum Beispiel nur die Beiträge dieser Community.

   Ohne Eintrag gilt der Ausschnitt des Orts im Datenraum. So geht ein Ort die Stufen in seinem Tempo: Wer am Anfang steht, nutzt den Datenraum, wer eine ausgebaute Seite hat, bindet ihre Navigationspunkte an.
6. **Die Wörter der Community bleiben.** Wo eine Community eigene Wörter eingestellt hat (ADR-0016), stehen sie an den Wegen.
7. **Die Ansicht im Hub ist ein Feed.** Über dem Raum einer Community steht ein Hinweis: Hier läuft zusammen, was sie im Netz teilt. Redaktionell betreut, eingeordnet und im eigenen Design gibt es sie auf ihrer eigenen Seite. Der Weg dorthin steht groß daneben.

## Technik
- `STREIFEN` beschreibt die fünf Inhaltsarten mit ihren zwei Wegen und den Kennungen der Aktionen. Die Kennungen sind die bisherigen.
- `OEKO_ORTE` ist die Tabelle der Orte: eigene Seite (`web`), Ansicht im Hub (`hub`), Wörter (`blume`) und Ziele je Weg (`wege`). Im Prototyp steht sie in der Seite.
- `sbKontext()` sagt, wo die Navigation steht: im Hub, im Rahmen eines Orts, im relilab oder im Raum einer Community. `sbWeg()` wählt danach das Ziel.
- Die Route `#ort?o=<Kennung>` lädt die eigene Seite eines Orts in den Rahmen, mit `&w=<Weg>` einen seiner Navigationspunkte. Geladen werden nur Adressen aus der Tabelle, nie eine Adresse aus der Adresszeile. Der Rahmen darf die Adresse des Hubs nicht wechseln.

## Folgen
- Der Rahmen ist ein Mittel des Prototyps. Die Adresszeile zeigt weiter den Hub, und jeder Ort kann das Einbetten abschalten. Im Betrieb bindet jeder Ort das Element selbst ein.
- Im Raum einer Community entfallen die Blüten „Lernbausteine“ und „Einstellungen“. Die Reiter bleiben über die Adresse erreichbar.
- Die Ansicht des relilab im Hub ist über die Zeile im Rahmen, über die Orte und über die Communities erreichbar, nicht mehr über die Ranke.

## Offen
- Wo ein Ort seine Tabelle pflegt. Vorgeschlagen ist ein Eintrag unter dem Schlüssel der Community im Datenraum.
- Die Ziele der Wege sind aus den Navigationen der Seiten abgelesen und nicht mit den Communities abgestimmt.
- Das Zeichen als kleinste Stufe und das Element zum Einbinden auf fremden Seiten sind in der Skizze gezeigt, aber nicht gebaut.
- Ob die Blume in der Mitte der Startseite bleibt oder die Bedienung am Rand vorführt.
