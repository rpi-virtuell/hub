# ADR-0002: Instanzen als Nachbau im Hub

## Status
angenommen · 28.10.2026 · Entscheidung der Maintainer · Bezug: Issue `74b30cd5…` (FOERBICO abbilden)

## Kontext
Der reli_hub ist keine weitere Plattform, sondern verbindet bestehende Angebote. Der Prototyp zeigt das, indem er Instanzen (Materialpool, relilab, relidesk) in ihrem eigenen Design nachbaut und nur vier Dinge hinzufügt: den Vermerk „Teil des reli_hub“, den Profil-Link, die schwebende Steuerkonsole und das Vorauswahl-Banner. Das Issue fragt, wie die Webseite oer.community als Schaufenster des Projekts FOERBICO im Hub erscheinen kann.

## Entscheidung
1. Eine neue Instanz kommt als eigener View in den Prototyp, in ihrem eigenen Design (Schrift, Farben, Aufbau der Originalseite), mit Inhalten als Schnappschuss mit Datenstand. Der Hub fügt nur die vier genannten Dinge hinzu.
2. Einstiege in eine Instanz sind: die Prototyp-Leiste unten links, eine Partner-Kachel im Ökosystem der Startseite und, wenn es eine zugehörige Community gibt, der Instanz-Bezug auf der Community-Kachel („↔ Instanz“).
3. Bilder werden per URL von der Originalseite oder von Blossom eingebunden; fällt ein Bild aus, bleibt ein Platzhalter mit Titel oder Initialen, das Layout springt nicht. Porträts, die auf der Originalseite unter © stehen, werden nicht übernommen; dort stehen Initialen.
4. Die OER-Community (oer.community) ist die erste Instanz nach dieser Regel: Start, Blog, Tagungen, OER/Qualität, Team, Fuß mit Lizenzzeile; Konsolen-Kontext `oer-community`, Route `#oercommunity`, Leisten-Eintrag „FOERBICO“, Community-Eintrag „OER-Community“ mit Instanz-Bezug.

Verworfen: nur ein externer Link in einer Kachel (zeigt nicht, wie die Instanz Teil des Hub wird); eine Umgestaltung der Webseite im Hub-Design (widerspricht der Regel „nachbauen, nicht neu gestalten“).

## Folgen
Jede weitere Instanz folgt demselben Muster (View, Kontext, Route, Leiste, Kachel, Community-Bezug) und bleibt in einer Datei ohne Build. Schnappschüsse veralten; der Datenstand steht im Fuß und wird bei Bedarf erneuert. Die Konsole bekommt je Instanz einen Kontext, der festlegt, welche Aktionen intern, extern oder „später“ sind.
