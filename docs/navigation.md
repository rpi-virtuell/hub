# Navigation: Startseite, Konsole, Leiste

Drei Elemente führen durch den reli_hub und müssen dieselben Begriffe, Farben und Ziele verwenden. Die Tabelle unten ist die Referenz, an der sich jede neue Ansicht mit ihren Begriffen ausrichtet.

Die Startseite zeigt zu jedem Element gleich echte Einträge und erklärt mit Erklärkarte und Narrativ, was der Hub kann. Die Konsole (`<relihub-steuerkonsole>`) ordnet nach vier plus ich: Menschen, Communities, Materialien, Termine, dazu oben „ich“ ([ADR-0010](adr/0010-vier-plus-ich.md)). Die Leiste (`<relihub-leiste>`) zeigt Orte: siehe [leiste.md](leiste.md).

Jedes der vier Dinge trägt vier Knospen in fester Reihenfolge, je eine pro Aktionsform: sehen, zeigen, erarbeiten, in Kontakt treten ([ADR-0011](adr/0011-matrix-dinge-und-aktionsformen.md)). Das Zeichen in der Knospe zeigt die Form, der Name nennt Verb und Ding. In der Mitte der Blume steht „Ich möchte“. Ein Umschalter auf der Startseite zeigt dieselbe Matrix von den Aktionsformen her: Dann sind sehen, zeigen, erarbeiten und Kontakt die Blätter und die vier Dinge die Knospen. Kennungen und Ziele bleiben gleich. Graue Knospen sind noch nicht gebaut: dunkelgrau heißt später gedacht, hellgrau heißt gewollt und noch nicht gebaut. Unter jeder Knospe liegen mehrere Handlungen; sie stehen als Knöpfe in der Erklärkarte.

| Begriff | Startseite | Konsole (Aktion) | Ziel (Route) | Leiste (Instanz) | Farbe | Stand |
|---|---|---|---|---|---|---|
| Profil | Mein Profil | `ich.profil` | `#profil` (angemeldet: eigenes Profil) | – | ich | gebaut |
| Themen | Themenfeld über der Konsole | `ich.interessen` | `#start?zu=themen` | – | ich | gebaut |
| Überblick | Überblick | `ich.start` | `#oekosystem` | – | ich | gebaut |
| Personen | Menschen entdecken | `menschen.finden` | `#kooperieren/personen` | – | Menschen | gebaut |
| Vorstellen | Mich vorstellen | `menschen.zeigen` | `#profil`, ohne Anmeldung der Dialog `#anmelden` | – | Menschen | gebaut |
| Zusammenarbeiten | Zusammenarbeiten | `menschen.zusammen` | Hinweis | – | hellgrau | gewollt, nicht gebaut |
| Folgen | Menschen folgen | `menschen.folgen` | `#kooperieren/personen` | – | Menschen | gebaut |
| Communities | Communities entdecken | `communities.finden` | `#communities` | – | Communities | gebaut |
| Community vorstellen | Community vorstellen | `communities.vorstellen` | Hinweis | – | hellgrau | gewollt, nicht gebaut |
| Aufbauen | Community aufbauen | `communities.aufbauen` | `#eigene-instanz`; Gründen über die Karte bei edufeed | Zuschnitt | Communities | gebaut (Zuschnitt) |
| Mitmachen | Mitmachen | `communities.mitmachen` | `#mitmachen` | – | Communities | gebaut |
| Labor | Knopf in der Karte Communities | – | `#relilab` | relilab | Communities | gebaut |
| Material | Materialien suchen | `material.finden` | `#materialpool` | Materialpool | Materialien | gebaut |
| Beiträge | Knopf in der Karte Materialien suchen | – | `#profil?zu=artikel` | – | Materialien | gebaut |
| Lerninhalte | Material teilen | `material.teilen` | `#materialpool` mit Editor darüber | Materialpool | Materialien | gebaut |
| Beitrag | Knopf in der Karte Material teilen | – | Editor für Beiträge | – | Materialien | gebaut |
| Sammlung | Material weiterentwickeln | `material.schreibtisch` | `#finden/sammlung` | – | Materialien | gebaut |
| Schreibtisch | Knopf in der Karte Material weiterentwickeln | – (im Kontext relidesk die Knospe) | `#relidesk?tab=schreibtisch` | relidesk | dunkelgrau | später gedacht |
| Rückmeldung | Rückmeldung geben | `material.rueckmeldung` | `#oekosystem` (Gefällt mir), Kommentieren über `#mitmachen` | – | Materialien | gebaut |
| Fortbildungen | Termine finden | `termine.finden` | `#finden/fortbildungen` (im Kontext rpi-virtuell der Tab, im relilab die Termine) | rpi-virtuell (Institute) | Termine | gebaut |
| Termin | Termin ankündigen | `termine.eintragen` | Editor für Termine | – | Termine | gebaut |
| Vorbereiten | Termin vorbereiten | `termine.vorbereiten` | Hinweis | – | hellgrau | gewollt, nicht gebaut |
| Teilnehmen | Teilnehmen | `termine.teilnehmen` | `#finden/fortbildungen` | – | Termine | gebaut |
| Anmelden | Kopfzeile | – | Dialog `#anmelden` | – | ich | gebaut |
| Ökosystem | Überblick | `ich.start` | `#oekosystem` | – | ich | gebaut |
| Eigene Instanz | – | – (Leiste: Zuschnitt) | `#eigene-instanz` | Zuschnitt | Communities | gebaut |
| Start | – | – | `#start` | Start | ich | gebaut |
| Spielregeln | – | – | `#oercommunity/spielregeln` | Schaufenster-Menü | – | gebaut |
| Hilfe | Hilfe | – | `#hilfe` | – | ich | gebaut |

Farben: ich blau, Menschen pink, Communities violett, Materialien petrol, Termine orange. Die Routen tragen noch die früheren Verben (`#finden/…`, `#kooperieren/…`); sie bleiben, damit bestehende Links halten.

Die Knospen der Konsole tragen die Textfarbe ihres Bereichs, dieselbe wie Erklärkarte und Kacheln auf der Startseite.

Noch offen: Startseite als Blume, Explorer oder ein Drittes; die Formensprache je Element; welche Knospen dunkelgrau und hellgrau sind; der Name der Startseite.
