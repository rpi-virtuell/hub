# Datenschicht: Live von den Relays, Schnappschuss als Rückfall

Umsetzung von [ADR-0006](adr/0006-live-daten-mit-rueckfall.md). Die Datenschicht steht im Anwendungsskript von `index.html` (letzter `<script>`-Block), direkt nach den Farbkonstanten.

## Relays und Grenzen

| Konstante | Wert | Bedeutung |
|---|---|---|
| `RELAYS` | `wss://relay.edufeed.org`, `wss://relay-rpi.edufeed.org`, `wss://amb-relay.edufeed.org` | die einzigen Relays, von denen der Hub liest; das Gruppen-Relay wird nie gelesen |
| `TIMEOUT_MS` | 8000 | eine Abfrage schließt spätestens nach 8 s, auch ohne `EOSE` |
| `MAX_CONN` | 3 | höchstens drei WebSockets gleichzeitig; weitere warten in einer Warteschlange |
| `RETRY_MS` | 60000 | innerhalb einer Minute liefert eine erneute Abfrage derselben Ansicht den Zwischenspeicher, ohne Netz |

Die Relays weisen Adressen ab, die viele Anfragen schnell hintereinander stellen. Deshalb gilt: ein `REQ` je Relay und Ansicht (alle Filter der Ansicht in einem `REQ`), nie eine Subscription je Eintrag.

## Funktionen

- `hubFetch(name, filters, opts)` → `Promise<Event[]>`: sendet die Filter als ein `REQ` an jedes Relay aus `opts.relays` (Standard: alle `RELAYS`), sammelt `EVENT`s, dedupliziert nach `id` und schließt bei `EOSE` oder nach `TIMEOUT_MS`. Bei `NOTICE`, `CLOSED` oder Verbindungsfehler schließt der Socket, und das bis dahin Empfangene zählt. Das Versprechen löst immer auf, nie ab; im schlechtesten Fall mit `[]`. Das Ergebnis liegt in `sessionStorage` unter `relihub:<name>` als `{t, events}`; ist der Speicher gesperrt (privates Fenster), läuft alles ohne Zwischenspeicher.
- `datenstand(viewId, zustand, info)`: schreibt die Stand-Zeile `<p class="stand">` der Ansicht: `live · <info>`, `Stand vom <info>` oder `Nachbau · <info>`.
- `npubToHex(npub)`: Bech32 nach NIP-19, liefert 64 Hex-Zeichen.
- `evToTermin(ev)`: NIP-52-Event (kind 31923) → Termin-Objekt der relilab-Ansicht (`id` aus dem `d`-Tag, Titel, Start, Ende, Kurztext aus `summary`, Ort, `t`-Tags, Bild, Anmeldelink aus `r`, Absender über `RT_SRC`, `naddr` und edufeed-Link).

## Zustände je Ansicht

Jede Ansicht außer der Startseite trägt direkt unter ihrer Kopfzeile eine Stand-Zeile und am `div.view` ihren Startwert in `data-stand="<zustand>:<info>"`. Beim Laden wird er einmal angewendet.

| Ansicht | Startwert | Datenquelle |
|---|---|---|
| `v-profil` | Nachbau · Persona Luca Beispiel | keine, Persona |
| `v-communities`, `v-community` | Stand vom 26.10.2026 | eingebettete Beispieldaten |
| `v-materialpool` | Stand vom 22.10.2026 | eingebettete Liste |
| `v-relilab` | Stand vom `RT_STAND` → live | Schnappschuss, dann `hubFetch('relilab-termine', …)` |
| `v-relidesk` | Nachbau · relidesk ohne Datenquelle | keine |
| `v-oercommunity` | Stand vom 28.10.2026 | eingebettete Beispieldaten |
| `v-rpi-virtuell` | Nachbau · Termine und News laden → live | `hubFetch('rpi-virtuell', …)`, kein Schnappschuss |

Drei Zustände: **live** (Relay-Daten sind angekommen), **Stand vom …** (eingebetteter Schnappschuss, auch wenn das Relay schweigt, abweist oder nichts liefert), **Nachbau** (Ansicht ohne Datenquelle). Nichts wird als live ausgegeben, was nicht vom Relay kam.

## Erster Verbraucher: relilab-Termine

