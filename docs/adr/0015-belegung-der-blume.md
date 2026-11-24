# ADR-0015: Belegung der Blume: ich, Menschen, Materialien, Termine, Beiträge

## Status
Entwurf · 24.11.2026 · ersetzt die Belegung aus [ADR-0010](0010-vier-plus-ich.md) und die Aktionsformen aus [ADR-0011](0011-matrix-dinge-und-aktionsformen.md); die Entscheidung fällt im Maintainer-Treffen

## Kontext
Die Blume hatte fünf Blätter: ich, Menschen, Communities, Materialien, Termine. Drei davon handeln von Personen. Für Beiträge und Neuigkeiten blieb kein Blatt. ADR-0011 hatte sie unter Materialien eingeordnet.

Dazu kamen an jedem Blatt vier Aktionsformen: sehen, zeigen, erarbeiten, in Kontakt treten. Die vierte führte zu Knospen wie „Rückmeldung geben“, „teilnehmen“ oder „Menschen folgen“. Das sind Handlungen an einem einzelnen Eintrag, keine Wege durch den Hub. Als Menüpunkt führten sie ins Leere.

Aus dem Maintainer-Kreis kam der Gedanke, die Blume an dem auszurichten, was im gemeinsamen Datenraum liegt: Jedes Blatt steht für eine Art von Inhalt, die Knospen sind die Wege dorthin.

## Entscheidung
1. **Fünf Blätter.** ich, Menschen, Materialien, Termine, Beiträge. Communities sind kein eigenes Blatt mehr, sie gehören zu Menschen.
2. **Die Knospen sind Wege, keine Reaktionen.**

   | Blatt | Knospen |
   |---|---|
   | ich | mein Profil, meine Communities, wem ich folge, meine Materialien, meine Termine |
   | Menschen | Personen, Communities |
   | Materialien | suchen, teilen, erstellen, bearbeiten |
   | Termine | finden, teilen, erstellen, bearbeiten |
   | Beiträge | finden, teilen, veröffentlichen |

3. **Reagieren ist kein Menüpunkt.** Folgen, Beitreten, Zusagen, Gefällt mir und Kommentieren stehen am Eintrag selbst: an der Person, an der Community, am Termin, am Material. Die Erklärkarten sagen das.
4. **Teilen und Erstellen sind zweierlei.** Teilen macht Vorhandenes sichtbar oder gibt es weiter. Erstellen bringt Neues hervor. Bei Terminen heißt es „erstellen“ statt „ankündigen“.
5. **Das Blatt „ich“ bündelt, was zu mir gehört.** Es ist kein Einstieg in die Themenwahl mehr. Die Themen stehen als Feld auf der Startseite und als Weg in der Karte.
6. **Die Sicht von den Aktionsformen ruht.** Ohne Aktionsformen an den Knospen gibt es keine zweite Sicht. Der Umschalter auf der Startseite entfällt. Der Code dafür bleibt vorerst liegen.
7. **Kennungen.** Neu: `ich.communities`, `ich.menschen`, `ich.materialien`, `ich.termine`, `menschen.personen`, `menschen.communities`, `material.erstellen`, `material.bearbeiten`, `termine.teilen`, `termine.erstellen`, `termine.bearbeiten`, `news.finden`, `news.teilen`, `news.veroeffentlichen`. Entfallen ohne Alias: alle Kennungen unter `communities.`, dazu `menschen.finden`, `menschen.zeigen`, `menschen.zusammen`, `menschen.folgen`, `material.schreibtisch`, `material.rueckmeldung`, `termine.eintragen`, `termine.vorbereiten`, `termine.teilnehmen`, `ich.interessen`, `ich.start`.

## Folgen
- „Termin bearbeiten“ ist noch nicht gebaut und trägt „bald“. „In eine Community teilen“ am Termin und am Beitrag ebenso.
- „Material erstellen“ führt zum Schreibtisch im relidesk. Der Schreibtisch ist damit ein Ziel, kein Menüpunkt.
- „Beiträge finden“ führt in den Raum Mitmachen, weil dort heute Beiträge und Kommentare zu lesen sind. Eine eigene Seite für Beiträge gibt es noch nicht.
- Das Blatt „ich“ hat fünf Knospen und ist damit das vollste.
- Kontextprofile angeschlossener Seiten, die alte Kennungen umlenken, müssen angepasst werden.

## Offen
1. **Name des fünften Blatts.** Beiträge, News oder Artikel.
2. **Farben.** Menschen trägt das bisherige Pink, Beiträge das Violett, das im Hub sonst für Communities steht. Der Prototyp aus dem Maintainer-Kreis hat es umgekehrt.
3. **Eigene Seite für Beiträge**, über alle Communities und ohne Anmeldung.
4. **„wem ich folge“** hat im Profil noch keine eigene Liste.
5. **Die Zeichen am Eintrag.** Wenn Reagieren am Eintrag steht, braucht es dort eine einheitliche Form. ADR-0011 hatte dafür vier Zeichen vorgeschlagen.
6. **Der ruhende Code der zweiten Sicht** kann entfernt werden, sobald die Belegung entschieden ist.
