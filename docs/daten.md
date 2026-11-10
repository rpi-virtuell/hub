# Datenschicht: Live von den Relays, Schnappschuss als Rückfall

Umsetzung von [ADR-0006](adr/0006-live-daten-mit-rueckfall.md). Die Datenschicht steht im Anwendungsskript von `index.html` (letzter `<script>`-Block), direkt nach den Farbkonstanten.

## Relays und Grenzen

| Konstante | Wert | Bedeutung |
|---|---|---|
| `RELAYS` | `wss://relay.edufeed.org`, `wss://relay-rpi.edufeed.org`, `wss://amb-relay.edufeed.org` | die einzigen Relays, von denen der Hub liest; das Gruppen-Relay wird nie gelesen |
| `TIMEOUT_MS` | 8000 | eine Abfrage schließt spätestens nach 8 s, auch ohne `EOSE` |
| `MAX_CONN` | 3 | höchstens drei WebSockets gleichzeitig; weitere warten in einer Warteschlange |
| `RETRY_MS` | 60000 | innerhalb einer Minute liefert eine erneute Abfrage derselben Ansicht den Zwischenspeicher, ohne Netz |

Die Relays weisen Adressen ab, die viele Anfragen schnell hintereinander stellen. Deshalb gilt: ein `REQ` je Relay und Ansicht (alle Filter der Ansicht in einem `REQ`), nie eine Subscription je Eintrag. Einzige Ausnahme ist die Subscription für das Aktivitätsprotokoll (unten).

## Funktionen

- `hubFetch(name, filters, opts)` → `Promise<Event[]>`: sendet die Filter als ein `REQ` an jedes Relay aus `opts.relays` (Standard: alle `RELAYS`), sammelt `EVENT`s, dedupliziert nach `id` und schließt bei `EOSE` oder nach `TIMEOUT_MS`. Bei `NOTICE`, `CLOSED` oder Verbindungsfehler schließt der Socket, und das bis dahin Empfangene zählt. Das Versprechen löst immer auf, nie ab; im schlechtesten Fall mit `[]`. Das Ergebnis liegt in `sessionStorage` unter `relihub:<name>` als `{t, events}`; ist der Speicher gesperrt (privates Fenster), läuft alles ohne Zwischenspeicher.
- `hubAbonnieren(name, filters, opts)` → `{ schliessen() }` und `hubAbbestellen(name)`: dauerhafte Subscription, siehe „Subscription für das Protokoll“. Sie zählt nicht gegen `MAX_CONN`.
- `datenstand(viewId, zustand, info)`: schreibt die Stand-Zeile `<p class="stand">` der Ansicht: `live · <info>`, `Stand vom <info>` oder `Nachbau · <info>`.
- `npubToHex(npub)`: Bech32 nach NIP-19, liefert 64 Hex-Zeichen.
- `evToTermin(ev)`: NIP-52-Event (kind 31923) → Termin-Objekt der relilab-Ansicht (`id` aus dem `d`-Tag, Titel, Start, Ende, Kurztext aus `summary`, Ort, `t`-Tags, Bild und Anmeldelink aus `r` nur mit `http(s)://`, sonst leer (`sichereUrl`), Absender über `RT_SRC`, `naddr` und edufeed-Link).

## Zustände je Ansicht

Jede Ansicht außer der Startseite trägt direkt unter ihrer Kopfzeile eine Stand-Zeile und am `div.view` ihren Startwert in `data-stand="<zustand>:<info>"`. Beim Laden wird er einmal angewendet.

| Ansicht | Startwert | Datenquelle |
|---|---|---|
| `v-profil` | Nachbau · Persona Luca Beispiel | keine, Persona |
| `v-communities` | Stand vom 26.10.2026 · Texte teils Beispiel → live | eingebettete Liste, dann `cyLaden()` (Konten mit `kind:10222` aus `bzLaden()`); „live · <n> Communities · <m> Partner ohne Schlüssel“ |
| `v-oekosystem` | Nachbau · Gefüge laden → Stand vom (jüngstes Schnappschuss-Datum) → live | Schnappschüsse (`MP`, `RT_RAW`, `OC_RAW`, `CY`) ohne Kanten, dann `bzLaden()` und die Caches der anderen Ansichten |
| `v-mitmachen` | Nachbau · Protokoll verbinden → live · <n> Aktivitäten · <k> Kommentare · Protokoll verbunden mit <r> von 2 Relays (ohne Verbindung mit „· keine Live-Verbindung“); ohne Antwort „Nachbau · Relays nicht erreichbar“ | Quellen von `bzQuellen()`, Abfrage `mitmachen` (`pkLaden()`), Subscription `protokoll` |
| `v-community` | Nachbau · Beispielinhalte | Beispielinhalte (Beiträge, Chat), keine Datenquelle |
| `v-materialpool` | Stand vom 22.10.2026 → live | eingebettete Liste (`MP`), dann `mpLaden()` |
| `v-relilab` | Stand vom `RT_STAND` → live | Schnappschuss, dann `hubFetch('relilab-termine', …)` |
| `v-relidesk` | Nachbau · relidesk ohne Datenquelle | keine |
| `v-oercommunity` | Stand vom `OC_STAND` → live | Schnappschuss der Beiträge, dann `ocLaden()` |
| `v-rpi-virtuell` | Nachbau · Termine und News laden → live | `kalLaden()` (Abfrage `kalender`) und `hubFetch('rpi-virtuell-news', …)`, kein eigener Schnappschuss |
| `v-fortbildungen` | Stand vom `RT_STAND` (beim Laden aus der Konstante gesetzt) → live | Schnappschuss (`RT_RAW`), dann `kalLaden()` |
| `v-sammlung` | Nachbau · Materialien laden → live | `mpLaden()` und, bei gesetztem Community-Filter, `coLaden(hex)`; keine eigene Abfrage |
| `v-personen` | Stand vom 04.11.2026 · Teamseite, Personen-Liste fehlt → live | `peLaden()` (Abfrage `personen`, dann `personen:profile`) |
| `v-person` | Nachbau · Profil laden → live | `prOpen(qs)` (Abfrage `person:<hex>`); ohne Relay-Antwort „Nachbau · Relays nicht erreichbar“ |
| `v-community`, Tab Katalog | Nachbau · Beispielinhalte → live (nur im Tab Katalog) | `coLaden(hex)`; „live · <n> geteilt · <k> Listen“, „noch nichts geteilt“ oder „Nachbau · Relays nicht erreichbar“ |

Drei Zustände: **live** (Relay-Daten sind angekommen), **Stand vom …** (eingebetteter Schnappschuss, auch wenn das Relay schweigt, abweist oder nichts liefert), **Nachbau** (Ansicht ohne Datenquelle). Nichts wird als live ausgegeben, was nicht vom Relay kam.

## Erster Verbraucher: relilab-Termine