`rtOpen` zeigt sofort den Schnappschuss und fragt einmal je Sitzung `relay.edufeed.org` nach kind 31923 der drei Absender in `RT_SRC`, angelegt in den letzten 30 Tagen. Weil `since` auf `created_at` wirkt, liefert das Relay nur kürzlich angelegte oder geänderte Termine; früher angelegte, aber bevorstehende Termine fehlen in der Antwort. Deshalb wird gemischt, nicht ersetzt: Schnappschuss und Relay-Antwort werden je Adresse (`pubkey:d`) zusammengeführt, das neuere `created_at` gewinnt. Stand-Zeile und Fußnote zeigen dann `live · <k> vom Relay · <n> Termine`: `k` ist die Zahl der in dieser Sitzung vom Relay empfangenen Termine, `n` die Gesamtzahl nach dem Mischen (davon `n − k` höchstens aus dem Schnappschuss, Stand `RT_STAND`). Kommt nichts, bleibt `Stand vom <RT_STAND>`.

## Zweiter Verbraucher: rpi-virtuell (Fortbildungen und News)

`rvOpen(qs)` setzt den Tab (`?tab=material|fortbildungen|news`, unbekannte Werte fallen auf `material`) und fragt einmal je Sitzung beide Relays mit **einem** `REQ` je Relay:

| Filter | Wert | Zweck |
|---|---|---|
| 1 | `{ kinds: [31923], since: <jetzt − 180 Tage>, limit: 300 }` | Termine aller Absender (globale Sicht des Fortbildungskalenders) |
| 2 | `{ kinds: [30023], authors: [<Hex von npub12jguy…05rr6j>], limit: 10 }` | die zehn neuesten Beiträge der News-Redaktion rpi-virtuell (der Schlüssel hat kein Profil, der Name steht im Code) |

Relays: `wss://relay.edufeed.org`, `wss://relay-rpi.edufeed.org` (nicht das AMB-Relay). Termine werden mit `evToTermin` umgesetzt, clientseitig auf `start ≥ jetzt` gefiltert, nach Start sortiert, die ersten 40 angezeigt; Absender ist der Name aus `RT_SRC` oder der gekürzte npub. News: Titel aus `title`, Datum aus `published_at` (sonst `created_at`), Zusammenfassung aus `summary`, Link `https://edufeed.org/<naddr>`.

Stand-Zeile: vor der Antwort `Nachbau · Termine und News laden`; mit Antwort `live · <n> Termine · <m> News` (`n` = bevorstehende Termine, `m` = News); ohne Antwort `Nachbau · Relay nicht erreichbar`, und die Tabs zeigen „Gerade keine Verbindung zu den Relays; die Termine stehen auch unter rpi-virtuell.de“ mit Link. Weil `since` auf `created_at` wirkt, fehlen Termine, die vor mehr als 180 Tagen angelegt und seitdem nicht geändert wurden.

## Schnappschuss erneuern

```bash
deno task schnappschuss
```

`tools/schnappschuss.ts` sendet ein `REQ` mit `{"kinds":[31923],"authors":[…drei Hex-Schlüssel…]}` an `relay.edufeed.org`, wartet bis `EOSE` (höchstens 25 s), behält Termine, die noch laufen oder höchstens 30 Tage vorbei sind, kürzt die Events auf `id, pubkey, created_at, kind, tags, content` (`content` leer, wenn ein `summary`-Tag da ist), maskiert `<` als `\u003c` (damit kein `</script>` aus Relay-Inhalten das Skript beendet), sortiert nach `created_at`, dedupliziert nach `id` und schreibt den Block zwischen `/* schnappschuss:termine */` und `/* /schnappschuss:termine */` in `index.html` neu (`RT_RAW` und `RT_STAND` mit dem heutigen Datum). Ausgabe: `<n> Termine, Stand <Datum>`. Liefert das Relay nichts, bleibt die Datei unverändert und das Skript endet mit Code 1.

Vor jeder Vorführung erneuern, damit der Rückfall nicht veraltet. Nicht in schneller Folge wiederholen (Adresssperre der Relays).

## Grenzen

- Das Relay liefert je `REQ` höchstens etwa 500 Events (neueste zuerst). Das Skript meldet, wenn die Grenze erreicht ist; früher angelegte Termine können dann fehlen.
- Die Live-Abfrage holt nur in den letzten 30 Tagen angelegte Termine; ältere kommen aus dem Schnappschuss.
- Löschungen (kind 5) werden nicht ausgewertet; ein gelöschter Termin bleibt bis zum nächsten Schnappschuss sichtbar.
- Live sind bisher die relilab-Termine und die Ansicht rpi-virtuell (Fortbildungen, News). Die übrigen Ansichten zeigen ihren eingebetteten Stand oder sind als Nachbau gekennzeichnet.
