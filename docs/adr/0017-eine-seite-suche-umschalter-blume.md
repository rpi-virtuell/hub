# ADR-0017: Eine Seite mit Suche, Umschalter und Blume

## Status
Entwurf · 25.11.2026 · folgt auf den Entwurfsvergleich (ADR-0016) nach dem Treffen mit der UX-Beratung

## Kontext
Der Entwurfsvergleich hat fünf Fassungen nebeneinandergestellt. Nach dem Treffen mit der UX-Beratung soll wieder eine Seite stehen, die das Beste aus allen Fassungen verbindet:

- Der Claim kostet oben zu viel Platz.
- Die Suche ist der häufigste Einstieg und gehört ganz nach oben.
- Die große Blume des Ökosystems ist die stärkste Idee, aber nicht die erste Seite für Neue. Sie soll erscheinen, wenn jemand sucht.
- Manche denken von den Dingen her, andere vom Tun. Beides soll möglich sein, als Umschalter und nicht als zwei Knöpfe.
- Die Mitte der Blume führt zur Anmeldung.
- Ohne Anmeldung zeigt die Blume wenig. Was nur angemeldet geht, kommt erst danach dazu.
- Jede Inhaltsart braucht eine eindeutige Farbe, die überall wiederkehrt.

## Entscheidung
1. **Eine Seite.** Reiterzeile, Seitenleiste und die fünf Versionen entfallen. Die Adresse mit `?v=` hat keine Wirkung mehr.
2. **Kein Claim.** Die Überschrift bleibt für Vorleseprogramme erhalten und ist nicht mehr sichtbar.
3. **Suchschlitz ganz oben.** Ausgegraut stehen Beispiele, die die Breite zeigen und zur Jahreszeit passen, zurzeit „Advent, Frieden, relilab“. Sobald zwei Zeichen getippt sind, geht unter dem Suchschlitz die Blume des Ökosystems auf. Jedes Blatt zeigt seine Treffer: Menschen, Communities, Materialien, Termine. Der Suchschlitz bleibt das Eingabefeld. Leeren, Escape oder „Schließen“ führen zurück. Ohne Eingabe bleibt das Ökosystem zu.
4. **Umschalter über der Blume.** „Ich denke von den Dingen her“ oder „vom Tun her“, als ein Schalter mit zwei Seiten. Die Wahl bleibt im Browser gespeichert.
5. **Von den Dingen her.** Fünf Blätter: Material, Termine, News, Gespräche, Menschen. Die Inhalte kommen aus dem Entwurf „rein und raus“: je finden und veröffentlichen, bei Menschen Personen und Communities.
6. **Vom Tun her.** Die Blätter sind die Wege des bisherigen Stands: finden, teilen, erstellen, bearbeiten. Dazu kommt mitreden. Die Knospen sind die Dinge und tragen deren Farbe.
7. **Mitte.** Ohne Anmeldung steht „ReliHub“ und klein „anmelden“ in der Mitte, der Klick öffnet die Anmeldung. Angemeldet steht dort „Mein ReliHub“, der Klick führt zum eigenen Profil. Ein eigenes Blatt für „ich“ entfällt.
8. **Zwei Stufen.** Die Blume zeigt ohne Anmeldung schon alles. Was erst angemeldet geht, ist ausgegraut und trägt das Wort „anmelden“: veröffentlichen, erstellen, sammeln, teilen, bearbeiten. Ein Klick darauf öffnet die Anmeldung. Angemeldet tragen die Knospen ihre Farbe.
9. **Gespräche.** Das fünfte Blatt zeigt, was besprochen wird: Nachrichten, Reaktionen, Kommentare, Antworten, Erwähnungen und Zusagen. Öffentliches ist für alle da. Angemeldet kommen die Gespräche aus den eigenen Communities und zu den eigenen Dingen dazu. Der Chat aus den edufeed-Räumen ist gewollt und noch nicht gebaut.
10. **Eine Farbe je Inhaltsart.** Material grün, Termine orange-gelb, News violett, Gespräche rot, Menschen und Communities pink. Blau steht für das Tun und für das Eigene. Die Farben gelten in beiden Sichten und im Ökosystem. Die Vertauschung von News und Menschen aus dem Entwurf „rein und raus“ entfällt.
11. **Direkt statt Erklärkarte.** Jeder Klick führt ohne Zwischenschritt zum Ziel. Ein Satz unter der Blume sagt, was das Blatt tut.
12. **Vier Antworten.** Was du hier findest, was du hier tun kannst, warum offen, was wir dir bieten: Sie stehen jetzt unter der Blume.
13. **Communities.** Die einstellbare Blume aus ADR-0016 bleibt, am Beispiel relilab: unten rechts, fünf Blätter mit Verb, Mitte als Anmeldung. Dazu kommen aus dem Entwurf „rein und raus“ die gefilterten Ansichten mit Hinweiszeile und Unternavigation. Die Redaktion der Community entscheidet weiter, was in ihrem Pool erscheint.

