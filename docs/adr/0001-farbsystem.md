# ADR-0001: Farbsystem

## Status
angenommen · 28.10.2026 · Entscheidung der Maintainer · Bezug: Issue `fd31ec90…` (Farben überarbeiten)

## Kontext
Der Prototyp arbeitet mit fünf Bereichsfarben (reli_hub, finden, erstellen, kooperieren, veröffentlichen), die zugleich die Ontologie der Steuerkonsole tragen. Das Issue fordert Barrierearmut (Kontrast) und eine Nähe zur Farbwelt des Projekts und seiner Partner. Vor der Entscheidung lagen Türkis und Pink als Text unter 4,5:1, die Hex-Werte standen an fünf Stellen doppelt (Stylesheet, Konsole, Anwendungsskript), und Buttons sowie Kacheln hatten keine sichtbaren Fokusringe.

## Entscheidung
1. Die Fünf-Bereiche-Ontologie bleibt. Zwei Werte ändern sich: reli_hub-Blau wird das FOERBICO-Markenblau `#203A8F` (das Logo-Blau des Comenius-Instituts, gemessen `#1B3892`, ist praktisch dasselbe); das Orange von „erstellen“ wird das FOERBICO-Orange `#FFA500`. Das Türkis von „finden“ wird auf `#007A75` abgedunkelt, damit weiße Beschriftung 4,5:1 erreicht.
2. Jeder Bereich hat zwei Farben: eine Flächenfarbe (`--c-*`) und eine Textfarbe (`--x-*`), die auf Papier, Karte und dem eigenen Hellton mindestens 4,5:1 erreicht. Farbiger Text benutzt immer die Textfarbe. Weißer Text liegt nur auf Blau, Violett, Pink und dem neuen Türkis; auf Orange liegt dunkler Text.
3. Alle Bereichsfarben der Anwendung stehen nur in `:root`. Die Steuerkonsole behält eigene Standardwerte, damit sie als eigenständige Datei auf fremden Seiten läuft, und liest die Custom Properties `--relihub-c-<id>`, `--relihub-text-<id>` und `--relihub-x-<id>`, wenn das Dokument sie setzt. Ein Theme-Wechsel ist damit ein Austausch von `:root`.
4. Die Paletten der nachgebauten Instanzen (Materialpool, relilab, relidesk) bleiben Instanzfarben; ihre Textvarianten werden nur so weit abgedunkelt, dass die Kontrastregel gilt.
5. Fokus ist überall sichtbar: eine generische Regel für Buttons, Links und Elemente mit `tabindex`.

Verworfen: eine Kontrast-Ausnahme für die Beschriftung der Konsolenkreise (hätte die Regel aufgeweicht); die Konsole hart an das Hub-Stylesheet zu binden (widerspricht ihrer Rolle als einbettbares Element).

## Folgen
Die Oberfläche wird etwas dunkler im Türkis und deutlich wärmer im Orange. Neue Gestaltung muss die Zweiteilung Fläche/Text einhalten; die Tests rechnen die Kontraste aus den Variablen nach und schlagen bei hart kodierten Bereichsfarben im Anwendungsskript fehl. Eine Anpassung an weitere Farbwelten (etwa relilab-Magenta näher an die Hub-Palette) ist offen und wäre ein neues ADR.
