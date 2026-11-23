# ADR-0013: Mitte plus vier, mit dem Ort in der Mitte

## Status
Entwurf · 23.11.2026 · baut auf [ADR-0010](0010-vier-plus-ich.md), [ADR-0011](0011-matrix-dinge-und-aktionsformen.md) und [ADR-0012](0012-oekosystem-als-blume.md) auf; erstes Beispiel ist relilab; die Entscheidung fällt im Maintainer-Treffen

## Kontext
Der Hub hat drei Instrumente, die sich überschneiden. Die Blume der Konsole fragt, was ich tun möchte. Ihr Umschalter stellt dieselbe Frage noch einmal, andersherum sortiert. Die Leiste fragt, wo ich bin. Die Blume im Ökosystem fragt, womit etwas verbunden ist. Kein Instrument hat eine Frage für sich allein, und zwei sehen gleich aus. Daraus entsteht keine erkennbare Linie.

Zugleich fehlt ein Zeichen, das mitwandert. Instanzen wie relilab oder der Materialpool sollen eigenständig bleiben und trotzdem als Teil des Hubs erkennbar sein. Dasselbe gilt für die Darstellung einer Community.

## Entscheidung
1. **Eine Grammatik.** In der Mitte steht der Ort oder die Sache, um die es gerade geht. Oben stehe ich. Ringsum stehen immer dieselben vier Dinge: Menschen, Communities, Materialien, Termine.

   | Wo | Mitte | Oben | Ringsum |
   |---|---|---|---|
   | Startseite | ReliHub | ich | die vier Dinge |
   | Instanz | Name der Instanz | ich | die vier Dinge dieser Instanz |
   | Community | Name der Community | ich | die vier Dinge dieser Community |
   | Ökosystem | gewählter Eintrag | ich | das Verbundene |

2. **Die Mitte kommt aus dem Kontext.** Ein Kontextprofil der Konsole trägt `mitte: { label, kurz, color }`. Das Attribut `mitte` am Element setzt den Namen direkt. Ohne beides bleibt „Ich möchte“ stehen.
3. **Das mitwandernde Zeichen ist die Blume mit dem Ort in der Mitte.** Der schwebende Knopf der Konsole zeigt die fünf Blätter in den Farben des Hubs und in der Mitte Farbe und Kürzel der Instanz. Das sagt ohne Worte: eigener Ort, Teil des Hubs.
4. **Die Instanz bleibt eigenständig.** Ihr gehören Inhalt, Layout, Farben und eigene Navigation. Dem Hub gehören das Zeichen, das Instrument dahinter und die gemeinsame Sprache aus vier Dingen und vier Aktionsformen.
5. **Die Aktionsformen bleiben die zweite Ebene.** Sehen, zeigen, erarbeiten und in Kontakt treten sind die Knospen an jedem Blatt. In der Sicht von den Aktionsformen bleibt „Ich möchte“ in der Mitte, weil dort die Mitte den Satzanfang trägt.
6. **Erstes Beispiel relilab.** Die Ansicht trägt einen gekennzeichneten Abschnitt mit der Blume und relilab in der Mitte. Der schwebende Knopf zeigt das Zeichen mit „rl“. Die Blätter führen zu den Menschen, Communities, Materialien und Terminen von relilab, soweit sie gebaut sind.

## Folgen
- Auf der Startseite steht in der Mitte „ReliHub“ statt „Ich möchte“. Damit entfällt der Bruch „Ich möchte ich“ in der Sicht von den Dingen her.
- Der Satz „Ich möchte Materialien suchen“ entsteht in dieser Sicht nicht mehr aus der Mitte. Er steht weiter in der Erklärkarte.
- Die Überschrift des aufgeklappten Knopfs nennt den Ort: „relilab · vier plus ich“.
- Screenreader hören am Knopf den Ort.
- Andere Instanzen tragen das Zeichen erst, wenn ihr Kontext eine Mitte bekommt. Das ist je Instanz eine Zeile.

## Offen
1. **Der Umschalter.** Wenn die Mitte den Ort trägt, ist die Sicht von den Aktionsformen ein Sonderfall. Ob sie als Einstieg bleibt, als Einstellung wandert oder entfällt, ist nicht entschieden.
2. **Die Leiste als Wechsel der Mitte.** Sie zeigt die Orte, die in die Mitte treten können. Dann wäre sie kein zweites Widget mehr, sondern die Ortswahl der Blume. Nicht gebaut.
3. **Das Blatt „ich“ je Ort.** Bei einer Instanz könnte es mein Verhältnis zu ihr zeigen: bin ich dabei, was habe ich beigetragen. Heute führt es überall zu Profil, Themen und Überblick.
4. **Zeichen für die übrigen Instanzen** und für Communities, mit Farbe und Kürzel.
5. **Wo die Regel nicht trägt.** Ein einzelnes Material oder ein Termin als Mitte gibt es nur im Ökosystem. Für Detailseiten ist nichts festgelegt.
6. **Verhältnis zur Kritik an der Blume als Menü.** Dieser Entwurf setzt stärker auf die Blume. Ob das die Kritik auflöst oder verschärft, zeigt erst ein Test mit Menschen, die den Hub nicht kennen.
