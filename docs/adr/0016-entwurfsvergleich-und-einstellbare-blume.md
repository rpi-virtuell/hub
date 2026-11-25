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
- Wo die kleine Blume sitzt, war strittig: Die einen erwarten unten rechts Hilfe und Gespräch, die anderen dort den Zugang zum Mitgestalten. Nach Rückmeldung aus dem Projektteam bleibt sie unten rechts.
- Formulare ohne Anmeldung laden zu Spam ein und können eine Community vermüllen.
- In einer Community soll die Blume schlank sein. Was sie zeigt und wie die Blätter heißen, soll die Community bestimmen.
- Die Startseite sagt nicht, was man hier findet, was man tun kann und warum.
- Der Ort muss stehen bleiben: Ein Formular legt sich über die Seite der Community.

Über Worte allein ließ sich nicht entscheiden. Es braucht die Fassungen nebeneinander.

## Entscheidung
1. **Reiterzeile.** Oben auf jeder Seite steht eine schmale Zeile „Entwurfsvergleich“ mit fünf Reitern und einem Satz, was die gewählte Version ausmacht. Jede Version hat eine eigene Adresse (`?v=reinraus`, `?v=light`, `?v=suche`, `?v=links`), die Wahl bleibt im Browser gespeichert.
2. **Version 1, Stand heute.** Unverändert: Blume mit Umschalter, Stiel und Leiste (ADR-0013 bis ADR-0015).
3. **Version 2, rein und raus.** Streng nach dem Entwurf aus dem Maintainer-Kreis. Fünf Blätter: oben ReliHub mit „mein Profil“ und „vernetzte Suche“, dann Material, Termine und News mit je „finden“ und „veröffentlichen“, zuletzt Menschen mit Personen und Communities. Farben wie im Entwurf, also News in Pink und Menschen in Violett. Keine Schrift in der Mitte, keine dauerhafte Beschriftung, keine Wegzeichen, kein Umschalter, keine Leiste. Der Stiel trägt die Orte. Im relilab trägt die Blume dieselbe Belegung: Jede Knospe „finden“ führt auf eine Ansicht, die nur zeigt, was zu relilab gehört, mit Hinweiszeile und einer Unternavigation Termine, Material, News, Personen, Communities. „Veröffentlichen“ öffnet das Formular über der relilab-Seite. Abweichungen vom Entwurf: Auf der Startseite führt ein Klick direkt hin statt zur Erklärkarte, und die News im relilab zeigt der Artikel-Reiter des Community-Raums.
4. **Version 3, Light.** Eine Stufe, fünf Blätter mit Verb und Ding: Kontakt aufnehmen, Material finden, Material teilen, Termin eintragen, Termine finden. Ein Klick führt direkt hin. Die schwebende Blume sitzt unten rechts. Die Mitte ist ein Knopf: Unter dem Ort steht klein „anmelden“, nach der Anmeldung „mein Profil“. Finden geht ohne Anmeldung, Teilen und Eintragen fragen zuerst danach. Das Menü der Community oben bleibt ihr eigenes und dient dem Informieren. Die Leiste bleibt für die Orte.
5. **Version 4, Suche zuerst.** Das Suchfeld ist der Einstieg und führt ins Ökosystem. Die Orte liegen unten als Blütenreihe: ineinandergreifende Blätter in der Farbe des Orts, der aktuelle liegt obenauf. Stiel und schwarze Leiste entfallen.
6. **Version 5, Leiste links.** Die Gegenprobe: Navigation als Liste am linken Rand, die Blume ist nur Zeichen.
7. **Vier Antworten auf der Startseite.** In den Versionen 3 bis 5 stehen unter der Überschrift vier kurze Antworten: Was du hier findest, was du hier tun kannst, warum offen, was wir dir bieten. Das Warum spricht zuerst Lehrkräfte an: Offenes Material lässt sich an die eigene Lerngruppe anpassen. Dass Eingetragenes überall erscheint, zählt vor allem für Institute und Seitenbetreiber und steht deshalb an zweiter Stelle.
8. **Direkt statt Erklärkarte.** In den Versionen 2 bis 5 führt jeder Klick ohne Zwischenschritt zum Ziel. Ein Satz unter der Blume sagt beim Überfahren, was das Blatt tut.
9. **Einstellbare Blume.** Eine Community stellt ihre Blume selbst ein. Sie wählt, welche Blätter sie zeigt, wie sie heißen und wohin sie führen. Fest bleiben:
   - Farbe und Platz je Ding,
   - höchstens fünf Blätter,
   - eine Stufe,
   - hinter jedem Blatt steht eine Inhaltsart des gemeinsamen Datenraums.
10. **Beispiel relilab.** In Version 3 zeigt der Abschnitt im relilab die Einstellung als Tabelle mit Ding, Wortlaut und Ziel. Zwei Spielarten lassen sich umschalten: fünf Verben oder geteilte Blätter mit einer Hälfte für rein und einer für raus. Zwei weitere Beispiele zeigen, wie derselbe Platz anders heißen kann, etwa „Neuerscheinungen finden“ oder „Gruppenstunde vorbereiten“.
11. **Der Ort bleibt stehen.** In Version 3 öffnet „Material teilen“ im relilab das Formular über der Seite, und „Material finden“ zeigt zuerst die Materialien des relilab.
12. **Die Redaktion entscheidet.** Anmelden allein genügt nicht. Ob ein geteiltes Material im Pool einer Community erscheint, entscheidet ihre Redaktion. Wer nicht zur Community gehört, teilt in den Materialpool von rpi-virtuell. Die Tabelle im relilab sagt das bei „Material teilen“ und „Termin eintragen“.

## Technik
- Die Steuerkonsole kennt weitere Belegungen: `RelihubSteuerkonsole.registerBelegung(name, liste)`, gewählt über das Attribut `belegung`. Die Blätter verteilen sich gleichmäßig, drei bis fünf sind erprobt. Ein Blatt ohne Knospen trägt `aktion` und führt direkt dorthin.
- Das Attribut `beschriftet` schreibt das Wort dauerhaft auf jedes Blatt. Das Attribut `mitte-unter` macht die Mitte zum Knopf für „ich“ und schreibt klein darunter, wohin er führt.
- Die Leiste kennt `form="blueten"` und je Eintrag eine Farbe.
- Die Einstellung einer Community ist ein kleiner Datensatz: je Blatt Ding, Wortlaut und Ziel. Im Prototyp steht er in der Seite.

## Folgen
- Der Vergleich macht die Seite größer. Nach der Entscheidung werden die nicht gewählten Versionen und die Reiterzeile entfernt.
- Die Kennungen der Aktionen bleiben gleich. Alle Versionen nutzen dieselben Ziele wie bisher.
- Wo eine Community ihre Einstellung später pflegt und wer sie ändern darf, ist offen.
- Wie die Aufnahme in eine Community nach der Anmeldung abläuft, ist offen. Bisher geschieht sie in Treffen und per Mail.

## Offen
- Die dritte Spielart, eine Blume, die nach dem Anmelden Blätter dazubekommt, ist beschrieben, aber nicht gebaut.
- In der geteilten Spielart liegt die Mitte nah an der oberen Hälfte.
- Nach der Anmeldung öffnet sich das Formular nicht von selbst, der Klick auf das Blatt ist noch einmal nötig.
- Version 5 hat auf schmalen Schirmen nur einen waagrechten Streifen.
- Wo Hilfe, Gespräch oder ein Assistent ihren Platz bekommen, ist nicht entschieden. Der Hilfeknopf des ersten Entwurfs ist wieder entfernt.