## Fortschreibung nach dem Abgleich mit dem Treffen (25.11.2026)
Die Punkte 5, 8 und 10 sind damit geändert, Punkt 13 ergänzt.

- **Von den Dingen her reduziert.** Ein Klick auf Material, Termine, News oder Gespräche führt direkt zur Seite. Was man dort tun kann, steht auf der Seite als Knopfzeile in der Farbe des Dings: veröffentlichen, erstellen, sammeln. Nur Menschen trägt zwei Knospen, Personen und Communities. Vom Tun her bleibt ausdifferenziert, dort sind die Knospen ohne Anmeldung grau.
- **Erläuterung am Blatt.** Der Satz zum Blatt steht auf breiten Schirmen rechts neben der Blume, mit einem Rand in der Farbe des Blatts. Auf schmalen Schirmen steht er darunter.
- **Blüten am linken Rand.** Am linken Rand ragen sechs Blütenblätter ein Stück herein. Beim Überfahren, Antippen oder mit der Tastatur blättern sie auf: oben der Weg zum Start, dann die Dinge, die Anmeldung und die Orte. Sie ersetzen die schwarze Leiste und die kleine Blume unten rechts. Bei jedem Ort steht, was er ist: Ort, Community, Werkzeug oder Projekt. In einer Community zeigen die Blüten deren eigene Wörter.
- **Farben aus dem Erscheinungsbild des Instituts.** Material grün `#85992C`, Termine gelb `#DAB000`, Menschen und Communities rot `#AF4112`, die Mitte blau `#2A3B8E`. Gespräche und News tragen zwei Töne aus der Palette von rpi-virtuell: Gespräche violett `#B549F0`, News orange-rot `#F1693E`. Das Orange der ersten Fassung lag zu nah am Gelb der Termine. Die Farben gelten für Blume, Blüten am Rand und Ökosystem. Die Nachbau-Ansichten behalten vorerst ihre Farben.
- **Flowi.** Unten rechts sitzt eine Chat-Blume als Hilfe. Im Entwurf antwortet sie nach Stichwort mit festen Sätzen und Links, ohne Sprachmodell, und sendet nichts. Sie sagt das selbst.
- **reliGLOBAL als zweites Beispiel.** Neben relilab steht reliGLOBAL: eine Community mit einem Schaufenster. Die Blüten heißen dort „Material zum Globalen Lernen finden“ und „Werkstätten finden“ und führen in den Raum der Community.
- **In Entwicklung.** Über Ansichten, hinter denen noch keine eigene Entwicklung steht, liegt quer der Schriftzug „In Entwicklung“ und oben ein Band: Materialpool, Sammlung, relidesk, rpi-virtuell, Eigene Instanz, die Räume der übrigen Communities und das Beispielprofil ohne Anmeldung.

- **Große Blume wie die kleine.** Das Ökosystem ordnet seine Blätter wie die Blume der Startseite: Material oben, rechts Termine, links Menschen, darunter Communities. Die Suche liegt unten rechts. Auf schmalen Schirmen kommt Material zuerst.
- **Vorschau um die Erläuterung.** Unter dem Satz zum Blatt stehen drei echte, aktuelle Einträge als Kreise mit einem Ring in der Farbe des Dings: die nächsten Termine mit Datum, neues Material, Menschen, Communities und die neuesten Artikel. Ein Klick führt zum Eintrag. Für Gespräche gibt es noch keine Vorschau.