`rtOpen` zeigt sofort den Schnappschuss und fragt einmal je Sitzung `relay.edufeed.org` nach kind 31923 der drei Absender in `RT_SRC`, angelegt in den letzten 30 Tagen. Weil `since` auf `created_at` wirkt, liefert das Relay nur kürzlich angelegte oder geänderte Termine; früher angelegte, aber bevorstehende Termine fehlen in der Antwort. Deshalb wird gemischt, nicht ersetzt: Schnappschuss und Relay-Antwort werden je Adresse (`pubkey:d`) zusammengeführt, das neuere `created_at` gewinnt. Stand-Zeile und Fußnote zeigen dann `live · <k> vom Relay · <n> Termine`: `k` ist die Zahl der in dieser Sitzung vom Relay empfangenen Termine, `n` die Gesamtzahl nach dem Mischen (davon `n − k` höchstens aus dem Schnappschuss, Stand `RT_STAND`). Kommt nichts, bleibt `Stand vom <RT_STAND>`.

## Zweiter Verbraucher: rpi-virtuell (Fortbildungen und News)

`rvOpen(qs)` setzt den Tab (`?tab=material|fortbildungen|news`, unbekannte Werte fallen auf `material`) und holt einmal je Sitzung zweierlei:

| Quelle | Wert | Zweck |
|---|---|---|
| `kalLaden()` | Abfrage `kalender`, siehe „Verbraucher: Fortbildungskalender“ | Termine; der Tab zeigt nur die mit `terminLogik(ev) === 'institut'`, darunter steht der Link „Alle Fortbildungen, auch Laborformate ›“ (`#finden/fortbildungen`) |
| `hubFetch('rpi-virtuell-news', …)` | `{ kinds: [30023], authors: [<Hex von npub12jguy…05rr6j>], limit: 10 }` | die zehn neuesten Beiträge der News-Redaktion rpi-virtuell (der Schlüssel hat kein Profil, der Name steht im Code) |

Relays: `wss://relay.edufeed.org`, `wss://relay-rpi.edufeed.org` (nicht das AMB-Relay). Die Termine teilen sich die Abfrage mit dem Fortbildungskalender: Wer zuerst öffnet, löst sie aus, der andere nutzt dasselbe Ergebnis. Termine werden mit `evToTermin` umgesetzt, clientseitig auf `start ≥ jetzt` gefiltert, nach Start sortiert, die ersten 40 angezeigt; Absender ist der Name aus `KAL_QUELLEN`, sonst der gekürzte npub. News: Titel aus `title`, Datum aus `published_at` (sonst `created_at`), Zusammenfassung aus `summary`, Link `https://edufeed.org/<naddr>`.

Stand-Zeile: vor der Antwort `Nachbau · Termine und News laden`; mit Antwort `live · <n> Termine · <m> News` (`n` = bevorstehende Termine der Institute, `m` = News); ohne Antwort `Nachbau · Relay nicht erreichbar`, und die Tabs zeigen „Gerade keine Verbindung zu den Relays; die Termine stehen auch unter rpi-virtuell.de“ mit Link. Weil `since` auf `created_at` wirkt, fehlen Termine, die vor mehr als 365 Tagen angelegt und seitdem nicht geändert wurden.

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

## Community-Inhalte und Listen

Die fünf Hub-Communities (`CO_SCHLUESSEL`: rpi-virtuell, relilab, reliGlobal, ALPIKA Grundschule und der Schaufenster-Schlüssel FOERBICO) werden über `coLaden(hex)` geladen, einmal je Community und Sitzung (`coDaten`; eine leere Antwort wird nicht gehalten). `hex` ist der Community-Schlüssel, aus dem npub in der Konstante abgeleitet. Die Abfrage geht an alle drei Relays, je Relay ein REQ mit vier Filtern:

| Filter | Wert | Zweck |
|---|---|---|
| 1 | `{ kinds: [30142, 30023, 31923], '#h': [hex], limit: 150 }` | geteilte Materialien, Beiträge, Termine |
| 2 | `{ kinds: [6, 16], '#h': [hex], limit: 150 }` | Reposts: was die Community von anderen übernommen hat |
| 3 | `{ kinds: [30004], authors: [hex], limit: 20 }` | Kuratierungslisten der Community |
| 4 | `{ kinds: [1985], '#h': [hex], '#L': ['communikey.moderation'], authors: [hex], limit: 100 }` | Entfernen-Labels des Community-Schlüssels |
| 5 | `{ kinds: [0], authors: [hex], limit: 1 }` | Gesundheitsblick: das Profil des Community-Schlüssels belegt, dass die Relays geantwortet haben; es zählt nie als Inhalt. Eine leere Gesamtantwort heißt „keine Antwort“, eine Antwort nur mit dem Profil „noch nichts geteilt“ |

Der Schaufenster-Schlüssel (`eigene: true`) hat keine Community: seine Grundschicht sind die eigenen Events aus `ocLaden()` (Seiten, Beiträge, Termine); nur seine Listen holt `coLaden` mit einem eigenen Aufruf bei den zwei Relays des Schaufensters (`{ kinds: [30004], authors: [hex], limit: 20 }`).

**Entfernen-Labels (Annahme):** Die Labels (`kind:1985`, `l=remove`) tragen `h`- und `L`-Tags, wie im edufeed-Wikiartikel „Sharing and reading community content“ beschrieben. Tragen sie sie nicht, fragt Filter 4 sie nie ab und Entfernungen wirken nie.

**Konvention für Kataloge:** Eine Liste (`kind:30004`) mit `d=katalog` oder `d=katalog-<thema>` ist ein Katalog der Community; `katalog` steht zuerst, die übrigen nach `created_at` absteigend. `listeEintraege(ev)` liest Titel (`title`, sonst `d`), Beschreibung, Bild (über `sichereUrl`) und die `a`-Tags in Reihenfolge ohne Duplikate; ungültige Adressen (`aTagLesen` verlangt `kind:64-Hex:d`) werden nur gezählt (`unaufloesbar`). Je Adresse (`kind:pubkey:d`) gilt das Event mit dem neuesten `created_at`.

**Einträge und Reposts:** `coEintraege(daten)` führt direkte Events und Repost-Ziele zusammen (`repostZiel`: zuerst der erste gültige `a`-Tag, sonst der erste `e`-Tag mit 64 Hex), je Adresse ein Eintrag mit dem neuesten Zeitpunkt, neueste zuerst. Ein Repost-Ziel hat zunächst kein Event (`ev` ist `null`).

**Auflösung, Cache vor Netz:** `eintraegeAufloesen(eintraege)` sucht fehlende Ziele zuerst in `mpDaten` und `ocDaten`; was dann noch fehlt, geht in **einer** Abfrage (`aufloesen:<kurzHash>`, ein FNV-1a-Hash über die sortierte, vollständige Adressliste, damit verschiedene Listen nie denselben Cache-Schlüssel teilen) an die Relays: ein Filter nach Kind, Autoren und `#d` (eine Obermenge, die danach exakt auf die Adressen gefiltert wird, `limit` = Zahl der Adressen plus 10) und, bei `e`-Zielen, ein Filter mit `ids`. Je Eintrag gibt es keinen zweiten Aufruf. Was nicht gefunden wird, zeigt `eintragKarte` als „nicht auflösbar“, ohne Link.

