# ADR-0005: Artikel und Nachrichten gehören zu „finden“

## Status
angenommen · 28.10.2026 · Entscheidung der Maintainer · Bezug: Issue `390d2fa0…` (Finden → Artikel/News)

## Kontext
„finden“ führte zu Material (Materialpool) und Fortbildungen (relilab-Termine). Artikel und Nachrichten gab es nur verstreut: als Profil-News und in den Community-Räumen. Das Issue stellt fest, dass der Materialpool nur Lehr- und Lerninhalte zeigt und Beiträge beim Finden fehlen.

## Entscheidung
1. „finden“ umfasst drei Knospen: Material, Fortbildungen, Beiträge. Lehr- und Lerninhalte bleiben im Materialpool; Beiträge kommen aus Communities und Instanzen, nicht aus dem Materialpool. Die Erklärkarte sagt das.
2. Beiträge werden im Profil gesammelt: Panel „Artikel aus deinen Communities“ mit allen Artikeln der Communities, denen die Persona folgt oder in denen sie Mitglied ist, mit Community als Quelle und Sprung in den Raum. Das bestehende Panel „News aus deinem Netz“ bleibt für Nachrichten.
3. Die Knospe „Beiträge“ führt aus jedem Kontext zum Profil und scrollt zum Panel, so wie „Material“ aus jedem Kontext zum Materialpool führt.

Verworfen: Artikel in den Materialpool-Nachbau zu mischen (widerspricht der Instanz); ein eigener Finden-View (die Ontologie sieht keine Zielseite für „finden“ vor).

## Folgen
Mit drei Knospen wechselt das Popover von „finden“ von Halbkreisen auf Knospen, wie bei „veröffentlichen“. Geteilte Beiträge (ADR-0003) erscheinen sofort im Panel. Für die Svelte-Umsetzung heißt das: Artikel werden über die Communities des Nutzers abgefragt (kind 30023 mit `h`-Tag und kind-16-Reposts), nicht über einen zentralen Index.
