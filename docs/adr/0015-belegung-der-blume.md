# ADR-0015: Belegung der Blume: ich, Menschen, Materialien, Termine, Artikel

## Status
Entwurf · 24.11.2026 · ersetzt die Belegung aus [ADR-0010](0010-vier-plus-ich.md) und die vier Aktionsformen aus [ADR-0011](0011-matrix-dinge-und-aktionsformen.md), die umkehrbare Sicht bleibt; die Entscheidung fällt im Maintainer-Treffen

## Kontext
Die Blume hatte fünf Blätter: ich, Menschen, Communities, Materialien, Termine. Drei davon handeln von Personen. Für Beiträge und Neuigkeiten blieb kein Blatt. ADR-0011 hatte sie unter Materialien eingeordnet.

Dazu kamen an jedem Blatt vier Aktionsformen: sehen, zeigen, erarbeiten, in Kontakt treten. Die vierte führte zu Knospen wie „Rückmeldung geben“, „teilnehmen“ oder „Menschen folgen“. Das sind Handlungen an einem einzelnen Eintrag, keine Wege durch den Hub. Als Menüpunkt führten sie ins Leere.

Aus dem Maintainer-Kreis kam der Gedanke, die Blume an dem auszurichten, was im gemeinsamen Datenraum liegt: Jedes Blatt steht für eine Art von Inhalt, die Knospen sind die Wege dorthin.

## Entscheidung
1. **Fünf Blätter.** ich, Menschen, Materialien, Termine, Artikel. Communities sind kein eigenes Blatt mehr, sie gehören zu Menschen. Das fünfte Blatt heißt überall „Artikel“, nicht Beiträge oder News.
2. **Die Knospen sind Wege, keine Reaktionen.**

   | Blatt | Knospen |
   |---|---|
   | ich | Personen, Materialien, Profil, Termine, Communities |
   | Menschen | Personen, Communities |
   | Materialien | suchen, teilen, erstellen, bearbeiten |
   | Termine | finden, teilen, erstellen, bearbeiten |
   | Artikel | finden, teilen, schreiben, bearbeiten |

   Das Blatt „ich“ trägt aufgeklappt das Wort „mein(e)“. Das Profil steht in der Mitte, daneben Materialien und Termine, außen Personen und Communities.

3. **Reagieren ist kein Menüpunkt.** Folgen, Beitreten, Zusagen, Gefällt mir und Kommentieren stehen am Eintrag selbst: an der Person, an der Community, am Termin, am Material. Die Erklärkarten sagen das.
4. **Teilen und Erstellen sind zweierlei.** Teilen macht Vorhandenes sichtbar oder gibt es weiter. Erstellen bringt Neues hervor. Bei Terminen heißt es „erstellen“ statt „ankündigen“.
5. **Das Blatt „ich“ bündelt, was zu mir gehört.** Es ist kein Einstieg in die Themenwahl mehr. Die Themen stehen als Feld auf der Startseite und als Weg in der Karte.
6. **Die Blume bleibt umkehrbar.** Der Umschalter „Ich denke von den Dingen her“ und „vom Tun her“ bleibt. Vom Tun her sind die vier Wege die Blätter: finden, teilen, erstellen, bearbeiten. Die Knospen sind die Dinge, die es dazu gibt, in der Farbe ihres Dings.

   | Ich möchte … | Knospen |
   |---|---|
   | finden | Personen, Communities, Materialien, Termine, Artikel |
   | teilen | Materialien, Termine, Artikel |
   | erstellen | Materialien, Termine, Artikel |
   | bearbeiten | Materialien, Termine, Artikel, mein Profil |

   Vom Tun her trägt jede Knospe nur den Namen ihres Dings. Unter „bearbeiten“ steht zuletzt, zum Blatt „ich“ hin, das eigene Profil. Es ist der Übergang von den Wegen zu mir.

   In dieser Sicht steht „Ich möchte“ in der Mitte. Das Blatt „ich“ steht in beiden Sichten oben.
7. **Farbpunkte.** Eine Knospe, die zu einem anderen Ding gehört als ihr Blatt, trägt dessen Farbe. Am Blatt „ich“ sind Materialien türkis, Termine orange, Personen und Communities pink. Communities gehören zu den Menschen und tragen deren Farbe, denn Violett steht für Artikel.
8. **Blau heißt: meins.** Von den Dingen her ist „bearbeiten“ an Materialien, Terminen und Artikeln blau, weil ich das mit meinen eigenen Einträgen tue. Termine und Artikel sind keine Vorschau mehr: Der Hub führt zu den eigenen Einträgen, das Ändern selbst geschieht bis auf Weiteres bei edufeed.
9. **Kennungen.** Neu ist auch `news.bearbeiten`. Die Wege heißen im Code `suchen`, `teilen`, `anlegen`, `bearbeiten`, weil „finden“ und „erstellen“ dort schon Farbnamen sind. Neu: `ich.communities`, `ich.menschen`, `ich.materialien`, `ich.termine`, `menschen.personen`, `menschen.communities`, `material.erstellen`, `material.bearbeiten`, `termine.teilen`, `termine.erstellen`, `termine.bearbeiten`, `news.finden`, `news.teilen`, `news.veroeffentlichen`. Entfallen ohne Alias: alle Kennungen unter `communities.`, dazu `menschen.finden`, `menschen.zeigen`, `menschen.zusammen`, `menschen.folgen`, `material.schreibtisch`, `material.rueckmeldung`, `termine.eintragen`, `termine.vorbereiten`, `termine.teilnehmen`, `ich.interessen`, `ich.start`.

## Folgen
- Keine Knospe ist mehr grau. „Im Hub ändern“ bei Terminen und Artikeln und „In eine Community teilen“ tragen in der Karte „bald“.
- „Material erstellen“ führt zum Schreibtisch im relidesk. Der Schreibtisch ist damit ein Ziel, kein Menüpunkt.
- „Artikel finden“ führt in den Raum Mitmachen, weil dort heute Artikel und Kommentare zu lesen sind. Eine eigene Seite für Artikel gibt es noch nicht.
- Das Blatt „ich“ hat fünf Knospen und ist damit das vollste.
- Kontextprofile angeschlossener Seiten, die alte Kennungen umlenken, müssen angepasst werden.

## Offen
1. **Violett in den Ansichten.** In der Blume steht Violett jetzt für Artikel. In den übrigen Ansichten des Hubs tragen Communities noch Violett.
2. **Eigene Seite für Artikel**, über alle Communities und ohne Anmeldung.
3. **Meine Personen** haben im Profil noch keine eigene Liste.
4. **Das Wort Beitrag** steht außerhalb der Blume noch an vielen Stellen, zum Beispiel im Editor.
5. **Die Zeichen am Eintrag.** Wenn Reagieren am Eintrag steht, braucht es dort eine einheitliche Form. ADR-0011 hatte dafür vier Zeichen vorgeschlagen.
