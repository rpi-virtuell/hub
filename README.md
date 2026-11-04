# reli_hub

**Aktuelle Fassung zum Ausprobieren:** https://hub.rpi-virtuell.net. Quelle ist dieses Repo auf gitworkshop.dev; ausgeliefert wird der Stand von `main` aus der Forgejo-Arbeitskopie.

Prototyp des reli_hub: eine einzelne HTML-Datei ohne Build und ohne Framework (`index.html`). Alle Ansichten sind Blöcke in einer Seite, umgeschaltet per Hash-Routing; dazu gehören die Nachbauten Materialpool (mit Material-Detail), relilab und relidesk sowie rpi-virtuell als eigene Instanz (Material, Fortbildungen, News) und das Schaufenster mit den Spielregeln; die Steuerkonsole ist als Web Component angelegt. Leiste unten links (Orte) und Steuerkonsole (Tätigkeiten) sind zwei getrennte Elemente: siehe [docs/leiste.md](docs/leiste.md); Begriffe, Farben und Ziele von Startseite, Konsole und Leiste stehen in [docs/navigation.md](docs/navigation.md). Die Datei kann direkt im Browser geöffnet werden.

**Herkunft:** Entwurf von Jens Dechow (`npub17z39pld9w3z7w872zx0a6cte4s7ezhcy8w69jjzku7d8xv295q8s6dmu40`), Prototyp 5 vom 26.10.2026, geschenkt zum Start des reli_hub-Repos im Oktober 2026. Die Konstruktionsbeschreibung in `docs/konstruktion.md` ist aus der Datei rekonstruiert (Jörg Lohrer) und beschreibt Leitidee, Funktionsmodell und Bauweise.

**Arbeitsweise:** Zuerst wird dieser HTML-Entwurf ausgefeilt, danach kommt der Svelte-Stack obendrauf. Änderungen kommen als Pull Requests über Nostr (`pr/`-Branches, gitworkshop.dev); Maintainer mergen nach `main`.

**Lizenz:** Inhalte und Code unter CC BY 4.0, Urheber Jens Dechow und Comenius-Institut (FOERBICO/rpi-virtuell).

## Dokumentation

- [docs/konstruktion.md](docs/konstruktion.md): Leitidee, Funktionsmodell, Bauweise
- [docs/navigation.md](docs/navigation.md): Begriffe, Farben und Ziele von Startseite, Konsole und Leiste
- [docs/leiste.md](docs/leiste.md): die Leiste unten links als eigenständiges Widget
- [docs/daten.md](docs/daten.md): Live-Abfrage, Schnappschuss, Datenstand je Ansicht
- [docs/betrieb.md](docs/betrieb.md): Auslieferung und laufender Betrieb

## Grundentscheidungen

Die Grundentscheidungen des Prototyps stehen als ADRs in `docs/adr/` (Vorlage und Regeln in [docs/adr/README.md](docs/adr/README.md)). Sie sind Referenzpunkte, auch wenn sich etwas ändert: Eine Änderung ist ein neues ADR, das das alte ersetzt.

| Nr. | Titel | Status |
|---|---|---|
| [0001](docs/adr/0001-farbsystem.md) | Farbsystem: Fünf-Bereiche-Ontologie, FOERBICO-Blau und -Orange, Kontrastregel | angenommen |
| [0002](docs/adr/0002-instanzen-als-nachbau.md) | Instanzen als Nachbau im Hub | angenommen |
| [0003](docs/adr/0003-teilen-in-communities.md) | Teilen in Communities nach dem edufeed-Modell | angenommen |
| [0004](docs/adr/0004-newsletter-als-nip-b0.md) | Newsletter einer Community als NIP-B0-Lesezeichen | angenommen |
| [0005](docs/adr/0005-artikel-im-finden.md) | Artikel und Nachrichten gehören zu „finden“ | angenommen |
| [0006](docs/adr/0006-live-daten-mit-rueckfall.md) | Live-Daten mit Schnappschuss als Rückfall, Kennzeichnung „Nachbau“ (ersetzt Punkt 1 von ADR-0002) | angenommen |
| [0007](docs/adr/0007-inhalte-aus-events.md) | Inhalte aus Events: Seiten, Beiträge, Materialien, Lizenzstand | angenommen |

**Prüfungen:** `deno task test` führt textbasierte Prüfungen über `index.html` aus (Syntax aller Inline-Skripte, Farbkontraste aus den Variablen, Struktur der Ansichten, ADRs). Kein Build; die Datei bleibt direkt im Browser lauffähig.

**Daten:** relilab-Termine und rpi-virtuell laden live von den edufeed-Relays, ebenso das Schaufenster (Seiten, Beiträge) und der Materialpool (Materialien); die übrigen Ansichten zeigen einen Schnappschuss oder einen gekennzeichneten Nachbau (siehe [docs/daten.md](docs/daten.md)); bei relilab und den Beiträgen des Schaufensters ist der eingebettete Schnappschuss Startzustand und Rückfall, ohne Netz bleibt die Datei vorführbar. Jede Ansicht nennt ihren Datenstand (`live`, `Stand vom …` oder `Nachbau`). Vor Vorführungen den Schnappschuss mit `deno task schnappschuss` erneuern: siehe [docs/daten.md](docs/daten.md).

**Betrieb:** Forgejo-Arbeitskopie `Comenius-Institut/hub`, Auslieferung unter `hub.rpi-virtuell.net` (seit 04.11.2026 ohne GitHub Pages): siehe [docs/betrieb.md](docs/betrieb.md).