**Regel ohne Rollenprüfung:** Die Rollen der Moderation stehen auf dem Gruppen-Relay, das der Hub nie liest. Deshalb zeigt der Hub, was mit dem `h`-Tag der Community geteilt wurde, und lässt nur weg, was der Community-Schlüssel selbst per `kind:1985` (`['l','remove','communikey.moderation']`, Ziel als `e`- oder `a`-Tag) entfernt hat (`entferntAus`); Labels anderer Absender zählen nicht.

**Grenze:** `limit` 150 je Art (Inhalt, Reposts) bei großen Communities; ältere Einträge fehlen dann in der Ansicht.

### Verbraucher: Schaufenster

`#oercommunity` zeigt sofort den Schnappschuss (`ocRender(null)`: Beiträge aus `OC_RAW`/`OC_POSTS`, Tagungen und Team eingebettet) und rendert danach mit der Antwort von `ocLaden()` (`ocRender(daten)`); die Filter sind die von `ocLaden`, die Stand-Zeile wechselt auf „live · n Beiträge · m Seiten“, bei leerer Antwort bleibt sie beim Stand. Das Menü entsteht aus der Liste `navigation` (die `a`-Tags nennen `30023:<pubkey>:<d>`, Beschriftung ist der `title` der Seite, fehlende Seiten fallen weg), danach kommen Spielregeln, Blog und Team; die Fußzeile aus `fusszeile`. Ohne Liste bleiben die festen Knöpfe und Links. Die Route `#oercommunity/<d>` zeigt die Seite `d` als Artikel (`mdSeite`); fehlt eine bekannte Seite auf dem Relay, steht dort „in Vorbereitung“ mit Verweis auf oer.community; antworten die Relays gar nicht, steht „Die Relays antworten gerade nicht.“ mit demselben Verweis, ein unbekanntes `d` führt zum Schaufenster mit Hinweis. Der Block `/* schnappschuss:beitraege */` (`OC_RAW`, `OC_STAND`) enthält die sechs neuesten Beiträge ohne Text und wird wie der Terminblock mit `deno task schnappschuss` erneuert.

### Verbraucher: Materialpool

`#materialpool` zeigt sofort die sechs Karten aus `MP` (Stand vom 22.10.2026) und rendert danach mit der Antwort von `mpLaden()`; `mpOpen(qs)` wird aus `route()` gerufen und liest die Vorauswahl (`thema`, `stufe`). Der Filter ist ein einziger: `{ kinds: [30142], limit: 200 }` auf allen drei Relays, ein REQ je Relay. Je Adresse (`pubkey:d`) gilt das neueste `created_at`. Die Karten zeigen die neuesten 24 nach `datum` (`datePublished`, sonst `dateCreated`, sonst `created_at`), jede Karte verweist auf `#materialpool?d=<d>&p=<pubkey>`. Events, deren `pubkey` nicht aus 64 Hex-Zeichen besteht (`istHex64`), verwirft `mpLaden`; `mpOpen` verwirft ein ungültiges `p` und sucht dann nur über `d`.

Suche und Vorauswahl nutzen dieselbe Regel (`mpPasst`): jeder Begriff muss ohne Groß-/Kleinschreibung in Titel, Beschreibung, Fach, Stufe, Art, Schlagworten, `t`-Tags oder `about:prefLabel:de` vorkommen. Ältere Events tragen Felder ohne `:id`; sie gelten als Rückfall (`feld` für `feld:id`, `feld:prefLabel` für `feld:prefLabel:de`).

Zählerregel: „n von m Materialien mit vollständigen Metadaten · abgefragt bei k Relays“. m sind alle Materialien nach dem Zusammenführen, n die mit Name, Beschreibung, Lizenz, Materialart und Fach oder Stufe; k ist die Zahl der abgefragten Relays, weil `hubFetch` nicht meldet, welche geantwortet haben. Die Lizenzpille folgt `lizenzStand` (`offen`, `geschuetzt`, `unbekannt`); ohne Lizenzangabe steht „Lizenz nicht angegeben“, bei einer Angabe, die nicht erkannt wird, die Angabe selbst und im Satz „Lizenz nicht erkannt“.

Rückfall: Kommt keine Antwort, bleiben die sechs Karten, die Stand-Zeile „Stand vom 22.10.2026“ und die Fußzeile unverändert; eine leere Antwort wird nicht gehalten, der nächste Besuch fragt erneut.

### Verbraucher: Fortbildungskalender

`#finden/fortbildungen?logik=labor|institut&merkmal=online|praesenz|anmeldung|kostenfrei&q=<Begriffe>&quelle=<npub>` (`merkmal` mehrfach) zeigt die bevorstehenden Termine aller Quellen; `route()` bildet `finden/fortbildungen` auf die Ansicht `v-fortbildungen` ab, `kaOpen(qs)` liest den Filter, zeigt sofort den Schnappschuss (`RT_RAW`, `Stand vom <RT_STAND>`) und ruft `kalLaden()`.

Abfrage `kalender` (`kalLaden()`, einmal je Sitzung, ein `REQ` je Relay an `relay.edufeed.org` und `relay-rpi.edufeed.org`, nie das AMB- oder Gruppen-Relay):

| Filter | Wert | Zweck |
|---|---|---|
| 1 | `{ kinds: [31923], authors: [<Labor-Quellen>], since: <jetzt − 120 Tage>, limit: 500 }` | Termine der Labor-Quellen (relilab); kürzeres Fenster, weil der Bot viele Termine anlegt, ältere bevorstehende trägt der Schnappschuss |
| 2 | `{ kinds: [31923], authors: [<übrige Quellen aus KAL_QUELLEN>], since: <jetzt − 365 Tage>, limit: 500 }` | Termine der Institute und Communities; eigene Grenze, damit das dichte Labor sie nicht verdrängt |
| 3 | `{ kinds: [31923], authors: [<bildung-kirchen.de>], since: <jetzt − 365 Tage>, limit: 50 }` | der Import dieser Quelle steht still; eigener kleiner Filter, nur zur Vollständigkeit |
| 4 | `{ kinds: [31923], '#h': [<Schlüssel der Hub-Communities>], limit: 200 }` | Termine, die einer Hub-Community zugeordnet sind (so kommen auch Termine unter persönlichen Schlüsseln, etwa die ptz-Termine, sobald sie einen `h`-Tag tragen) |

Die Antwort wird je Adresse (`pubkey:d`) mit dem Schnappschuss gemischt, das neuere `created_at` gewinnt; Ergebnis sind rohe Events. Ohne Antwort bleibt `Stand vom <RT_STAND>` stehen, und die nächste Öffnung versucht es erneut. Mit Antwort: `live · <n> Termine · <k> Quellen` (`n` = bevorstehende Termine nach dem Mischen, `k` = Zahl verschiedener Absender in der Relay-Antwort). Der Schlüssel der ptz-Termine ist kein Eintrag in `KAL_QUELLEN` (persönlicher Schlüssel).

Logikregel (`terminLogik`): `labor`, wenn die Quelle in `KAL_QUELLEN` die Logik `labor` trägt, ein `t`-Tag `relilab` (ohne Groß-/Kleinschreibung) da ist oder ein `h`-Tag dem relilab-Schlüssel gleicht; sonst `institut`, auch bei unbekannten Absendern, die über `h` kommen. Die Logik ist ein Merkmal, kein getrenntes Verzeichnis.