- **Orte tragen keine Inhaltsfarbe.** Farben gehören den Inhaltsarten. Ein Ort ist selten nur eines: relilab ist Community und Labor und bringt Termine, Material und Menschen. Deshalb steht auf der Kachel in Worten, was der Ort ist, auch mehreres. Darunter zeigen Punkte in den Farben der Inhaltsarten, was er beiträgt. Der Kreis mit dem Kürzel ist neutral. Die Zuordnung ist vorläufig und von den Orten zu bestätigen.

- **Wege als Blau-Treppe.** Vom Tun her tragen die vier Wege Blau in klaren Stufen von dunkel nach hell: finden, teilen, erstellen, bearbeiten. Blau bleibt die Farbe des Tuns, die Inhaltsfarben bleiben den Dingen vorbehalten.
- **Anmelden ohne Fachwörter.** Der Dialog nennt zwei Wege: „Ich habe schon ein Konto“ und „Ich bin neu hier“. Schlüssel, Erweiterung und das Ansehen mit öffentlichem Schlüssel stehen aufklappbar unter „Wie funktioniert das genau?“. Der Ablauf dahinter ist unverändert und bleibt die eigentliche Hürde: Wer neu ist, braucht weiter ein Konto bei edufeed und eine Erweiterung im Browser.

- **Gespräche sind ein Feed.** Die Ansicht hinter dem Blatt heißt „Gespräche“ und zeigt zuerst den Feed: Beiträge, Kommentare und Materialtipps aus den Communities. Wer wo zusagt und wer worauf reagiert, steht nicht mehr ungefragt darin, es lässt sich zuschalten. Angemeldet lässt sich der Feed auf die Menschen eingrenzen, denen man folgt. Das Wort „Protokoll“ entfällt. Offen: der Feed nach eigenen Themen und aus den eigenen Communities in einem Schritt.

## Technik
- Vier Belegungen der Steuerkonsole: `eins-dinge-gast`, `eins-dinge-ich`, `eins-tun-gast`, `eins-tun-ich`. Welche gilt, folgt aus Sicht und Anmeldung.
- Neues Attribut `mitte-knopf`: Die Mitte ist klickbar, auch ohne Unterzeile.
- Das Ökosystem bleibt eine eigene Ansicht. Beim Tippen legt es sich als Schicht unter den Suchschlitz. Das Suchwort filtert ohne Auswahl jedes Blatt nach dem Namen.

## Folgen
- Die Erklärkarte und der Tutorialmodus sind nicht mehr sichtbar, ihr Code steht noch in der Seite.
- Die Themen der Startseite lassen sich nicht mehr eingeben, das Feld ist jetzt die Suche.
- Der Stiel mit den Orten entfällt auf der Startseite. Die Orte stehen in der Leiste.

## Offen
- Die Suche findet nur über Namen und Titel, nicht über Schlagworte oder Beschreibungen.
- Das Orange-Rot der News und das Rot der Menschen sind verwandt. Ob das trägt, zeigt der Test. Grün, Gelb, Violett und Orange-Rot tragen dunkle Schrift, damit der Kontrast reicht.
- Flowi braucht eine Entscheidung, woher die Antworten später kommen.
- Im relilab tragen je zwei Blätter dieselbe Farbe, weil zwei Blätter zum selben Ding gehören.
- „News“ in der Blume und „Artikel“ in den Ansichten meinen dasselbe. Ein Wort für beides steht aus.
- Die Platzhalter im Suchschlitz sind fest eingetragen und wechseln noch nicht mit dem Jahr.
- Nach der Anmeldung öffnet sich das Formular nicht von selbst.
- „Meine Communities“ und „zu meinen Dingen“ im Blatt Gespräche führen noch auf die allgemeine Ansicht und auf das Profil. Eine eigene gefilterte Ansicht fehlt.
- Der Chat aus den edufeed-Räumen braucht einen eigenen Zugang zu den Räumen und eine Entscheidung, was davon öffentlich sichtbar sein darf.
- Der Code der Erklärkarte und der alten Sichten kann entfernt werden, sobald die Fassung bestätigt ist.
