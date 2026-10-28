# reli_hub

Prototyp des reli_hub: eine einzelne HTML-Datei ohne Build und ohne Framework (`index.html`). Alle Ansichten sind Blöcke in einer Seite, umgeschaltet per Hash-Routing; die Steuerkonsole ist als Web Component angelegt. Die Datei kann direkt im Browser geöffnet werden.

**Herkunft:** Entwurf von Jens Dechow (`npub17z39pld9w3z7w872zx0a6cte4s7ezhcy8w69jjzku7d8xv295q8s6dmu40`), Prototyp 5 vom 26.10.2026, geschenkt zum Start des reli_hub-Repos im Oktober 2026. Die Konstruktionsbeschreibung in `docs/konstruktion.md` ist aus der Datei rekonstruiert (Jörg Lohrer) und beschreibt Leitidee, Funktionsmodell und Bauweise.

**Arbeitsweise:** Zuerst wird dieser HTML-Entwurf ausgefeilt, danach kommt der Svelte-Stack obendrauf. Änderungen kommen als Pull Requests über Nostr (`pr/`-Branches, gitworkshop.dev); Maintainer mergen nach `main`.

**Lizenz:** Inhalte und Code unter CC BY 4.0, Urheber Jens Dechow und Comenius-Institut (FOERBICO/rpi-virtuell).

## Grundentscheidungen

Die Grundentscheidungen des Prototyps stehen als ADRs in `docs/adr/` (Vorlage und Regeln in [docs/adr/README.md](docs/adr/README.md)). Sie sind Referenzpunkte, auch wenn sich etwas ändert: Eine Änderung ist ein neues ADR, das das alte ersetzt.

| Nr. | Titel | Status |
|---|---|---|
| [0001](docs/adr/0001-farbsystem.md) | Farbsystem: Fünf-Bereiche-Ontologie, FOERBICO-Blau und -Orange, Kontrastregel | angenommen |
| [0002](docs/adr/0002-instanzen-als-nachbau.md) | Instanzen als Nachbau im Hub | angenommen |
| [0003](docs/adr/0003-teilen-in-communities.md) | Teilen in Communities nach dem edufeed-Modell | angenommen |
| [0004](docs/adr/0004-newsletter-als-nip-b0.md) | Newsletter einer Community als NIP-B0-Lesezeichen | angenommen |
| [0005](docs/adr/0005-artikel-im-finden.md) | Artikel und Nachrichten gehören zu „finden“ | angenommen |

**Prüfungen:** `deno task test` führt textbasierte Prüfungen über `index.html` aus (Syntax beider Inline-Skripte, Farbkontraste aus den Variablen, Struktur der Ansichten, ADRs). Kein Build; die Datei bleibt direkt im Browser lauffähig.
