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
- `evToTermin(ev)`: NIP-52-Event (kind 31923) → Termin-Objekt der relilab-Ansicht (`id` aus dem `d`-Tag, Titel, Start, Ende, Kurztext aus `summary`, Ort, `t`-Tags, Bild und Anmeldelink aus `r` nur mit `http(s)://`, sonst leer (`sichereUrl`), Absender über `RT_SRC`, `naddr` und edufeed-Link).

## Zustände je Ansicht

Jede Ansicht außer der Startseite trägt direkt unter ihrer Kopfzeile eine Stand-Zeile und am `div.view` ihren Startwert in `data-stand="<zustand>:<info>"`. Beim Laden wird er einmal angewendet.

| Ansicht | Startwert | Datenquelle |
|---|---|---|
| `v-profil` | Nachbau · Persona Luca Beispiel | keine, Persona |
| `v-communities` | Stand vom 26.10.2026 · Texte teils Beispiel | eingebettete Liste realer Communities, Beschreibungen teils Beispieltext |
| `v-community` | Nachbau · Beispielinhalte | Beispielinhalte (Beiträge, Chat), keine Datenquelle |
| `v-materialpool` | Stand vom 22.10.2026 → live | eingebettete Liste (`MP`), dann `mpLaden()` |
| `v-relilab` | Stand vom `RT_STAND` → live | Schnappschuss, dann `hubFetch('relilab-termine', …)` |
| `v-relidesk` | Nachbau · relidesk ohne Datenquelle | keine |
| `v-oercommunity` | Stand vom `OC_STAND` → live | Schnappschuss der Beiträge, dann `ocLaden()` |
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

## Inhalte aus Events

Das Schaufenster auf oer.community liegt als Events unter einem eigenen Schlüssel; im Code steht nur der npub (`FO_NPUB`, daraus `FO_HEX`). `ocLaden()` fragt einmal je Sitzung beide Relays (`wss://relay-rpi.edufeed.org`, `wss://relay.edufeed.org`) mit **einem** `REQ` je Relay und vier Filtern:

| Filter | Wert | Zweck |
|---|---|---|
| 1 | `{ kinds: [30023], authors: [FO_HEX], '#l': ['seite'], limit: 40 }` | Seiten (Beiträge mit Label `seite`) |
| 2 | `{ kinds: [30023], authors: [FO_HEX], limit: 40 }` | Beiträge |
| 3 | `{ kinds: [30004], authors: [FO_HEX], limit: 5 }` | Listen (Navigation, Fußzeile) |
| 4 | `{ kinds: [31923], authors: [FO_HEX], limit: 200 }` | Termine |

Je Adresse (`kind:pubkey:d`) gilt das Event mit dem neuesten `created_at`. Seiten sind `kind:30023` mit Tag `['l','seite',…]` (Schlüssel: `d`), alle übrigen `kind:30023` sind Beiträge, sortiert nach `published_at` (sonst `created_at`) absteigend; Termine sind nach `start` aufsteigend sortiert. Das Ergebnis `{ seiten, beitraege, listen, termine }` bleibt in `ocDaten`; spätere Aufrufe liefern es ohne Netz. Eine leere Antwort (Relays nicht erreichbar) wird nicht gehalten: der nächste Aufruf fragt erneut.

Der Bereich `#oercommunity/spielregeln` (Konstante `SPIELREGELN`) kennt vier Seiten mit den `d`-Namen `spielregeln-qualitaetskriterien`, `spielregeln-metadatenprofil`, `spielregeln-redaktion` und `spielregeln-ablaeufe`; das ist die Konvention für den Inhaltsstrang. Fehlt eine Seite auf dem Relay, steht dort „in Vorbereitung“ mit Verweis auf oer.community; die Stand-Zeile zählt `live · <k> von 4 Seiten`. `spielregelLink(d)` liefert die Route der Seite oder, wenn sie fehlt, die des Bereichs.

**Sicherheitsregel für `mdSeite(src)`:** Inhalte vom Relay sind fremder Text. Jede Zeile wird zuerst mit `esc()` maskiert, erst danach entsteht Auszeichnung (Überschriften eine Stufe tiefer, Absätze, Listen, Zitate, Fett, Kursiv, Code, Trennlinie). `href` und `src` gehen nur über `sichereUrl()` (nur `http(s)://`): ein Link mit anderer Adresse wird zum bloßen Text, ein Bild mit relativer oder unsicherer Adresse zu „Bild: <alt>“. Tabellen werden nicht erkannt, rohes HTML bleibt maskiert.

