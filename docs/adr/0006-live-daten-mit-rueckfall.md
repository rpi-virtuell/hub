# ADR-0006: Live-Daten mit Schnappschuss als Rückfall

## Status
angenommen · 03.11.2026 · Entscheidung der Maintainer · Bezug: Issue „Leiste unten links als eigenständiges Widget“ (`4e76e4e8…`, gitworkshop) und Faden „rpi-virtuell eigene Community?“ (`99083258…`) · ersetzt Punkt 1 von ADR-0002

## Kontext
ADR-0002 legt fest, dass Instanzen im Hub nachgebaut werden und ihre Inhalte als Schnappschuss mit Datenstand tragen. Seitdem sind alle Inhalte des Prototyps eingebettet: Materialien, Communities, Beiträge, Termine, Team. Was auf den Relays neu entsteht, erscheint nicht. Wer den Hub ausprobiert, kann nicht unterscheiden, was echt ist und was Attrappe. Zugleich soll die Leiste als Widget in andere Software-Stacks wandern und braucht dafür eine Datenschicht, die nicht aus einer HTML-Datei kopiert wird. Die Relays weisen Adressen ab, die viele Anfragen gleichzeitig stellen; ein Hub, der je Eintrag eine Subscription öffnet, sperrt sich selbst aus.

## Entscheidung
1. Instanzen und Ansichten laden ihre Inhalte von den Relays. Der eingebettete Schnappschuss bleibt als Startzustand und als Rückfall, damit die Datei ohne Netz und ohne Build lauffähig bleibt; Live-Daten ersetzen ihn, sobald sie kommen.
2. Jede Ansicht zeigt sichtbar, was sie zeigt: „live“ oder „Stand vom <Datum>“. Ein Nachbau ohne Datenquelle trägt die Kennzeichnung „Nachbau“. Nichts wird als echt ausgegeben, was es nicht ist.
3. Abfragen werden je Ansicht gebündelt: ein Filter pro Relay und Ansicht, nicht eine Subscription pro Eintrag; Antworten werden im Browser gehalten; die Zahl gleichzeitiger Verbindungen ist begrenzt. Der Schnappschuss wird vor einer Vorführung frisch erzeugt, damit der Rückfall nicht veraltet ist.
4. Die Punkte 2 bis 4 von ADR-0002 gelten unverändert: eigenes Gesicht je Instanz, Einstiege über Leiste, Kachel und Community-Bezug, Bilder per URL mit Platzhalter.

Verworfen: nur Schnappschüsse und ein Erneuerungsskript (zeigt nie, was gerade entsteht, und trägt nicht in andere Stacks); nur Live-Daten ohne Rückfall (die Datei wäre ohne Netz leer und bei Relay-Abweisung nicht vorführbar).

## Folgen
Der Prototyp bekommt eine kleine Datenschicht in `index.html` (Relay-Abfrage, Zwischenspeicher, Rückfall, Kennzeichnung), die Leiste und Konsole mitnutzen. Jede Ansicht nennt ihren Datenstand. Nachbau bleibt erlaubt, wird aber als solcher sichtbar. Wer eine Instanz nachbaut, liefert die Relay-Filter dazu, nicht nur das Design. Der Schnappschuss wird zum Teil des Betriebs: vor einer Vorführung erneuern, mit Datum.
