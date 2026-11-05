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
| `v-rpi-virtuell` | Nachbau · Termine und News laden → live | `kalLaden()` (Abfrage `kalender`) und `hubFetch('rpi-virtuell-news', …)`, kein eigener Schnappschuss |
| `v-fortbildungen` | Stand vom `RT_STAND` → live | Schnappschuss (`RT_RAW`), dann `kalLaden()` |

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

Der Schaufenster-Schlüssel (`eigene: true`) hat keine Community: seine Grundschicht sind die eigenen Events aus `ocLaden()` (Seiten, Beiträge, Termine); nur seine Listen holt `coLaden` mit einem eigenen Aufruf bei den zwei Relays des Schaufensters (`{ kinds: [30004], authors: [hex], limit: 20 }`).

**Konvention für Kataloge:** Eine Liste (`kind:30004`) mit `d=katalog` oder `d=katalog-<thema>` ist ein Katalog der Community; `katalog` steht zuerst, die übrigen nach `created_at` absteigend. `listeEintraege(ev)` liest Titel (`title`, sonst `d`), Beschreibung, Bild (über `sichereUrl`) und die `a`-Tags in Reihenfolge ohne Duplikate; ungültige Adressen (`aTagLesen` verlangt `kind:64-Hex:d`) werden nur gezählt (`unaufloesbar`). Je Adresse (`kind:pubkey:d`) gilt das Event mit dem neuesten `created_at`.

**Einträge und Reposts:** `coEintraege(daten)` führt direkte Events und Repost-Ziele zusammen (`repostZiel`: zuerst der erste gültige `a`-Tag, sonst der erste `e`-Tag mit 64 Hex), je Adresse ein Eintrag mit dem neuesten Zeitpunkt, neueste zuerst. Ein Repost-Ziel hat zunächst kein Event (`ev` ist `null`).

**Auflösung, Cache vor Netz:** `eintraegeAufloesen(eintraege)` sucht fehlende Ziele zuerst in `mpDaten` und `ocDaten`; was dann noch fehlt, geht in **einer** Abfrage (`aufloesen:…`) an die Relays: ein Filter nach Kind, Autoren und `#d` (eine Obermenge, die danach exakt auf die Adressen gefiltert wird, `limit` = Zahl der Adressen plus 10) und, bei `e`-Zielen, ein Filter mit `ids`. Je Eintrag gibt es keinen zweiten Aufruf. Was nicht gefunden wird, zeigt `eintragKarte` als „nicht auflösbar“, ohne Link.

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
| 3 | `{ kinds: [31923], '#h': [<Schlüssel der Hub-Communities>], limit: 200 }` | Termine, die einer Hub-Community zugeordnet sind (so kommen auch Termine unter persönlichen Schlüsseln, etwa die ptz-Termine, sobald sie einen `h`-Tag tragen) |

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
2. **Vom Redaktionskreis zusammengestellt** (Kuratierung): je `kind 30004` des Community-Schlüssels mit `d = katalog` oder `katalog-<name>` ein Abschnitt mit Titel, Beschreibung, Bild (nur `https`), „Stand vom <created_at>“, Zahl der Einträge, bei Bedarf „<u> nicht auflösbar“ (ungültige Adressen plus Ziele, die auf keinem Relay liegen) und eine Karte je Eintrag. „Teilen“ kopiert `nostr:naddr…` der Liste. Fehlt jede Liste, entfällt die Schicht.

Zustände: Lädt, noch nichts geteilt (mit Einladung und Link `https://edufeed.org/c/<npub>`), Relays antworten nicht (gleicher Link, Stand-Zeile „Nachbau · Relays nicht erreichbar“), Katalog mit Einträgen (Stand-Zeile „live · <n> geteilt · <k> Listen · ohne Rollenprüfung“). Communities ohne Eintrag in `CO_SCHLUESSEL` zeigen nur den Hinweis, dass Kataloge Communities mit eigenem Schlüssel vorbehalten sind. Auf allen anderen Tabs steht die Stand-Zeile wieder auf „Nachbau · Beispielinhalte“. Das Ergebnis wird je Community einmal je Sitzung gehalten, damit Neuzeichnen keine zweite Abfrage auslöst.

Konvention: Die Karte eines Materials führt zum Detail im Materialpool, Beiträge und Termine zur edufeed-App (Beiträge des Schaufenster-Schlüssels auf die eigene Seite). „Teilen“ kopiert die Adresse des Katalogs, „Einbetten“ den Shortcode `[amb_nostr_search community="<npub>"]` (`shortcodeAus`), der dieselben geteilten Materialien auf einer WordPress-Seite zeigt.

Materialpool: Für Communities mit `pool: true` (rpi-virtuell) steht zusätzlich der Abschnitt „Der Materialpool als Katalog der Instanz“ mit dem Zähler aus `mpLaden()` („<m> Materialien bei 3 Relays“) und dem Link `#materialpool`. Der Zähler kommt ohne eigene Abfrage aus der Pool-Liste.

Grenze der Rollenprüfung: Der Katalog zeigt, was mit der Community geteilt wurde (Tag `h` oder Repost mit `h`), ohne zu prüfen, ob der Teilende Mitglied oder Moderator ist. Weggelassen ist nur, was der Community-Schlüssel selbst per Label `remove` (kind 1985) entfernt hat. Eine Rollenprüfung kommt, sobald die Community-Konvention sie verbindlich festlegt.

