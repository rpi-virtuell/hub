# ADR-0011: Matrix aus Dingen und Aktionsformen

## Status
Entwurf · 11.11.2026 · baut auf [ADR-0010](0010-vier-plus-ich.md) auf; die Entscheidung fällt im Maintainer-Treffen, offene Punkte stehen unter „Offen“

## Kontext
Zwei Entwürfe standen nebeneinander. Der eine ordnet nach Dingen: Menschen, Communities, Materialien, Termine, dazu „ich“. Der andere ordnet nach Aktionsformen und stellt „Ich möchte“ in die Mitte: sehen, zeigen, erarbeiten, in Kontakt treten.

Für die Dinge spricht, dass Menschen mit einem Gegenstand im Kopf kommen und sich daran orientieren. Für die Aktionsformen spricht, dass sie sichtbar machen, worum es dem Hub geht: nicht um Menge, sondern darum, dass Material durch Beteiligung besser wird. Wer nur nach Aktionsformen ordnet, muss aber scharfe Grenzen ziehen und schließt dabei aus. Eine Terminzusage ist Kontakt, ein Profil ist Zeigen, ein remixbares Material ist Erarbeiten.

Beide Ordnungen beschreiben dieselbe Matrix, nur mit vertauschten Achsen.

## Entscheidung
1. **Drei Ebenen.** Die Aktionsform leitet: sehen, zeigen, erarbeiten, in Kontakt treten. Die Knospe benennt konkret mit Verb und Ding. Unter jeder Knospe liegen zwei bis vier Handlungen, von niedrigschwellig nach verbindlich geordnet.
2. **Die Blätter sind die vier Dinge, die Knospen die vier Aktionsformen.** Jedes Blatt trägt vier Knospen in fester Reihenfolge. In der Mitte der Blume steht „Ich möchte“. Mit Blatt und Knospe ergibt sich ein Satz: Ich möchte Materialien suchen.
3. **Ein Zeichen je Aktionsform, überall gleich.** Auge für sehen, Pfeil nach oben für zeigen, Stift für erarbeiten, Sprechblase für Kontakt. Farben bleiben den Blättern und den Graustufen vorbehalten.
4. **Die Belegung.** Hellgrau heißt gewollt und noch nicht gebaut, dunkelgrau heißt später gedacht.

   | Ich möchte … | sehen | zeigen | erarbeiten | in Kontakt treten |
   |---|---|---|---|---|
   | Menschen | Menschen entdecken | mich vorstellen | zusammenarbeiten (hellgrau) | Menschen folgen |
   | Communities | Communities entdecken | Community vorstellen (hellgrau) | Community aufbauen | mitmachen |
   | Materialien | Materialien suchen | Material teilen | Material weiterentwickeln | Rückmeldung geben |
   | Termine | Termine finden | Termin ankündigen | Termin vorbereiten (hellgrau) | teilnehmen |

5. **Die Handlungen je Knospe** stehen als Knöpfe in der Erklärkarte. Beispiele: Unter „Rückmeldung geben“ liegen Gefällt mir, Kommentieren und Autor:in folgen. Unter „Material weiterentwickeln“ liegen die Sammlung und, dunkelgrau, das Bearbeiten und Remixen. Unter „Community aufbauen“ liegen der Zuschnitt, das Gründen bei edufeed und, hellgrau, das Auswählen von Inhalten.
6. **Regeln für Zweifelsfälle.** Merken gehört zu sehen. In eine Community teilen gehört zu zeigen. Eine Sammlung gehört zu erarbeiten, weil daraus etwas Neues entsteht. Kontakt ist eine Leiter: reagieren, kommentieren, sich verbinden.
7. **Die Spalte „sehen“ gilt für alle vier Dinge und bleibt ohne Anmeldung.** Wer nur schauen will, kann dabei bleiben. Menschen und Communities sind trotzdem sichtbar, weil das Entdecken zum Hub gehört.
8. **Die Matrix ist umkehrbar.** Ein Umschalter auf der Startseite zeigt sie von den Aktionsformen her: Dann sind sehen, zeigen, erarbeiten und Kontakt die Blätter, und die vier Dinge sind die Knospen in der Farbe ihres Dings. Kennungen, Ziele und Karten bleiben dieselben. Die Wahl bleibt im Browser (`relihub-sicht`) und gilt für alle Konsolen der Seite.
9. **Die Knospe „Beiträge“ entfällt.** Beiträge lesen hängt an „Materialien suchen“, einen Beitrag schreiben an „Material teilen“.
10. **„ich“ steht außerhalb der Matrix.** Das obere Blatt trägt Profil, Themen und Überblick, in beiden Sichten.
11. **Schnittstelle.** `relihub-action` trägt im Detail `form` und `sicht`. Das Attribut `sicht="formen"` schaltet die Konsole um. `RelihubSteuerkonsole.formen` listet die Formen. Die Konsole trägt Version 0.10.0.

## Folgen
- Sechzehn Knospen statt elf. Auf kleinen Schirmen tragen die Knospen nur das Verb, in der Sicht von den Aktionsformen nur das Ding.
- Neue Kennungen: `menschen.zusammen`, `menschen.folgen`, `communities.vorstellen`, `communities.aufbauen`, `material.rueckmeldung`, `termine.vorbereiten`, `termine.teilnehmen`. `material.beitraege`, `communities.gruenden` entfallen ohne Alias.
- Die Knospen der Spalte Kontakt führen zu den Ansichten, in denen diese Handlungen schon gebaut sind: Personen, Ökosystem, Kalender, Raum Mitmachen.
- Screenreader hören zur Knospe die Aktionsform.
- Die Blätter der zweiten Sicht haben eigene Blautöne. Sie sind ein erster Vorschlag.

## Offen
- Die vier Zeichen am einzelnen Eintrag: Jede Material- und Terminkachel könnte dieselbe kleine Reihe tragen, denn gehandelt wird am Eintrag. Noch nicht gebaut.
- Welche Sicht ist die Voreinstellung? Ein Erstklick-Test mit wenigen Personen und beiden Sichten würde es klären.
- Die Leiste als dritte Achse: Sie zeigt Orte. Aus Ding und Aktion wird mit ihr die Frage, wo ich suche und wohin ich teile.
- Farben und Formensprache der Blätter in der Sicht von den Aktionsformen.
- Institutionen haben in der Matrix noch keinen Ort.