Merkmalregel (`terminMerkmale`): `online` ist `true`, wenn `location` Zoom, online, einen http(s)-Link, Teams, BBB oder Jitsi nennt, `false` bei anderer nicht-leerer `location`, sonst `null`; `anmeldung` ist `true` bei `registrationUrl` mit http(s), sonst `null`; `kostenfrei` ist `true` bei `price` mit Betrag 0, `false` bei Betrag über 0, sonst `null`. Eine fehlende Angabe ist keine Aussage: Der Merkmal-Filter lässt nur Termine mit der Angabe durch, ohne gesetzten Filter fällt kein Termin heraus, und die Karte schreibt „keine Angabe“.

Der Schnappschuss trägt alle Quellen; die relilab-Ansicht liest daraus nur ihre drei Schlüssel (`RT_RAW.filter(ev => RT_HEX[ev.pubkey])`), im Anfangszustand wie beim Mischen in `rtOpen`.

### Verbraucher: Sammlung

`#finden/sammlung?c=<community-id>&fach=<Begriff>&stufe=<Begriff>&lizenz=offen|geschuetzt|unbekannt&q=<Begriffe>` filtert die Materialien aus `mpLaden()`; `route()` bildet `finden/<sub>` auf die Ansicht `v-<sub>` ab, `saOpen(qs)` liest den Filter (`sammlungFilter`). Die Sammlung stellt keine eigene Abfrage: sie nutzt den Cache von `mpLaden()` und nur bei gesetztem Community-Filter den von `coLaden(hex)`; ist der Materialpool schon geladen, öffnet sie keine weitere Verbindung.

Filterregel (`sammlungPasst`): `fach` und `stufe` treffen, wenn ein `about:prefLabel:de` beziehungsweise `educationalLevel:prefLabel:de` ohne Groß-/Kleinschreibung gleich ist; `lizenz` vergleicht mit dem Lizenzstand; `q` nutzt `mpPasst`. Die Community trifft, wenn der Herausgeber der Schlüssel der Community ist oder `30142:<pubkey>:<d>` unter den mit ihr geteilten Einträgen steht (`coEintraege`, Rollen unprüft, wie beim Parameter `community` des WordPress-Plugins).

Bei gesetztem Community-Filter lädt die Sammlung geteilte Materialien, die nicht in der Pool-Liste stehen, einmal über `eintraegeAufloesen` nach (eine gebündelte Abfrage); sie landen nur in der Liste der Sammlung, `mpDaten` bleibt unverändert. Zähler und Treffer stimmen so überein; ein geteiltes Material, das auf keinem Relay mehr liegt, zählt nicht mit und steht in der Stand-Zeile („n geteilt, aber nicht auffindbar“).

Drei Ausgänge: **Teilen** kopiert die Adresse mit dem Filter. **Einbetten** erzeugt den Schnipsel `[amb_nostr_search …]` für WordPress (`shortcodeAus`; `fixed_level` und `fixed_subject` mit den Vokabular-Kennungen der gewählten Begriffe; die Lizenz hat im Plugin kein Attribut und steht als Kommentarzeile) und ein Kontextprofil als JSON (`kontextprofilAus`) für die Steuerkonsole. **Abonnieren** zeigt den Nostr-Filter als `REQ` (kinds 30142, bei Community `#h`, bei Suchbegriffen `search`); Fach, Stufe und Lizenz prüft die Seite selbst. „Als Nostr-Liste speichern“ ist ausgegraut, bis die Anmeldung mit Schlüssel da ist. Ein Feed zu einem beliebigen Filter braucht einen Server; der Prototyp hat keinen.

### Verbraucher: Katalog je Community

`#community?c=<id>&zu=katalog` (Alias `tab=katalog`, `zu` gewinnt) öffnet im Community-Raum den Tab „Katalog“; er steht auch im eingebetteten Raum der Instanzen. `katRender(c)` füllt den Platzhalter `#katRoot` und zeichnet zwei Schichten:

1. **In der Community geteilt** (Grundschicht): `coLaden(hex)` und `coEintraege` liefern die Einträge, `eintraegeAufloesen` holt die Ziele, `eintragKarte` zeichnet sie. Gruppiert nach Material (30142), Beiträge (30023) und Termine (31923); je Gruppe die neuesten zwölf Karten, der Knopf „mehr“ klappt den Rest auf. Termine zeigen nur bevorstehende, vergangene stehen als Zahl. Die Zeile „zuletzt geteilt am …“ nennt das Datum des neuesten Eintrags und die Grenze „ohne Rollenprüfung“.
2. **Vom Redaktionskreis zusammengestellt** (Kuratierung): je `kind 30004` des Community-Schlüssels mit `d = katalog` oder `katalog-<name>` ein Abschnitt mit Titel, Beschreibung, Bild (nur `http(s)`), „Stand vom <created_at>“, Zahl der Einträge, bei Bedarf „<u> nicht auflösbar“ (ungültige Adressen plus Ziele, die auf keinem Relay liegen) und eine Karte je Eintrag. „Teilen“ kopiert `nostr:naddr…` der Liste. Fehlt jede Liste, entfällt die Schicht.

Zustände: Lädt, noch nichts geteilt (mit Einladung und Link `https://edufeed.org/c/<npub>`), Relays antworten nicht (gleicher Link, Stand-Zeile „Nachbau · Relays nicht erreichbar“), Katalog mit Einträgen (Stand-Zeile „live · <n> geteilt · <k> Listen · ohne Rollenprüfung“). Communities ohne Eintrag in `CO_SCHLUESSEL` zeigen nur den Hinweis, dass Kataloge Communities mit eigenem Schlüssel vorbehalten sind. Auf allen anderen Tabs steht die Stand-Zeile wieder auf „Nachbau · Beispielinhalte“. Das Ergebnis wird je Community einmal je Sitzung gehalten, damit Neuzeichnen keine zweite Abfrage auslöst.

Konvention: Die Karte eines Materials führt zum Detail im Materialpool, Beiträge und Termine zur edufeed-App (Beiträge des Schaufenster-Schlüssels auf die eigene Seite). „Teilen“ kopiert die Adresse des Katalogs, „Einbetten“ den Shortcode `[amb_nostr_search community="<npub>"]` (`shortcodeAus`), der dieselben geteilten Materialien auf einer WordPress-Seite zeigt.

Materialpool: Für Communities mit `pool: true` (rpi-virtuell) steht zusätzlich der Abschnitt „Der Materialpool als Katalog der Instanz“ mit dem Zähler aus `mpLaden()` („<m> Materialien bei 3 Relays“) und dem Link `#materialpool`. Der Zähler kommt ohne eigene Abfrage aus der Pool-Liste.

Grenze der Rollenprüfung: Der Katalog zeigt, was mit der Community geteilt wurde (Tag `h` oder Repost mit `h`), ohne zu prüfen, ob der Teilende Mitglied oder Moderator ist. Weggelassen ist nur, was der Community-Schlüssel selbst per Label `remove` (kind 1985) entfernt hat. Eine Rollenprüfung kommt, sobald die Community-Konvention sie verbindlich festlegt.

### Verbraucher: Material-Detail

