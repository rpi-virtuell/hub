# ADR-0011: Matrix aus Dingen und Aktionsformen

## Status
Entwurf · 11.11.2026 · baut auf [ADR-0010](0010-vier-plus-ich.md) auf; die Entscheidung fällt im Maintainer-Treffen, offene Punkte stehen unter „Offen“

## Kontext
Zwei Entwürfe standen nebeneinander. Der eine ordnet nach Dingen: Menschen, Communities, Materialien, Termine, dazu „ich“. Der andere ordnet nach Aktionsformen und stellt „Ich möchte“ in die Mitte: sehen, zeigen, erarbeiten, in Kontakt treten.

Für die Dinge spricht, dass Menschen mit einem Gegenstand im Kopf kommen und sich daran orientieren. Für die Aktionsformen spricht, dass sie sichtbar machen, worum es dem Hub geht: nicht um Menge, sondern darum, dass Material durch Beteiligung besser wird. Wer nur nach Aktionsformen ordnet, muss aber scharfe Grenzen ziehen und schließt dabei aus. Eine Terminzusage ist Kontakt, ein Profil ist Zeigen, ein remixbares Material ist Erarbeiten.

Beide Ordnungen beschreiben dieselbe Matrix, nur mit vertauschten Achsen.

## Entscheidung
1. **Die Blätter sind die vier Dinge, die Knospen sind die vier Aktionsformen.** Jedes Blatt trägt vier Knospen in fester Reihenfolge: sehen, zeigen, erarbeiten, in Kontakt treten. Zusammen mit der Mitte ergibt sich ein Satz: Ich möchte Material finden.
2. **Das Zeichen zeigt die Form, das Wort bleibt konkret.** In jeder Knospe steht ein Zeichen für die Aktionsform: Auge, Pfeil nach oben, Stift, Sprechblase. Die Beschriftung nennt die konkrete Handlung, etwa „finden“, „teilen“, „bearbeiten“, „kommentieren“. Farben bleiben den Blättern und den Graustufen vorbehalten.
3. **Die Belegung.**

   | Ich möchte … | sehen | zeigen | erarbeiten | in Kontakt treten |
   |---|---|---|---|---|
   | Menschen | finden | mich zeigen | Profil pflegen | folgen |
   | Communities | finden | empfehlen (hellgrau) | gründen (hellgrau) | mitmachen |
   | Materialien | finden | teilen | bearbeiten (dunkelgrau) | kommentieren |
   | Termine | finden | eintragen | planen (hellgrau) | zusagen |

4. **Die Knospe „Beiträge“ entfällt.** Beiträge lesen hängt an „Material finden“, einen Beitrag schreiben an „Material teilen“.
5. **Die Spalte „sehen“ gilt für alle vier Dinge und bleibt ohne Anmeldung.** Wer nur schauen will, kann dabei bleiben. Menschen und Communities sind trotzdem sichtbar, weil das Entdecken zum Hub gehört.
6. **Graustufen folgen der Matrix.** Grau ist, was in der Matrix steht und noch nicht gebaut ist.
7. **„ich“ steht außerhalb der Matrix.** Das obere Blatt trägt Profil, Themen und Überblick.
8. **Das Ereignis nennt die Form.** `relihub-action` trägt im Detail `form` mit `sehen`, `zeigen`, `erarbeiten` oder `kontakt`. `RelihubSteuerkonsole.formen` listet die Formen. Die Konsole trägt Version 0.9.0.

## Folgen
- Sechzehn Knospen statt elf. Auf kleinen Schirmen stehen vier Knospen eng, die Beschriftung rückt bei Bedarf nach innen.
- Neue Kennungen: `menschen.pflegen`, `menschen.folgen`, `communities.empfehlen`, `material.kommentieren`, `termine.planen`, `termine.zusagen`. `material.beitraege` entfällt ohne Alias.
- Folgen, zusagen und kommentieren führen zu den Ansichten, in denen diese Handlungen schon gebaut sind: Personen, Kalender, Raum Mitmachen.
- Screenreader hören zur Knospe die Aktionsform, wenn sie vom Wort abweicht.

## Offen
- Sollen die Knospen einheitlich „sehen, zeigen, erarbeiten, in Kontakt treten“ heißen, oder bleibt das konkrete Wort?
- „Mich zeigen“ und „Profil pflegen“ führen heute an denselben Ort. Trägt die Unterscheidung, oder gehört in die Zelle etwas anderes, etwa gemeinsam arbeiten?
- Ein Umschalter, der dieselbe Matrix von den Aktionsformen her zeigt: bauen oder nicht?
- „Ich möchte“ als Schrift in der Mitte der Blume.
- Die Leiste als dritte Achse: Sie zeigt Orte. Aus Ding und Aktion wird mit ihr die Frage, wo ich finde und wohin ich teile.
- Die Annahme, dass Nutzende vom Ding her denken, ist nicht geprüft. Ein Erstklick-Test mit wenigen Personen würde sie klären.
- Institutionen haben in der Matrix noch keinen Ort.
