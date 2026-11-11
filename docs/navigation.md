# Navigation: Startseite, Konsole, Leiste

Drei Elemente führen durch den reli_hub und müssen dieselben Begriffe, Farben und Ziele verwenden. Die Tabelle unten ist die Referenz, an der sich jede neue Ansicht mit ihren Begriffen ausrichtet.

Die Startseite zeigt zu jedem Element gleich echte Einträge und erklärt mit Erklärkarte und Narrativ, was der Hub kann. Die Konsole (`<relihub-steuerkonsole>`) ordnet nach vier plus ich: Menschen, Communities, Materialien, Termine, dazu oben „ich“ ([ADR-0010](adr/0010-vier-plus-ich.md)). Die Leiste (`<relihub-leiste>`) zeigt Orte: siehe [leiste.md](leiste.md).

Jedes der vier Dinge trägt vier Knospen in fester Reihenfolge, je eine pro Aktionsform: sehen, zeigen, erarbeiten, in Kontakt treten ([ADR-0011](adr/0011-matrix-dinge-und-aktionsformen.md)). Das Zeichen in der Knospe zeigt die Form, das Wort nennt die konkrete Handlung. Graue Knospen sind noch nicht gebaut: dunkelgrau heißt später gedacht, hellgrau heißt gewollt und noch nicht gebaut.

| Begriff | Startseite | Konsole (Aktion) | Ziel (Route) | Leiste (Instanz) | Farbe | Stand |
|---|---|---|---|---|---|---|
| Profil | Mein Profil | `ich.profil` | `#profil` (angemeldet: eigenes Profil) | – | ich | gebaut |
| Themen | Themenfeld über der Konsole | `ich.interessen` | `#start?zu=themen` | – | ich | gebaut |
| Überblick | Überblick | `ich.start` | `#oekosystem` | – | ich | gebaut |
| Personen | Menschen finden | `menschen.finden` | `#kooperieren/personen` | – | Menschen | gebaut |
| Mich zeigen | Mich zeigen | `menschen.zeigen` | `#profil`, ohne Anmeldung der Dialog `#anmelden` | – | Menschen | gebaut |
| Profil pflegen | Profil pflegen | `menschen.pflegen` | `#profil`, ohne Anmeldung der Dialog `#anmelden` | – | Menschen | gebaut |
| Folgen | Menschen folgen | `menschen.folgen` | `#kooperieren/personen` | – | Menschen | gebaut |
| Communities | Communities finden | `communities.finden` | `#communities` | – | Communities | gebaut |
| Empfehlen | Community empfehlen | `communities.empfehlen` | Hinweis | – | hellgrau | gewollt, nicht gebaut |
| Mitmachen | Mitmachen | `communities.mitmachen` | `#mitmachen` | – | Communities | gebaut |
| Gründen | Community gründen | `communities.gruenden` | Hinweis, Verweis auf edufeed | – | hellgrau | gewollt, nicht gebaut |
| Labor | Knopf in der Karte Communities | – | `#relilab` | relilab | Communities | gebaut |
| Material | Material finden | `material.finden` | `#materialpool` | Materialpool | Materialien | gebaut |
| Sammlung | – | – (über Materialpool und Erklärkarte) | `#finden/sammlung` | – | Materialien | gebaut |
| Beiträge | Knopf in der Karte Material finden | – | `#profil?zu=artikel` | – | Materialien | gebaut |
| Lerninhalte | Material teilen | `material.teilen` | `#materialpool` mit Editor darüber | Materialpool | Materialien | gebaut |
| Beitrag | Knopf in der Karte Material teilen | – | Editor für Beiträge | – | Materialien | gebaut |
| Schreibtisch | Material bearbeiten | `material.schreibtisch` | `#relidesk?tab=schreibtisch` | relidesk | dunkelgrau | später gedacht |
| Kommentieren | Material kommentieren | `material.kommentieren` | `#mitmachen` | – | Materialien | gebaut |
| Fortbildungen | Termine finden | `termine.finden` | `#finden/fortbildungen` (im Kontext rpi-virtuell der Tab, im relilab die Termine) | rpi-virtuell (Institute) | Termine | gebaut |
| Termin | Termin eintragen | `termine.eintragen` | Editor für Termine | – | Termine | gebaut |
| Planen | Termin planen | `termine.planen` | Hinweis | – | hellgrau | gewollt, nicht gebaut |
| Zusagen | Zusagen | `termine.zusagen` | `#finden/fortbildungen` | – | Termine | gebaut |
| Anmelden | Kopfzeile | – | Dialog `#anmelden` | – | ich | gebaut |
| Ökosystem | Überblick | `ich.start` | `#oekosystem` | – | ich | gebaut |
| Eigene Instanz | – | – (Leiste: Zuschnitt) | `#eigene-instanz` | Zuschnitt | Communities | gebaut |
| Start | – | – | `#start` | Start | ich | gebaut |
| Spielregeln | – | – | `#oercommunity/spielregeln` | Schaufenster-Menü | – | gebaut |
| Hilfe | Hilfe | – | `#hilfe` | – | ich | gebaut |

Farben: ich blau, Menschen pink, Communities violett, Materialien petrol, Termine orange. Die Routen tragen noch die früheren Verben (`#finden/…`, `#kooperieren/…`); sie bleiben, damit bestehende Links halten.

Die Knospen der Konsole tragen die Textfarbe ihres Bereichs, dieselbe wie Erklärkarte und Kacheln auf der Startseite.

Noch offen: Startseite als Blume, Explorer oder ein Drittes; die Formensprache je Element; welche Knospen dunkelgrau und hellgrau sind; der Name der Startseite.