`#materialpool?d=<d>&p=<pubkey>` (`mpOpen` ruft `mpDetail(d, p)`, `p` nur bei 64 Hex-Zeichen, sonst `null`) blendet Hero und Abschnitte aus und zeigt ein Material. Cache vor Netz: `mpDetail` sucht zuerst in `mpDaten`, der Liste der Sitzung (läuft deren Abfrage noch, wird sie abgewartet); nur bei Fehlen folgt eine gezielte Abfrage `hubFetch('material:' + d + ':' + p, [{ kinds: [30142], '#d': [d], authors: [p], limit: 2 }])` (ohne `p` ohne `authors`), das neueste Event gilt; fehlt auch das, steht dort „Material nicht gefunden.“, wenn die Liste geantwortet hat, sonst „Gerade keine Verbindung zu den Relays oder Material nicht vorhanden.“, jeweils mit Weg zurück. Es gibt keine Subscription je Eintrag.

Die Felder Fach, Bildungsstufe, Art und Zielgruppe kommen aus `ambWerte(ev, feld)` (`feld:id` plus folgendes `feld:prefLabel:de`, ältere Events mit bloßem `feld`), je Wert ein Chip, der auf die Kennung im Vokabular verweist (`sichereUrl`, sonst ohne Link). Der Bildnachweis erscheint nur mit `image:license:id` oder `image:creator:name`.

Lizenzstand-Regel (`lizenzStand`, Aktionen aus `lizenzAktionen(stand, m)`): bei `offen` gehen alle sechs Aktionen (auf den Schreibtisch holen, in der Community weiterbearbeiten, in der Sammlung zeigen, ansehen, Link kopieren, empfehlen); bei `geschuetzt` und `unbekannt` (gilt als geschützt) gehen nur die letzten drei, die ersten drei bleiben sichtbar und ausgegraut („nur mit offener Lizenz“).

Rohdaten: `ambJsonLd(ev)` bildet das AMB-Objekt allein aus den Tags (Kontext `https://w3id.org/kim/amb/context.jsonld`); ein neues Objekt je Feld beginnt bei `feld:id`, bei `feld:name` oder `feld:type`, wenn das aktuelle Objekt den Schlüssel schon hat; `feld:prefLabel:<sprache>` wird zu `prefLabel: { <sprache>: … }`. Fehlende Felder fehlen, nichts wird ergänzt.

Prüf-Marker (Stufe B): Trägt das Event ein Tag `l` mit dem Wert `geprueft`, steht „Nach den Qualitätskriterien geprüft.“; sonst „Noch nicht nach den Qualitätskriterien geprüft.“ mit Link zu den Kriterien (`spielregelLink`). Bisher trägt kein Event das Tag, die Lücke bleibt sichtbar.

### Verbraucher: Personen

`#kooperieren/personen` zeigt nur Menschen, die in der Personen-Liste stehen. Die Liste ist ein `kind:30000` (Follow-Liste) mit `d=personen` und `p`-Tags; sie gilt als Einverständnis der Genannten, nie wird jemand allein wegen einer Community-Mitgliedschaft aufgeführt. Angenommen wird sie nur vom Schaufenster-Schlüssel oder vom Community-Schlüssel rpi-virtuell (`PERSONEN_LISTE.autoren`, beide beim Team); liegen beide vor, gewinnt das neuere `created_at`. Die Pflege der Liste ist Sache des Teams.

`peLaden()` fragt einmal je Sitzung in höchstens zwei Schritten: (1) `{kinds:[30000], authors:<feste Autoren>, '#d':['personen'], limit:2}` plus ein Gesundheitsblick (`kind:0` der Community-Schlüssel, `limit:5`), damit „Relays antworten nicht“ von „Liste noch nicht angelegt“ unterscheidbar ist; (2) nur wenn die Liste da ist: `{kinds:[0], authors:<p-Tags>}` und `{kinds:[30000], authors:<p-Tags>, '#d':['communities']}`. Es zählen nur gültige Hex-Schlüssel (`istHex64`), höchstens 150. Die Mitgliedschaften (`p`-Tags der Liste `d=communities`) werden über die Hex-Schlüssel von `CO_SCHLUESSEL` auf Namen abgebildet; unbekannte Communities zählen nicht.

`profilAus(ev)`: `name` aus `display_name` oder `name` (höchstens 80 Zeichen), ohne Namen kein Profil; `about` auf 160 Zeichen am Wortende gekürzt; `picture` und `website` über `sichereUrl`; `nip05` nur als `name@domain`; alle Texte über `esc`. Bot-Regel: Profile mit `"bot": true` stehen nicht in der Liste (auf der Profilseite mit Hinweis „automatisches Konto“); Profile mit Mastodon-Brücke erscheinen wie alle anderen.

Rückfall: Fehlt die Liste, zeigt die Seite die Teamseite aus dem Schaufenster (`OC_TEAM`, Schnappschuss, „Stand vom 04.11.2026“) mit dem Satz, dass die Liste noch nicht angelegt ist; antwortet gar kein Relay, steht stattdessen „Die Relays antworten gerade nicht.“. „Folgen“ ist bis zur Anmeldung mit Schlüssel ausgegraut. Stand-Zeile mit Liste: `live · <n> Personen · Liste vom <Datum>`.

### Verbraucher: Person

`#person?p=<npub>` zeigt Profil, Mitgliedschaften und Veröffentlichungen eines Schlüssels. `prOpen(qs)` prüft den npub (`npubToHex`, Rückprobe mit `bech32`; sonst „Kein gültiges Profil in der Adresse.“ mit Rückweg) und fragt in einer Abfrage je Relay `{kinds:[30142, 30023, 31923], authors:[<hex>], limit:30}`, bei nicht zwischengespeichertem Profil zusätzlich `kind:0` und `kind:30000` mit `d=communities` des Schlüssels. Ein weiterer Filter `{kinds:[0], authors:[<Schaufenster-Schlüssel>], limit:1}` ist der Gesundheitsblick. Liegt das Profil schon im Cache von `peLaden()`, entfallen die beiden Filter für `kind:0` und `kind:30000` des Schlüssels (der Gesundheitsblick bleibt). Die Veröffentlichungen laufen über `eintragKarte` (neueste 10 je Abschnitt Materialien, Beiträge, Termine; leere Abschnitte sagen „noch nichts veröffentlicht“). Antwort leer (auch der Gesundheitsblick fehlt): „Die Relays antworten gerade nicht.“ mit Rückweg, Stand-Zeile `Nachbau · Relays nicht erreichbar`; Gesundheitsblick da, aber kein Profil der Person: „Zu diesem Schlüssel liegt kein Profil vor.“. Stand-Zeile: `live · Profil vom <Datum>` oder `Nachbau · Profil nicht gefunden`. Die Persona-Ansicht `#profil` bleibt Nachbau und verweist auf die Personen.

Offen: Der Link „Bei edufeed ansehen“ (`https://edufeed.org/<npub>`) steht nur als Text, bis die Route der App für Profile geklärt ist.

## Beziehungsgefüge