**Lizenzregel:** `lizenzLabel(url)` macht aus der Lizenzadresse ein Kürzel (`CC BY-SA 4.0`, `CC0 (Public Domain)`, bei Länderfassung `CC BY 3.0 DE`; `legalcode.de` und `deed.de` am Ende werden vorher abgeschnitten); Unbekanntes bleibt die Adresse. `lizenzStand(url)` ordnet in drei Werte ein:

| Wert | Adressen | erlaubt |
|---|---|---|
| `offen` | CC0, Public Domain Mark, CC BY, CC BY-SA | holen, weiterbearbeiten, sammeln |
| `geschuetzt` | CC mit NC oder ND, Wikipedia-Urheberrecht, Unsplash, Pixabay, Canva | ansehen, verlinken |
| `unbekannt` | leer oder nicht erkannt | gilt als geschützt: ansehen, verlinken |

### Verbraucher: Schaufenster

`#oercommunity` zeigt sofort den Schnappschuss (`ocRender(null)`: Beiträge aus `OC_RAW`/`OC_POSTS`, Tagungen und Team eingebettet) und rendert danach mit der Antwort von `ocLaden()` (`ocRender(daten)`); die Filter sind die von `ocLaden`, die Stand-Zeile wechselt auf „live · n Beiträge · m Seiten“, bei leerer Antwort bleibt sie beim Stand. Das Menü entsteht aus der Liste `navigation` (die `a`-Tags nennen `30023:<pubkey>:<d>`, Beschriftung ist der `title` der Seite, fehlende Seiten fallen weg), danach kommen Spielregeln, Blog und Team; die Fußzeile aus `fusszeile`. Ohne Liste bleiben die festen Knöpfe und Links. Die Route `#oercommunity/<d>` zeigt die Seite `d` als Artikel (`mdSeite`); fehlt eine bekannte Seite auf dem Relay, steht dort „in Vorbereitung“ mit Verweis auf oer.community, ein unbekanntes `d` führt zum Schaufenster mit Hinweis. Der Block `/* schnappschuss:beitraege */` (`OC_RAW`, `OC_STAND`) enthält die sechs neuesten Beiträge ohne Text und wird wie der Terminblock mit `deno task schnappschuss` erneuert.

### Verbraucher: Materialpool

`#materialpool` zeigt sofort die sechs Karten aus `MP` (Stand vom 22.10.2026) und rendert danach mit der Antwort von `mpLaden()`; `mpOpen(qs)` wird aus `route()` gerufen und liest die Vorauswahl (`thema`, `stufe`). Der Filter ist ein einziger: `{ kinds: [30142], limit: 200 }` auf allen drei Relays, ein REQ je Relay. Je Adresse (`pubkey:d`) gilt das neueste `created_at`. Die Karten zeigen die neuesten 24 nach `datum` (`datePublished`, sonst `dateCreated`, sonst `created_at`), jede Karte verweist auf `#materialpool?d=<d>`.

Suche und Vorauswahl nutzen dieselbe Regel (`mpPasst`): jeder Begriff muss ohne Groß-/Kleinschreibung in Titel, Beschreibung, Fach, Stufe, Art, Schlagworten, `t`-Tags oder `about:prefLabel:de` vorkommen. Ältere Events tragen Felder ohne `:id`; sie gelten als Rückfall (`feld` für `feld:id`, `feld:prefLabel` für `feld:prefLabel:de`).

Zählerregel: „n von m Materialien mit vollständigen Metadaten · live von k Relays“. m sind alle Materialien nach dem Zusammenführen, n die mit Name, Beschreibung, Lizenz, Materialart und Fach oder Stufe; k ist die Zahl der abgefragten Relays, weil `hubFetch` nicht meldet, welche geantwortet haben. Die Lizenzpille folgt `lizenzStand` (`offen`, `geschuetzt`, `unbekannt`); ohne Lizenzangabe steht „Lizenz nicht angegeben“.

Rückfall: Kommt keine Antwort, bleiben die sechs Karten, die Stand-Zeile „Stand vom 22.10.2026“ und die Fußzeile unverändert; eine leere Antwort wird nicht gehalten, der nächste Besuch fragt erneut.

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
