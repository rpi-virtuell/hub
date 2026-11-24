# ADR-0016: Entwurfsvergleich in fünf Versionen und einstellbare Blume

## Status
Entwurf · 24.11.2026 · Entscheidungsgrundlage für das Treffen mit der UX-Beratung am 25.11.2026; nach der Entscheidung bleibt eine Version, die übrigen werden entfernt

## Kontext
Der Prototyp zeigte zuletzt drei Navigationen zugleich: die Blätter der Blume, den Stiel mit den Orten und die Leiste unten links. Im Projektteam wurde das als zu viel erlebt. Aus der Besprechung des Stands kamen diese Befunde:

- Vier Knospen je Blatt sind zu viele, zwei werden gut überblickt. Das Ding im Knospentext zu wiederholen ist überflüssig.
- Die Sonderfarbe für „meins“ wird nicht verstanden.
- Wer auf ein Blatt klickt, erwartet die Seite dazu und keine Erklärkarte.
- Finden und veröffentlichen je Inhaltsart ist sofort verständlich.
- Die Suche wird der häufigste Einstieg sein. Das Ökosystem gilt als stärkste Idee, aber nicht als erste Seite für Neue.
- Unten rechts erwartet man Hilfe und Gespräch, keine Steuerkonsole.
- In einer Community soll die Blume schlank sein. Was sie zeigt und wie die Blätter heißen, soll die Community bestimmen.
- Die Startseite sagt nicht, was man hier findet, was man tun kann und warum.
- Der Ort muss stehen bleiben: Ein Formular legt sich über die Seite der Community.

Über Worte allein ließ sich nicht entscheiden. Es braucht die Fassungen nebeneinander.

## Entscheidung
1. **Reiterzeile.** Oben auf jeder Seite steht eine schmale Zeile „Entwurfsvergleich“ mit fünf Reitern und einem Satz, was die gewählte Version ausmacht. Jede Version hat eine eigene Adresse (`?v=reinraus`, `?v=light`, `?v=suche`, `?v=links`), die Wahl bleibt im Browser gespeichert.
2. **Version 1, Stand heute.** Unverändert: Blume mit Umschalter, Stiel und Leiste (ADR-0013 bis ADR-0015).
3. **Version 2, rein und raus.** Vier Blätter: Menschen, Materialien, Termine, Artikel. Je Blatt zwei Knospen, finden und veröffentlichen; bei Menschen sind es Personen und Communities. Kein Umschalter, keine Leiste, keine Sonderfarbe. Der Stiel trägt die Orte. Profil und vernetzte Suche stehen als Links unter der Blume.
4. **Version 3, Light.** Eine Stufe, fünf Blätter mit Verb und Ding: Kontakt aufnehmen, Material finden, Material teilen, Termin eintragen, Termine finden. Ein Klick führt direkt hin. Die schwebende Blume sitzt oben rechts, unten rechts steht ein Hilfeknopf. Die Leiste bleibt für die Orte.
5. **Version 4, Suche zuerst.** Das Suchfeld ist der Einstieg und führt ins Ökosystem. Die Orte liegen unten als Blütenreihe: ineinandergreifende Blätter in der Farbe des Orts, der aktuelle liegt obenauf. Stiel und schwarze Leiste entfallen.
6. **Version 5, Leiste links.** Die Gegenprobe: Navigation als Liste am linken Rand, die Blume ist nur Zeichen.
7. **Drei Sätze auf der Startseite.** In den Versionen 3 bis 5 stehen unter der Überschrift drei kurze Antworten: Was du hier findest, was du hier tun kannst, warum.
8. **Direkt statt Erklärkarte.** In den Versionen 2 bis 5 führt jeder Klick ohne Zwischenschritt zum Ziel. Ein Satz unter der Blume sagt beim Überfahren, was das Blatt tut.
9. **Einstellbare Blume.** Eine Community stellt ihre Blume selbst ein. Sie wählt, welche Blätter sie zeigt, wie sie heißen und wohin sie führen. Fest bleiben:
   - Farbe und Platz je Ding,
   - höchstens fünf Blätter,
   - eine Stufe,
   - hinter jedem Blatt steht eine Inhaltsart des gemeinsamen Datenraums.
10. **Beispiel relilab.** In Version 3 zeigt der Abschnitt im relilab die Einstellung als Tabelle mit Ding, Wortlaut und Ziel. Zwei Spielarten lassen sich umschalten: fünf Verben oder geteilte Blätter mit einer Hälfte für rein und einer für raus. Zwei weitere Beispiele zeigen, wie derselbe Platz anders heißen kann, etwa „Neuerscheinungen finden“ oder „Gruppenstunde vorbereiten“.
11. **Der Ort bleibt stehen.** In Version 3 öffnet „Material teilen“ im relilab das Formular über der Seite, und „Material finden“ zeigt zuerst die Materialien des relilab.

## Technik
- Die Steuerkonsole kennt weitere Belegungen: `RelihubSteuerkonsole.registerBelegung(name, liste)`, gewählt über das Attribut `belegung`. Die Blätter verteilen sich gleichmäßig, drei bis fünf sind erprobt. Ein Blatt ohne Knospen trägt `aktion` und führt direkt dorthin.
- Das Attribut `beschriftet` schreibt das Wort dauerhaft auf jedes Blatt. Das Attribut `oben` setzt die schwebende Blume an den oberen Rand.
- Die Leiste kennt `form="blueten"` und je Eintrag eine Farbe.
- Die Einstellung einer Community ist ein kleiner Datensatz: je Blatt Ding, Wortlaut und Ziel. Im Prototyp steht er in der Seite.

## Folgen
- Der Vergleich macht die Seite größer. Nach der Entscheidung werden die nicht gewählten Versionen und die Reiterzeile entfernt.
- Die Kennungen der Aktionen bleiben gleich. Alle Versionen nutzen dieselben Ziele wie bisher.
- Wo eine Community ihre Einstellung später pflegt und wer sie ändern darf, ist offen.

## Offen
- Die dritte Spielart, eine Blume, die nach dem Anmelden Blätter dazubekommt, ist beschrieben, aber nicht gebaut.
- In der geteilten Spielart liegt die Mitte nah an der oberen Hälfte.
- Die schwebende Blume oben rechts kann auf einzelnen Seiten Kopfzeilen berühren.
- Version 5 hat auf schmalen Schirmen nur einen waagrechten Streifen.
- Ob Hilfe unten rechts später ein Gespräch oder ein Assistent wird, ist nicht entschieden.
