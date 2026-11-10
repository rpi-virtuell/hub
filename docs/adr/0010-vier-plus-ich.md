# ADR-0010: Vier plus ich

## Status
angenommen als Entwurfsrunde · 10.11.2026 · Entscheidung der Maintainer nach einem Abgleich der beiden Entwürfe; offene Punkte stehen unter „Offen“

## Kontext
Der Hub hatte zwei Ordnungen nebeneinander. Die Konsole ordnete nach fünf Tätigkeiten (reli_hub, finden, erstellen, kooperieren, veröffentlichen). Das Ökosystem ordnet nach vier Dingen: Menschen, Communities, Materialien, Termine. Die Tätigkeiten überlagern sich: erstellen und veröffentlichen sind kaum zu trennen, finden und kooperieren ebenso wenig. Die vier Dinge lassen sich dagegen sauber unterscheiden und entsprechen dem, was im Datenraum liegt (Profile, Zusammenschlüsse von Profilen, Inhalte, Termine). Dazu kam die Rückmeldung, dass sich die Blume nicht von selbst erklärt: Erst nach zwei Klicks war zu sehen, was es gibt.

## Entscheidung
1. **Die Konsole ordnet nach vier plus ich.** Oben steht „ich“, im Uhrzeigersinn folgen Menschen, Communities, Materialien, Termine. Die Kennungen der Aktionen heißen entsprechend (`ich.profil`, `menschen.finden`, `communities.finden`, `material.finden`, `termine.finden` und weitere, siehe [navigation.md](../navigation.md)). Die früheren Kennungen entfallen ohne Übergang; Version der Konsole 0.8.0.
2. **Je Element eine Knospe hinaus und eine hinein.** Hinaus heißt finden. Hinein heißt mich zeigen, mitmachen, teilen, eintragen. Lieber eine Aktion, die gut funktioniert, als fünf halbe.
3. **Materialien fächern sich auf.** Beiträge und Lerninhalte sind Materialien. Ob ein Material verlinkt oder hochgeladen ist, spielt für die Ordnung keine Rolle.
4. **Zwei Graustufen zeigen, was noch nicht gebaut ist.** Dunkelgrau (`stand: 'spaeter'`) heißt später gedacht, hellgrau (`stand: 'offen'`) heißt gewollt und noch nicht gebaut. Das Ereignis `relihub-action` trägt den Stand mit; die Seite zeigt dazu einen Hinweis oder verweist auf edufeed. Erste Belegung: Material bearbeiten ist dunkelgrau, Community gründen ist hellgrau.
5. **Die Startseite zeigt gleich Inhalte.** Wer einen Kreis berührt, sieht in der Karte bis zu vier echte Einträge dieses Elements. Jeder Eintrag führt in den Überblick (`#oekosystem?wahl=…`), wo seine Verbindungen stehen. So greifen Blume und Explorer ineinander: Die Blume ist der Einstieg, der Explorer die Tiefe.
6. **Themen wirken ohne Anmeldung.** Ein Feld über der Konsole nimmt Schlagworte auf (`#Frieden #Konfi`). Sie filtern die Vorschau über Name, Untertitel und `t`-Tags und bleiben im Browser (`relihub-themen`). Ohne Treffer zeigt die Vorschau das Übliche und sagt das dazu. Die Themen sind die Vorstufe zum Profil.
7. **Labor und Schreibtisch sind Orte, keine Elemente.** Sie stehen in der Leiste. Das Labor ist zusätzlich aus der Karte Communities erreichbar, der Schreibtisch über die dunkelgraue Knospe.

Verworfen: die fünf Verben mit neuen Wörtern schärfen (die Überlagerung bleibt); vier getrennte Blumen (zu viel für eine Startseite); Vorschau erst nach Anmeldung (die Themen sollen vor dem Profil wirken); die alten Kennungen als Alias behalten (zwei Ordnungen in einer Schnittstelle).

## Folgen
Die Vorschau lädt beim ersten Blick auf eines der vier Elemente dieselben Quellen wie das Ökosystem, einmal je Sitzung. Bis die Antwort da ist, zeigt sie den eingebetteten Bestand; Menschen erscheinen erst mit der Antwort. Das erhöht die Relay-Last der Startseite auf die des Ökosystems (siehe [daten.md](../daten.md)). Die Farben wandern mit: ich blau, Menschen pink, Communities violett, Materialien petrol, Termine orange. Die Hash-Routen behalten die früheren Verben, damit Links halten. Kontextprofile fremder Seiten müssen die neuen Kennungen verwenden.

## Offen
- Startseite als Blume, als Explorer oder als ein Drittes aus beiden.
- Formensprache je Element: Kreise mit eingelegten Formen oder eigene Formen.
- Welche Knospen dunkelgrau und welche hellgrau sind.
- Welche Aktion hinein und hinaus zuerst ausgebaut wird.
- Ob die Themen in den Materialpool und den Kalender durchgereicht werden.
- Wo die Projektergebnisse stehen: eigener Zuschnitt oder vorübergehend vorn.