Das Beziehungsgefüge verbindet Personen, Communities, Materialien und Beiträge sowie Termine zu einem Graphen (Entitäten `p:<hex>`, `c:<hex>`, `m:<kind>:<pk>:<d>`, `e:<kind>:<pk>:<d>`; Kanten ungerichtet). Verbraucher sind die Ansicht Ökosystem und die Communities-Liste (unten); weitere Ansichten lesen es.

**Quellen aus den Caches:** `bzQuellen()` sammelt ohne Netz, was die anderen Ansichten schon geholt haben: Materialpool (`mpDaten`), Beiträge, Seiten und Termine der Schaufenster-Schlüssel (`ocDaten`), die direkten Inhalte und Reposts je Community (`coLaden`), die Termine des Kalenders (`kalLaden`) und die Personen-Liste (`peDaten`). Fehlende Caches ergeben leere Listen.

**Eine Abfrage plus eine abhängige Profilabfrage:** `bzLaden()` holt, was die Caches nicht tragen, einmal je Sitzung in einem `REQ` je Relay (`relay.edufeed.org`, `relay-rpi.edufeed.org`): `{kinds:[30000], '#d':['communities'], limit:300}` (Mitgliedschaften), `{kinds:[10222], limit:60}` (Community-Konten), `{kinds:[0], authors:<Hex der Hub-Communities und der Kalender-Quellen, höchstens 60>, limit:60}` (deren Profile, weil `peLaden` nur die Personen der Liste kennt), `{kinds:[31925], limit:200}` (Zusagen) und `{kinds:[7], '#k':['30142','30023','31922','31923'], limit:200}` (Reaktionen). Eine leere Antwort wird nicht gehalten.

Nach der ersten Antwort fragt `bzLaden()` genau einmal nach Profilen (`hubFetch('beziehungen:profile', [{ kinds: [0], authors: <fehlende>, limit: 150 }])`, beide Relays): Absender der Mitgliedslisten mit einer bekannten Community sowie Absender von Zusagen und Reaktionen, ohne Schlüssel mit vorhandenem Profil, nur `istHex64`, höchstens 150. Die Ergebnisse gehen (neuestes je Schlüssel) in `bzDaten.profile`; bleibt die Antwort aus, gilt die erste Antwort unverändert. Personen erscheinen weiter nur mit Profilname und mindestens einer Kante.

**Kantenregeln** (`bzBauen(q)`, rein): je Adresse zählt das neueste `created_at`; Schlüssel ohne 64 Hex-Zeichen erzeugen weder Entität noch Kante; Schlüssel aus `q.communities` sind immer Communities.

| Quelle | Kante |
| --- | --- |
| Material, Beitrag, Termin | Inhalt und Autor |
| `h`-Tag eines Inhalts | Inhalt und jede genannte Community |
| `p`-Tag eines Termins | Termin und jede genannte Person |
| `kind:30000` `d=communities` | Absender und jede Community aus den `p`-Tags |
| Repost (6, 16) mit `h`-Tags | Ziel (über `repostZiel`, nur wenn das Ziel in den Quellen liegt) und jede Community aus den `h`-Tags |
| Zusage `31925` mit `status` `accepted` oder `tentative` | Ziel und Absender |
| Reaktion `7` mit Inhalt außer `-` | Ziel und Absender |

Das Ziel von Zusage und Reaktion ist der erste gültige `a`-Tag, sonst der erste `e`-Tag, der auf einen bekannten Inhalt zeigt. `bzPunkte` ordnet Personen (3 je Community, bis 5 für Materialien, bis 4 für Termine, 2 mit Profilbild, 100 für den Angemeldeten) und Communities (Zahl der Personen); das Profilbild kommt aus dem Feld `bild` der Entität, das die Ansicht aus `bzProfil` setzt.

**Regel ohne Rollenprüfung:** Kanten aus `h`-Tags gelten wie „geteilt“, ohne Rollenprüfung; das Gruppen-Relay wird nie gelesen. Mitgliedschaft allein macht niemanden in der Personen-Ansicht sichtbar.

**Grenze:** Zusagen und Reaktionen sind nur die neuesten 200 je Art; ältere Beziehungen fehlen im Gefüge.

### Verbraucher: Ökosystem

`#oekosystem?wahl=<id>&reihen=person,event,community,material` zeigt vier Reihen (Menschen, Termine, Communities, Materialien). `wahl` ist eine Entitäts-ID des Gefüges (maskiert mit `encodeURIComponent`), `reihen` die Reihenfolge der vier Reihen; Tauschknöpfe zwischen den Reihen und die Auswahl schreiben beides in die Route (ohne nach oben zu springen).

`ozOpen(qs)` zeigt sofort die Schnappschuss-Einträge (Materialien `MP`, Termine `RT_RAW`, Beiträge `OC_RAW`, Communities `CY`) ohne Kanten und ohne Personen, mit `Stand vom <jüngstes Datum>`. Dann läuft `Promise.all([mpLaden(), ocLaden(), kalLaden(), peLaden(), bzLaden(), …coLaden(<die fünf Schlüssel>)])`, danach `cyLaden()` (eine abhängige Nachfrage nach den Profilen der übrigen Community-Konten) und `bzBauen(bzQuellen())`. Neu geholt wird nur die Abfrage `beziehungen` (eine Verbindung je Relay); alles andere kommt aus den Caches der anderen Ansichten. Ein Lauf-Zähler verwirft späte Antworten.

| Zustand | Stand-Zeile | Hinweis |
| --- | --- | --- |
| vor der Antwort | `Stand vom <Datum>` | „Verbindungen werden geladen …“ |
| Antwort von `bzLaden` | `live · <n> Einträge · <k> Kanten · ohne Rollenprüfung` | – |
| keine Antwort | `Stand vom <Datum>` | „Verbindungen können gerade nicht geladen werden“, Schnappschuss ohne Kanten bleibt |

**Sichtbarkeit** (`ozSichtbar`): Personen nur mit Profilname und mindestens einer Kante (oder als der Angemeldete); Communities immer; Termine nur, wenn Ende oder Beginn nicht älter als ein Tag sind; Beiträge (`kind:30023`) nur mit Community-Bezug (eigene Kante oder Kante des Autors) oder mit Autor in der Personen-Liste; bei gesetztem Zuschnitt `HUB_C` nur Einträge mit Kante zu dieser Community oder von einem Autor mit dieser Kante. Profile kommen aus `bzProfil` (Personen-Ansicht, Beziehungsabfrage, Community-Konten); Personen, deren Profil keine der Quellen trägt, bleiben unsichtbar. Bilder nur über `sichereUrl`, alle Texte über `esc`.

**Reihen** (`ozReihe(i)`): ohne Auswahl Personen und Communities nach `bzPunkte`, Termine und Materialien mit Community-Bezug zuerst, dann Datum (Termine aufsteigend, Materialien absteigend), höchstens 80 je Reihe; mit Auswahl in den anderen Reihen die Nachbarn vom Typ der Reihe („<n> verbunden mit „<Name>““ oder „Keine Verbindung zu „<Name>““), in der Reihe ihres Typs als Fokuskarte. Die Auswahlzeile (`#ozAuswahl`) nennt Typ und Name, verlinkt „Bei edufeed ansehen ›“ und hebt die Auswahl mit ✕ oder Escape auf.

### Verbraucher: Communities (live)