### Verbraucher: Material-Detail

`#materialpool?d=<d>&p=<pubkey>` (`mpOpen` ruft `mpDetail(d, p)`, `p` nur bei 64 Hex-Zeichen, sonst `null`) blendet Hero und Abschnitte aus und zeigt ein Material. Cache vor Netz: `mpDetail` sucht zuerst in `mpDaten`, der Liste der Sitzung (läuft deren Abfrage noch, wird sie abgewartet); nur bei Fehlen folgt eine gezielte Abfrage `hubFetch('material:' + d + ':' + p, [{ kinds: [30142], '#d': [d], authors: [p], limit: 2 }])` (ohne `p` ohne `authors`), das neueste Event gilt; fehlt auch das, steht dort „Material nicht gefunden.“, wenn die Liste geantwortet hat, sonst „Gerade keine Verbindung zu den Relays oder Material nicht vorhanden.“, jeweils mit Weg zurück. Es gibt keine Subscription je Eintrag.

Die Felder Fach, Bildungsstufe, Art und Zielgruppe kommen aus `ambWerte(ev, feld)` (`feld:id` plus folgendes `feld:prefLabel:de`, ältere Events mit bloßem `feld`), je Wert ein Chip, der auf die Kennung im Vokabular verweist (`sichereUrl`, sonst ohne Link). Der Bildnachweis erscheint nur mit `image:license:id` oder `image:creator:name`.

Lizenzstand-Regel (`lizenzStand`, Aktionen aus `lizenzAktionen(stand, m)`): bei `offen` gehen alle sechs Aktionen (auf den Schreibtisch holen, in der Community weiterbearbeiten, in Sammlung aufnehmen, ansehen, Link kopieren, empfehlen); bei `geschuetzt` und `unbekannt` (gilt als geschützt) gehen nur die letzten drei, die ersten drei bleiben sichtbar und ausgegraut („nur mit offener Lizenz“).

Rohdaten: `ambJsonLd(ev)` bildet das AMB-Objekt allein aus den Tags (Kontext `https://w3id.org/kim/amb/context.jsonld`); ein neues Objekt je Feld beginnt bei `feld:id`, bei `feld:name` oder `feld:type`, wenn das aktuelle Objekt den Schlüssel schon hat; `feld:prefLabel:<sprache>` wird zu `prefLabel: { <sprache>: … }`. Fehlende Felder fehlen, nichts wird ergänzt.

Prüf-Marker (Stufe B): Trägt das Event ein Tag `l` mit dem Wert `geprueft`, steht „Nach den Qualitätskriterien geprüft.“; sonst „Noch nicht nach den Qualitätskriterien geprüft.“ mit Link zu den Kriterien (`spielregelLink`). Bisher trägt kein Event das Tag, die Lücke bleibt sichtbar.

## Schnappschuss erneuern

```bash
deno task schnappschuss
```

`tools/schnappschuss.ts` sendet ein `REQ` mit `{"kinds":[31923],"authors":[…14 Hex-Schlüssel…]}` (die Konstante `ABSENDER` spiegelt `KAL_QUELLEN` in `index.html`; beide gemeinsam ändern) an `relay.edufeed.org`, wartet bis `EOSE` (höchstens 25 s), behält Termine, die noch laufen oder höchstens 30 Tage vorbei sind, kürzt die Events auf `id, pubkey, created_at, kind, tags, content` (`content` leer, wenn ein `summary`-Tag da ist), maskiert `<` als `\u003c` (damit kein `</script>` aus Relay-Inhalten das Skript beendet), sortiert nach `created_at`, dedupliziert nach `id` und schreibt den Block zwischen `/* schnappschuss:termine */` und `/* /schnappschuss:termine */` in `index.html` neu (`RT_RAW` und `RT_STAND` mit dem heutigen Datum). Ausgabe: `<n> Termine, Stand <Datum>`. Liefert das Relay nichts, bleibt die Datei unverändert und das Skript endet mit Code 1.

Vor jeder Vorführung erneuern, damit der Rückfall nicht veraltet. Nicht in schneller Folge wiederholen (Adresssperre der Relays).

## Grenzen

- Das Relay liefert je `REQ` höchstens etwa 500 Events (neueste zuerst). Das Skript meldet, wenn die Grenze erreicht ist; früher angelegte Termine können dann fehlen.
- Die Live-Abfrage der relilab-Termine holt nur in den letzten 30 Tagen angelegte Termine; ältere kommen aus dem Schnappschuss. Der Fortbildungskalender fragt für die Institute 365 Tage zurück, für die Labor-Quellen 120 Tage (ältere bevorstehende Labortermine kommen aus dem Schnappschuss), in zwei Gruppen mit je höchstens 500 Events; der stillstehende Import bildung-kirchen.de hat einen eigenen Filter mit höchstens 50. Erreicht eine Gruppe die 500 in der Antwort, hängt die Stand-Zeile „· Relay-Grenze erreicht, ältere Termine können fehlen“ an.
- Löschungen (kind 5) werden nicht ausgewertet; ein gelöschter Termin bleibt bis zum nächsten Schnappschuss sichtbar.
- Live sind bisher die relilab-Termine, der Fortbildungskalender und die Ansicht rpi-virtuell (Fortbildungen, News). Die übrigen Ansichten zeigen ihren eingebetteten Stand oder sind als Nachbau gekennzeichnet.