`cyLaden()` liest einmal je Sitzung aus `bzDaten.communities` (`kind:10222`) und `bzDaten.profile`; Die Profile der Konten holt schon die abhängige Profilabfrage von `bzLaden` (Community-Konten stehen vorn); `cyLaden` stellt keine eigene Abfrage. `cyAus(ev, profil)` macht daraus einen Eintrag (`id` = Hex-Präfix 8, `hex`, Name und Beschreibung roh, Bild nur über `sichereUrl`, Mitglieder aus dem Gefüge). Bekannte Schlüssel (`CY_HEX`, Hex → Kennung) behalten die Kennung der eingebetteten Karte, damit `#community?c=<id>` weiter gilt; die RpiCommunity ist ausgeblendet (Entscheidung 04.11.2026), der Schaufenster-Schlüssel `oercommunity` hat keine `10222` und bleibt eingebettet.

`cyRender()` zeigt die Live-Einträge nach Mitgliederzahl, dahinter die eingebetteten Einträge ohne Schlüssel als Partnerkacheln (`cy-partner`, Hinweis „Partner ohne eigenen Schlüssel im Datenraum“, ohne Folgen-, Raum- und Katalog-Knopf). Stand-Zeile: `live · <n> Communities · <m> Partner ohne Schlüssel`; ohne Antwort bleibt der eingebettete Stand vom 26.10.2026. Live-Communities ohne eigene Karte im Hub öffnen im Ökosystem (`#oekosystem?wahl=c:<hex>`).

### Subscription für das Protokoll

`hubAbonnieren('protokoll', [{ kinds: PK_KINDS }], { relays, beiEvent, beiStatus })` ist die einzige dauerhafte Verbindung des Hubs. `PK_KINDS` = `30142, 30023, 31922, 31923, 31925, 7, 16, 30000, 1111, 1`. Regeln:

- **Eine Verbindung je Relay**, nur zu `relay.edufeed.org` und `relay-rpi.edufeed.org`; je Relay ein `REQ` mit den Filtern plus `since` = Startzeit der Subscription, also nur neue Events.
- **Wiederverbinden** nach einem Abbruch nach `4000 · (Versuch + 1)` ms, höchstens fünfmal je Relay; danach bleibt das Relay getrennt (die Stand-Zeile zählt die verbundenen Relays, ohne eine Verbindung steht „· keine Live-Verbindung“).
- **Derselbe Name ersetzt die vorige Subscription** (Halter `hubAbos`); `hubAbbestellen(name)` schließt und löscht. Es gibt nur den Namen `protokoll`; er gilt für die Sitzung (Verlassen der Ansicht schließt ihn nicht, Neuladen baut ihn neu auf).
- **Nie für Listen oder Inhalte**: Karten, Reihen und Detailansichten holen weiter über `hubFetch`.

Die Live-Events sammelt `pkLiveEvent` (`pkNeu`), nach 600 ms bündelt `pkBuendeln` sie in `pkLive`; `bzQuellen()` trägt sie nach (`bzDaten` und `coDaten` bleiben unverändert), das Gefüge wird neu gebaut und Ökosystem und Mitmachen werden neu gezeichnet. Neue Zeilen tragen die Klasse `neu`.

### Verbraucher: Mitmachen

`#mitmachen?c=<Community>` (Kennung, Hex oder `alle`; ohne Angabe gilt der Zuschnitt `HUB_C`) zeigt links das Protokoll (neueste 80 Zeilen mit relativer Zeit) und rechts die Gespräche. `pkRender(root, c)` zeichnet in eine beliebige Wurzel (relilab bindet den Raum als Tab mit `c=relilab` ein). Quellen: alle Events von `bzQuellen()` (Materialien, Beiträge, Termine, Reposts, Mitgliedslisten, Zusagen, Reaktionen), die Abfrage `mitmachen` und die Live-Events.

`pkLaden()` stellt einmal je Sitzung einen `REQ` je Relay (`relay.edufeed.org`, `relay-rpi.edufeed.org`) mit zwei Filtern: Kommentare `kinds: [1111]` mit `#K` in `30142, 30023, 31922, 31923` (limit 100) und kurze Beiträge `kinds: [1]` mit `#h` aus den fünf Community-Schlüsseln (limit 100). Eine leere Antwort wird nicht gehalten.

`pkEintrag(ev, gefuege)` macht aus einem Event eine Zeile `{ id, zeit, bezug, html }` oder `null`. Das Ziel eines Events kommt aus dem `a`- (oder `A`-) Tag, sonst aus dem `e`-Tag, jeweils nur, wenn es im Gefüge steht; ohne Ziel ergibt sich `null`, außer bei eigenen Inhalten und kurzen Beiträgen mit bekannter Community im `h`-Tag. `bezug` nennt alle verlinkten Entitäts-IDs und den Autor; der Community-Filter lässt eine Zeile zu, wenn `bezug` die Community oder eine mit ihr verbundene Entität enthält. Alle Texte laufen durch `esc`, Kommentare und Beiträge erscheinen als Text, nie als Markdown; Links führen nur auf Hub-Routen (`#oekosystem?wahl=…`, `#materialpool?d=…`, `#person?p=…`, `#community?c=…`).

| Zustand | Stand-Zeile |
| --- | --- |
| vor der Antwort | `Nachbau · Protokoll verbinden` |
| Antwort | `live · <n> Aktivitäten · <k> Kommentare · Protokoll verbunden mit <r> von 2 Relays` |
| Antwort, keine Verbindung der Subscription | wie oben mit Zusatz „· keine Live-Verbindung“ |
| keine Antwort | `Nachbau · Relays nicht erreichbar` („Die Relays antworten gerade nicht.“) |

Ohne Gespräche zeigt die rechte Spalte „Noch kein Gespräch zu Materialien, Terminen oder Beiträgen des Ökosystems. Der erste Kommentar entsteht in der edufeed-App.“ mit Link auf `https://edufeed.org`. Das Ökosystem zeigt über `#ozProtokoll` die neuesten acht Zeilen mit dem Link „Alle im Raum Mitmachen ›“.

### Verbraucher: relilab

Die Startseite `#relilab` zeigt das relilab als Labor (Issue 16): oben die sieben Kriterien `RL_KRITERIEN` als Pillen, darunter drei Spalten, unter ihnen bleibt der Monatskalender des Nachbaus. `rlLaden()` stellt einmal je Sitzung zusammen, ohne eigene Subscription: `coLaden(RL_HEX)` → `coEintraege` → `eintraegeAufloesen` liefert Materialien (`30142`) und Beiträge (`30023`); `kalLaden()` liefert die Termine, gezeigt werden die bevorstehenden mit `terminLogik(ev) === 'labor'` (höchstens 6, `termineZahl` zählt alle). Menschen sind die Autoren dieser Inhalte ohne die Community-Schlüssel und die Kalenderquellen (`KAL_HEX`) (höchstens 40 Schlüssel); wer in der Personen-Liste steht, kommt zuerst. Ihre Profile kommen aus `bzProfil`, fehlende in **einer** Abfrage `relilab:menschen` (`kinds: [0]`, `authors`); gezeigt werden nur Profile mit Namen, Bots bleiben draußen. Eine leere Antwort wird nicht gehalten.

| Spalte | Inhalt | Link |
| --- | --- | --- |
| Materialien | neueste 6 über `eintragKarte` | „Alle im Katalog ›“ nach `#community?c=relilab&zu=katalog` |
| Menschen | Profilkarten (Bild oder Initiale, Name, `about`) | `#person?p=<npub>` |
| Mitmachen | nächste 6 Labortermine | „Alle Labortermine ›“ nach `#finden/fortbildungen?logik=labor`, „Zum Raum Mitmachen ›“ nach `#relilab?tab=mitmachen` |

Stand-Zeile: `live · <m> Materialien · <p> Menschen · <t> Labortermine`; vor der Antwort und ohne Antwort bleibt `Stand vom <Datum des Schnappschusses>` (die Termine der dritten Spalte kommen dann aus dem Schnappschuss). `#relilab?tab=mitmachen` bindet den Raum Mitmachen mit festem Zuschnitt ein (`pkRender` mit `data-pkfest="relilab"`, Hinweis „Zuschnitt: relilab“, keine Auswahl). Die Konsole im relilab führt `kooperieren.personen` nach `#relilab?zu=menschen` (Scroll auf die Spalte Menschen).

## Zuschnitt

Der ganze Hub lässt sich auf eine Community zuschneiden: `https://hub.rpi-virtuell.net/?c=<npub>#start`. `c` ist ein npub oder ein 64-stelliger Hex-Schlüssel (`zuschnittAus`). Der Zuschnitt (`HUB_C`, Hex) kommt aus der Adresse, sonst aus der Sitzung (`sessionStorage`, Schlüssel `relihub-c`); `zuschnittSetzen(hex)` schreibt Zustand, Sitzung und den Suchparameter `c`, setzt die Leiste und die Konsolen neu und zeichnet die Ansicht; `zuschnittSetzen(null)` hebt auf. Der Suchparameter `c` steht vor dem `#` und bleibt beim Routenwechsel erhalten. Der Zuschnitt öffnet keine eigene Abfrage und keine Subscription: Die Ansichten lesen `HUB_C` aus den Daten, die sie ohnehin holen.

| Ansicht | Wirkung |
|---|---|
| Startseite | Kachel der Community oben, Satz „Dieser Hub ist auf <Name> zugeschnitten.“ mit Aufheben |
| Sammlung (`#finden/sammlung`) | Filter „Community“ vorbelegt, falls die Community eine Kennung im Hub hat; „Alle“ bleibt wählbar |
| Fortbildungen (`#finden/fortbildungen`) | Termine der Community (Absender oder `#h`) zuerst, Chip „nur <Name>“ |
| Community-Raum (`#community`) | ohne `c` gilt der Zuschnitt; Communities nur mit Schlüssel (npub oder Hex) führen ins Ökosystem |
| Personen (`#kooperieren/personen`) | von der Personen-Liste nur, wer im Beziehungsgefüge mit der Community verbunden ist; Satz „Zuschnitt: <Name>“ (eine zwischengespeicherte Abfrage des Gefüges) |
| Ökosystem, Mitmachen | der Zuschnitt setzt den Rahmen: nur, was mit der Community verbunden ist (`ozSichtbar`, `pkPasst`) |
| Steuerkonsole | `finden.material`, `finden.fortbildungen` und `kooperieren.communities` tragen den Parameter `c` |
| Leiste | abwählbare Markierung „Zuschnitt: <Name>“ (`kind: 'zuschnitt'`), Knopf „Zuschnitt aufheben“ im Panel „Leiste anpassen“ |

Die Seite `#eigene-instanz?c=<npub>` zeigt die Vorschau (zweite Steuerkonsole und Leiste, Kontext `vorschau-<hex>`) und vier Schnipsel zum Kopieren: den Link, das Kontextprofil (`kontextprofilAus`, Feld `c`), den WordPress-Shortcode (`shortcodeAus`) und den Hinweis auf den White-Label-Betrieb der edufeed-App. Sie zeigt keine Relay-Daten außer den Namen der Communities (Stand-Zeile „Nachbau · Vorschau“).

## Schnappschuss erneuern

```bash
deno task schnappschuss
```

`tools/schnappschuss.ts` sendet die Termin-Abfrage in drei `REQ` nacheinander (3 s Pause) an `relay.edufeed.org`: (a) die drei relilab-Schlüssel, (b) die übrigen Quellen außer bildung-kirchen.de, (c) bildung-kirchen.de mit `limit: 50`, je `{"kinds":[31923],"authors":[…Hex-Schlüssel…]}` (die Konstante `ABSENDER` mit den 14 Quellen spiegelt `KAL_QUELLEN` in `index.html`; beide gemeinsam ändern); je Gruppe wartet es bis `EOSE` (höchstens 25 s) und gibt Zahl und bei 500 Events „Grenze erreicht“ aus, führt alles zusammen, behält Termine, die noch laufen oder höchstens 30 Tage vorbei sind, kürzt die Events auf `id, pubkey, created_at, kind, tags, content` (`content` leer, wenn ein `summary`-Tag da ist), maskiert `<` als `\u003c` (damit kein `</script>` aus Relay-Inhalten das Skript beendet), sortiert nach `created_at`, dedupliziert nach `id` und schreibt den Block zwischen `/* schnappschuss:termine */` und `/* /schnappschuss:termine */` in `index.html` neu (`RT_RAW` und `RT_STAND` mit dem heutigen Datum). Ausgabe: `<n> Termine, Stand <Datum>`. Liefert das Relay nichts, bleibt die Datei unverändert und das Skript endet mit Code 1.

Vor jeder Vorführung erneuern, damit der Rückfall nicht veraltet. Der Schnappschuss ist spätestens alle 120 Tage zu erneuern, sonst fehlen Labortermine, die älter als das Live-Fenster sind. Nicht in schneller Folge wiederholen (Adresssperre der Relays).

## Grenzen

- Das Relay liefert je `REQ` höchstens etwa 500 Events (neueste zuerst). Das Skript meldet je Gruppe „Grenze erreicht“; früher angelegte Termine können dann fehlen.
- Die Live-Abfrage der relilab-Termine holt nur in den letzten 30 Tagen angelegte Termine; ältere kommen aus dem Schnappschuss. Der Fortbildungskalender fragt für die Institute 365 Tage zurück, für die Labor-Quellen 120 Tage (ältere bevorstehende Labortermine kommen aus dem Schnappschuss), in zwei Gruppen mit je höchstens 500 Events; der stillstehende Import bildung-kirchen.de hat einen eigenen Filter mit höchstens 50. Erreicht eine Gruppe die 500 in der Antwort, hängt die Stand-Zeile „· Relay-Grenze erreicht, ältere Termine können fehlen“ an.
- Löschungen (kind 5) werden nicht ausgewertet; ein gelöschter Termin bleibt bis zum nächsten Schnappschuss sichtbar.
- Live sind bisher die relilab-Termine, der Fortbildungskalender und die Ansicht rpi-virtuell (Fortbildungen, News). Die übrigen Ansichten zeigen ihren eingebetteten Stand oder sind als Nachbau gekennzeichnet.
