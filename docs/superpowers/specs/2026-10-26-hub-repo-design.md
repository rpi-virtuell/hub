# Repo „hub“: reli_hub auf dem Unterbau der edufeed-App **FIXME (Ludger): Unterbau**

Entwurf vom 26.10.2026, Gespräch Jörg Lohrer / Claude, überarbeitet von Jörg und Ludger am 26.10.
Ludgers verbliebene Anmerkung steht als **FIXME (Ludger)** an der betreffenden Stelle; die übrigen
Anmerkungen sind durch die Überarbeitung erledigt. Dieses Dokument wandert mit dem ersten Commit
in das neue Repo nach `docs/superpowers/specs/2026-10-26-hub-repo-design.md`.

## Absicht

Der reli_hub bekommt ein eigenes Repo und eine eigene Auslieferung auf `hub.rpi-virtuell.net`. Er ist
kein Nachbau neben der edufeed-App, sondern ein Fork von ihr: Login, Communities, Kalender, Editoren,
Profile, Kommentare kommen aus dem edufeed-Code und bleiben dort in Entwicklung. Der Hub baut darauf
das Gesicht aus Jens Dechows Prototyp: Startseite mit Steuerkonsole, persönlicher Startplatz,
Ökosystem-Kacheln, und die Steuerkonsole als einbettbares Skript für Partnerseiten.

Warum so: Die Communities wollen „keine weiteren Plattform-Silos“ (digiLL-Tagung 2026), und Steffens
Module sollen nicht zweimal gepflegt werden. Jörg hat auf die edufeed-Subdomains keinen Zugriff, die
Auslieferung muss daher auf eigener Domain laufen. Jörgs Vorgabe für die Beziehung zum edufeed-Code:
Änderungen dort werden **strukturell** übernommen, nicht von Hand pro Änderung.

## Ziele

1. `hub.rpi-virtuell.net` zeigt die Hub-Startseite aus dem Prototyp; dahinter läuft die edufeed-App
   mit Hub-Marke.
2. Jeder Push auf `main` im Forgejo-Repo baut und liefert automatisch über Woodpecker auf den
   Hetzner-Server aus (Container-Host `46.225.82.96`, auf dem oer-community und Materialpool laufen).
3. Steffens `main` fließt ohne Handarbeit in den Hub: ein Pipeline-Lauf holt ihn herein und baut.
   Konflikte sind auf die wenigen Dateien begrenzt, die der Hub bewusst verändert. Hier ist auf
   Disziplin zu achten, diese architektonische Grundentscheidung zuverlässig als Grundmechanik simpel
   und einfach zu halten und hier keine Komplexitäten entstehen zu lassen. Immer sauber trennen!
4. Entwurf und Umsetzung laufen zweigleisig: Jens entwirft weiter als Klick-Prototyp in einer
   HTML-Datei im FOERBICO-Repo, die Svelte-App setzt um und verweist auf diese Genese.

## Nicht-Ziele

- Keine Nachbauten von Materialpool, relilab oder relidesk im Hub. Das sind echte Seiten, die
  Steuerkonsole verlinkt dorthin.
- Keine Änderung an Steffens Repo in diesem Vorhaben. Vorschläge nach oben sind erwünscht, aber ein
  eigener Schritt.
- Kein eigener Spiegel, keine eigene Relay-Infrastruktur. Der Hub liest über die edufeed-Loader von
  den edufeed-Relays.
- Keine Mehrsprachigkeit der Hub-Texte in der ersten Stufe.

## Rahmenbedingungen, geprüft am 26.10.2026

**edufeed-App** (lokal `~/repositories/edufeed-app`, Stand `main` 49986bad, 13:53 Uhr, v0.10.0-rc.4):

- SvelteKit 2, Svelte 5, Tailwind 4, DaisyUI, Applesauce für Nostr, paraglide für Texte, Node 22,
  pnpm 10.28, Lizenz AGPL-3.0-only, `private: true` (kein Paket, nur App).
- Upstream `https://relay.ngit.dev/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma/edufeed-app.git`,
  per `git ls-remote` über normales HTTPS erreichbar, also auch aus Woodpecker.
- Alles Instanzspezifische läuft über Umgebungsvariablen (`.env.example`, 118 Schlüssel):
  `APP_NAME`, `APP_LOGO`, `THEME_DEFAULT_*`, `RELAYS`, `CALENDAR_RELAYS`, `COMMUNIKEY_RELAYS`,
  `CALENDAR_FEATURED_AUTHORS`, `SIGNUP_SUGGESTED_COMMUNITIES`, `IMPRINT_*`, `LANDING_*`,
  `FOOTER_FUNDING_TEXT`, `NPUB_LOGIN_ENABLED`, `GOOGLE_LOGIN_ENABLED` und mehr.
- Startseite `src/routes/+page.svelte` hat 26 Zeilen: abgemeldet `LandingContent`, angemeldet
  Weiterleitung nach `/c/`. Das ist der eine Ort, den der Hub ersetzt.
- Wurzel-Layout `src/routes/+layout.svelte` hat 638 Zeilen und wird von Steffen laufend geändert.
- `Dockerfile` zweistufig, Build braucht `NODE_OPTIONS=--max-old-space-size=6144`, Laufzeit Port 3000,
  Healthcheck auf `/`. Steffens `docker-compose.yml` hängt an Traefik (externes Netz, kein `ports:`)
  und reicht nur rund 45 der 118 Schlüssel durch; für den Hub ist sie nicht nutzbar. Im Hub nutzen wir
  Podman statt Docker.
- `.gitignore` ignoriert `.env.*` bis auf `.env.example` und `.env.test`.
- Steffens eigene CI führt `check`, `lint` und `test` nicht aus (nur Docker-Build und Smoke-Test).
  Ein beliebiger Upstream-Stand ist also nicht garantiert grün. `main` ist seine Arbeitslinie.
- Ein DaisyUI-Theme `rpi` (RPI-Blau, Orange) existiert bereits in `app.css`, wählbar über
  `THEME_DEFAULT_LIGHT=rpi`. `/discover?type=people` existiert als Personenverzeichnis.
- `.forgejo/workflows/docker-build.yml` baut bei Steffen ein Image. In unserem Forgejo dürfen Actions
  für das Repo nicht aktiv sein, sonst läuft dieser Workflow dort ins Leere.
- Vorhandene Komponenten, die der Hub nutzt: `LoginModal` (Bunker, npub, Schlüssel), `/communities`,
  `/c/[pubkey]`, `/calendar`, `/create/resource`, `/create/article`, `/p/[pubkey]`, Kommentare,
  Reaktionen, `useProfileMap`, Loader-/Model-Muster laut `CLAUDE.md` der App.

**CI und Server:**

- Woodpecker auf `woody.git.rpi-virtuell.de`, Zugang nur mit Forgejo-Login, Secrets pro Repo im
  Woodpecker. Lehren aus Issue 871: `ssh-keyscan -t rsa`, `-4`, `BatchMode=yes`; ein Push, der nur
  `.woodpecker/` ändert, löst keine Pipeline aus. Ludger ist CI-Verantwortlicher.
- Woodpecker baut bereits `oer-community.rpi-virtuell.net` und `material.rpi-virtuell.net`: Pipeline
  mit `node:24-alpine` (`pnpm install`, `check`, `test`, `build`), dann `appleboy/drone-ssh` mit
  `~/ServerSetup/scripts/deploy-app.sh <name>` (Konvention: Name wie Subdomain). Das Skript zieht das
  Server-Repo per `git pull`, synchronisiert eine git-freie Kopie und baut das Image aus dem
  `Dockerfile` mit Podman. Der Deploy-Schlüssel darf auf dem Server nur dieses Skript ausführen.
  Eingerichtet von Ludger (oer-community PR 3, 08.09.2026), beschrieben in
  `Materialpool-Entwicklung/docs/betrieb.md`.
- Beide Seiten laufen auf dem Container-Host `46.225.82.96` (Hetzner) hinter Apache (`ProxyPass`,
  daher `ORIGIN` in der `.env` zwingend). Jörg hat Root und SSH.
- `hub.rpi-virtuell.net` ist heute noch ein CNAME auf `rpi-virtuell.de` (`88.99.213.122`, der
  WordPress-Host). Für den Hub muss die Adresse wie zuvor `material.rpi-virtuell.net` auf den
  Container-Host umziehen, dazu vHost und Zertifikat.
- `material.rpi-virtuell.net` ist live als Svelte-Stack (Repo `Materialpool-Entwicklung`).

**Vorlage:** `relihub-prototyp_5.html` (Jens, 264 KB) und `relihub-prototyp_3.html` (beide liegen
bisher nur auf Jens' und Jörgs Rechnern, nicht im Repo), plus das Feedback-Dokument
`Hub-Entwicklung/2026-10-26-feedback-relihub-prototyp-3.md` mit Geometrie und Funktionsweise der
Steuerkonsole (v0.7.0, rund 450 Zeilen, keine Abhängigkeiten). Die Komponente steckt inline in der
HTML-Datei (Prototyp 5, Zeilen 1036–1486) und muss in eine eigene Datei extrahiert werden.

## Von Jörg entschieden

- Fork der edufeed-App als Unterbau, strukturelle Übernahme von Steffens Stand.
- Eigene Domain `hub.rpi-virtuell.net`, Forgejo-Repo, Woodpecker baut und liefert aus, so wie heute
  schon oer-community und Materialpool.
- Als Erstes sichtbar: die Startseite aus dem Prototyp.
- Zweigleisigkeit (Jörg, 26.10.): Prototyp und Konstruktionsbeschreibung werden im FOERBICO-Repo im
  minimalen HTML-Klick-Prototypen-Format weiterentwickelt, Versionen durch Zahlen im Dateinamen. Die
  Svelte-App verweist auf der Startseite auf diese Genese und dient als Navigationshilfe, damit
  komplexe Hub-Entwicklung und einfacher UI-Dummybau nebeneinander laufen.
- Der Materialpool (`material.rpi-virtuell.net`, Svelte-Stack) wird künftig in den Hub integriert
  weiterentwickelt. In diesem Vorhaben bleibt er eine eigene Seite, die Integration ist eine spätere
  Stufe mit eigener Spezifikation.
- Die Steuerkonsole darf unter freier Lizenz öffentlich im Repo liegen.

## Meine Festlegungen (Claude), jederzeit änderbar

### Repo

- Name `hub`, Ort `git.rpi-virtuell.de/Comenius-Institut/hub`, öffentlich, Lizenz bleibt AGPL-3.0.
- Echter Fork mit voller Historie: lokaler Clone der edufeed-App, Remote `origin` auf Forgejo,
  Remote `upstream` auf Steffens Repo. Kein Squash, sonst sind Merges unmöglich.
- Arbeitsweise wie oer-community: `docs/entscheidungen/` mit ADRs, `docs/STATUS.md` als Logbuch,
  `docs/HUB.md` mit den Hub-Regeln. Die `CLAUDE.md` der edufeed-App bleibt inhaltlich Steffens Datei
  und bekommt nur am Dateiende einen Abschnitt „Hub“ mit Verweis auf `docs/HUB.md`. Ein Anhang am
  Dateiende merged fast immer konfliktfrei.

### Wo Hub-Code liegt, und nur dort

| Ort                                                                          | Inhalt                                                                                                                                                                                                                                                                         | Upstream-Berührung |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `src/routes/+page.svelte`                                                    | Hub-Startseite statt `LandingContent`                                                                                                                                                                                                                                          | ersetzt, 26 Zeilen |
| `src/routes/+layout.svelte`                                                  | eine Zeile: `<HubKonsole />` für die schwebende Steuerkonsole                                                                                                                                                                                                                  | eine Einfügung     |
| `src/lib/hub/**`                                                             | alle Hub-Komponenten, Daten, Styles: `HubLanding.svelte`, `HubKonsole.svelte`, `Oekosystem.svelte`, `partner.js`, `hub.css`                                                                                                                                                    | neu                |
| `static/steuerkonsole/relihub-steuerkonsole.js`                              | Jens' Komponente, aus Prototyp 5 extrahiert, sonst unverändert, versioniert; Dateikopf mit MIT-Lizenz und Autor Jens Dechow, Comenius-Institut (meine Wahl der Lizenz, Jörg hat „frei“ gesagt)                                                                                 | neu                |
| `static/steuerkonsole/kontexte/*.json`                                       | Kontextprofile: `hub.json`, `relilab.json`, `materialpool.json` …                                                                                                                                                                                                              | neu                |
| `docs/HUB.md`, `docs/entscheidungen/`, `docs/STATUS.md`, `docs/superpowers/` | Regeln, ADRs, Logbuch, Spezifikationen                                                                                                                                                                                                                                         | neu                |
| `src/lib/hub/Genese.svelte`                                                  | Abschnitt „Werkstatt“ auf der Startseite: Liste der Prototypen und Beschreibungen aus dem FOERBICO-Repo, gelesen aus einem JSON-Verzeichnis dort                                                                                                                               | neu                |
| `.woodpecker/`                                                               | Pipelines                                                                                                                                                                                                                                                                      | neu                |
| `hub.env.example`                                                            | Hub-Werte der Env-Schlüssel, dokumentiert (nicht `.env.*`, damit `.gitignore` unberührt bleibt)                                                                                                                                                                                | neu                |
| Compose-Datei nach Materialpool-Muster                                       | `env_file: .env`, Port 8080 auf 3000, kein Traefik. Ob sie `docker-compose.yml` heißen muss (dann ersetzt sie Steffens Traefik-Datei und ist eine Upstream-Berührung mehr) oder `compose.hub.yml` heißen darf, hängt davon ab, was `deploy-app.sh` erwartet; mit Ludger klären | neu oder ersetzt   |
| `CLAUDE.md`                                                                  | Anhang „Hub“ am Dateiende                                                                                                                                                                                                                                                      | Anhang             |

Alles andere bleibt upstream-identisch. Ein Hub-Feature, das eine weitere Upstream-Datei ändern müsste,
ist ein Anlass, die Änderung Steffen vorzuschlagen oder als ADR zu begründen.

### Startseite, Stufe 1

- `HubLanding.svelte` setzt den Prototyp um: Kopfzeile mit Marke, Bühne mit großer Steuerkonsole
  (`<relihub-steuerkonsole context="hub-start" variant="knospen">`), Erklärbox mit den Texten aus
  `EX` des Prototyps, Ökosystem-Abschnitt mit den zwölf Kacheln aus `PARTNERS`, Fußzeile.
- Das Web Component wird aus `static/steuerkonsole/` geladen, nicht gebündelt. So ist es dieselbe
  Datei, die Partner einbinden.
- Abgemeldet: Startseite. Angemeldet: Weiterleitung nach `/c/` wie upstream, bis der Startplatz
  (Stufe 2) existiert.
- Kopfzeile: Die edufeed-Navbar bleibt, sie trägt Login, `APP_NAME` und `APP_LOGO`. Die eigene
  Kopfzeile des Prototyps entfällt auf der Startseite. Meine Wahl: kein zweiter Layout-Eingriff; wer
  die Prototyp-Kopfzeile will, braucht eine ADR für das Ausblenden der Navbar auf `/`.
- „Anmelden“ öffnet den edufeed-`LoginModal`. Die Pille „mit Profil“ aus dem Prototyp erscheint an den
  Funktionen, die Anmeldung brauchen.
- Texte nur Deutsch, direkt in den Komponenten. Kein Eingriff in `messages/`.
- Theme: das vorhandene DaisyUI-Theme `rpi` über `THEME_DEFAULT_LIGHT=rpi`; Schriften folgen dem
  Theme. Jens' Barlow kommt erst, wenn sie als `@fontsource`-Paket lokal liegt. Keine Google Fonts.
- Die fünf Funktionsfarben aus dem Prototyp als CSS-Variablen in `hub.css`, gescopt auf die
  Hub-Komponenten. Kein weiteres DaisyUI-Theme in `app.css`.

### Zwei Gleise: Klick-Prototyp im FOERBICO-Repo, App im Hub-Repo

- Die Prototypen bleiben im FOERBICO-Repo unter `docs/`, das über den GitHub-Spiegel als GitHub Pages
  unter `https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/` veröffentlicht ist (so läuft heute
  schon `relilab-impuls-kalender.html`). Ablage, meine Wahl: `docs/relihub-prototyp_<N>.html` und
  daneben `docs/relihub-prototyp_<N>.md` für die Konstruktionsbeschreibung derselben Nummer. Die
  Nummer ist die Version; eine neue Runde ist eine neue Nummer, nichts wird überschrieben.
- Ein Verzeichnis `docs/relihub-prototypen.json` listet Nummer, Datum, Titel, Dateinamen und einen Satz
  „Was neu ist“. Jens oder Jörg tragen eine Zeile ein, wenn eine neue Nummer dazukommt.
- Die Hub-Startseite hat unten einen Abschnitt „Werkstatt“ (`Genese.svelte`): er lädt dieses JSON zur
  Laufzeit von GitHub Pages und zeigt die Prototypen als Liste mit Link auf die HTML-Datei und die
  Beschreibung. Dadurch erscheint ein neuer Prototyp im Hub, ohne dass der Hub neu gebaut wird. Fällt
  das Laden aus, zeigt der Abschnitt nur den Link auf den Ordner.
- Der Abschnitt ist zugleich Navigationshilfe: Was im Prototyp schon gezeigt, in der App aber noch nicht
  gebaut ist, verlinkt der Prototyp; die App sagt an diesen Stellen „im Prototyp zu sehen“ statt
  „folgt“. So bleiben Prototyp und App gegenseitig lesbar.
- Nach dem Zuschnitt dieser Spezifikation ist der Prototyp die Vorlage, nicht die Quelle: Die
  Steuerkonsole wird einmal aus Prototyp 5 extrahiert und lebt danach im Hub-Repo unter
  `static/steuerkonsole/`. Ändert Jens die Konsole in einem späteren Prototyp, ist das eine bewusste
  Übernahme in den Hub, nicht automatisch.

### Schwebende Steuerkonsole auf allen edufeed-Seiten

- `HubKonsole.svelte` rendert `<relihub-steuerkonsole floating context="hub">` und registriert das
  Kontextprofil `hub` mit Handler. Zielzuordnung:

| Aktion                       | Ziel                                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hub, hub.home                | `/`                                                                                                                                                                        |
| hub.profil                   | `/c/`                                                                                                                                                                      |
| finden.material              | `https://material.rpi-virtuell.net/?frage=<Thema>`; das Thema kommt aus dem Kontextprofil, ohne Thema die Startseite des Pools (`von` kennt der Pool nur auf Detailseiten) |
| finden.fortbildungen         | `/calendar`                                                                                                                                                                |
| erstellen.schreibtisch       | Hinweis „im Prototyp zu sehen“ mit Link auf den relidesk-Nachbau im aktuellen Prototyp (keine echte Adresse vorhanden)                                                     |
| erstellen.labor              | `https://relilab.org` (extern)                                                                                                                                             |
| kooperieren.communities      | `/communities`                                                                                                                                                             |
| kooperieren.personen         | `/discover?type=people`                                                                                                                                                    |
| veroeffentlichen.lerninhalte | `/create/resource`                                                                                                                                                         |
| veroeffentlichen.termin      | `/calendar/manage`                                                                                                                                                         |
| veroeffentlichen.beitrag     | `/create/article`                                                                                                                                                          |

- Die Konsole ist auf der Startseite nicht schwebend (dort steht die große), auf allen anderen Seiten
  unten rechts. Abstand zum edufeed-eigenen `GlobalFAB` ist zu prüfen; die Konsole hat
  `--relihub-float-x/-y` dafür.

### Hub-Marke über Env

`hub.env.example` dokumentiert die Hub-Werte, der Server hält die echte `.env` außerhalb des Repos:
`APP_NAME=reli_hub`, `APP_LOGO=/steuerkonsole/logo.svg`, `ORIGIN=https://hub.rpi-virtuell.net`,
Relays `wss://relay-rpi.edufeed.org` und `wss://relay.edufeed.org`, `CALENDAR_FEATURED_AUTHORS` mit den
relilab-Schlüsseln aus dem Prototyp (`RT_SRC`), `IMPRINT_*` Comenius-Institut, `FOOTER_FUNDING_TEXT`
FOERBICO, `NPUB_LOGIN_ENABLED=true`, `GOOGLE_LOGIN_ENABLED=false`. Secrets (`GEOCODING_API_KEY`,
`EDUFEED_PUBLISHER_NSEC`) bleiben leer, bis sie gebraucht werden.

### Upstream-Übernahme

- Pipeline `.woodpecker/upstream-sync.yaml`: Auslöser `cron` täglich und `manual`. Schritte: Checkout
  `main`, `git remote add upstream …`, `git fetch upstream`, `git merge --no-edit upstream/main`,
  `git push origin main`. Dafür ein Forgejo-Token mit Schreibrecht als Woodpecker-Secret
  (`forgejo_token`), Commits als „woodpecker-bot“.
- Konflikt: der Schritt schlägt fehl, die Pipeline ist rot, nichts wird gepusht. Jörg oder Claude lösen
  den Konflikt lokal. Durch die Tabelle oben sind Konflikte auf `+page.svelte`, eine Layout-Zeile und
  den `CLAUDE.md`-Anhang begrenzt.
- Der Push auf `main` löst die Build-Pipeline aus. So ist Steffens Stand spätestens am nächsten Tag live.
- Steffens Release-Tags werden mitgeholt; der Hub zeigt im Fußbereich die edufeed-Version plus Hub-SHA
  (`scripts/app-version.mjs` macht das schon).

### Build und Auslieferung

- Pipeline `.woodpecker.yml` nach dem Muster des Materialpools: `node:24-alpine`, `corepack enable`,
  `pnpm install --frozen-lockfile`; blockierend die Hub-Tests (vitest auf `src/lib/hub/**` und der
  Steuerkonsolen-Test); die Upstream-Prüfungen `check`, `lint`, `test` mit `failure: ignore` als
  Information, weil Steffens `main` sie selbst nicht ausführt und ein roter Upstream-Stand den Hub
  sonst täglich ohne Deploy ließe. Kein `pnpm run build` im Runner: der Build braucht 6 GB Heap, und
  das Image entsteht ohnehin auf dem Server.
- Deploy wie bei Materialpool und oer-community: `appleboy/drone-ssh` auf `hub.rpi-virtuell.net`,
  Secrets `deploy_ssh_user`, `deploy_ssh_key`, Skript `~/ServerSetup/scripts/deploy-app.sh hub`.
  Das Skript baut das Image aus dem edufeed-`Dockerfile` mit Podman auf dem Container-Host. Reicht der
  RAM nicht für den 6-GB-Heap-Build, bekommt der Host eine Swap-Datei, wie Steffens Runner sie hat.
- Schlägt der Image-Build fehl, läuft der alte Container weiter; zu prüfen ist, ob `deploy-app.sh`
  das so hält. Wenn nicht, ist das ein Wunsch an Ludger, kein Hub-Problem.
- Apache-vHost `hub.rpi-virtuell.net` mit `ProxyPass` auf den Container-Port und Let's-Encrypt, wie bei
  Materialpool. `ORIGIN=https://hub.rpi-virtuell.net` in der `.env`, sonst 403 bei jedem POST.
- Die `.env` liegt auf dem Server im App-Verzeichnis, außerhalb von git, nach `hub.env.example`.

### Tests

- Upstream-Prüfungen laufen in der Pipeline als Information, nicht blockierend (siehe oben). Der
  Schutz vor kaputten Merges ist der Image-Build auf dem Server: schlägt er fehl, bleibt der alte
  Stand live, und die Pipeline ist rot.
- Hub-Komponenten bekommen Komponententests mit vitest und `@testing-library/svelte` wie upstream,
  mindestens: Startseite rendert zwölf Kacheln, Erklärbox wechselt bei `relihub-action`, `HubKonsole`
  bildet jede der zwölf Aktionen auf ein Ziel ab.
- Die Steuerkonsole selbst bekommt einen Test, der die Trefferlogik prüft (Punkt in genau einem Kreis),
  als reiner Node-Test gegen das Skript.
- Ein Playwright-Lauf gegen `hub.rpi-virtuell.net` nach dem Deploy (Startseite da, Konsole da) ist
  wünschenswert, nicht Pflicht.

### Spätere Stufen, hier nur benannt

- Stufe 2: Startplatz (`/c/` für Hub-Nutzer: Interessen, Netz-News, Communities, Termine,
  Weiterarbeiten) aus den edufeed-Loadern. Eigene Spezifikation.
- Stufe 3: Kontextprofile für Partner, Einbettungsanleitung, Fortbildungskalender-Route über den
  edufeed-Kalender. Eigene Spezifikation.
- Stufe 4: Anmeldung über Einrichtung (Eingabewege-Issue, Stufe A) und Folgen-vs-Mitglied-Semantik,
  beides mit Steffen zu klären.
- Stufe 5: Materialpool in den Hub integrieren (Jörgs Vorgabe). Offen, ob als Routen im Hub-Repo
  oder als eigener Container hinter demselben Gesicht; eigene Spezifikation, Repo
  `Materialpool-Entwicklung` bleibt bis dahin.

## Voraussetzungen, die Jörg und Ludger schaffen

1. Repo `Comenius-Institut/hub` im Forgejo anlegen (leer), Actions für das Repo deaktivieren.
2. Repo im Woodpecker aktivieren, Secrets eintragen: `deploy_ssh_user`, `deploy_ssh_key` (wie
   Materialpool) und `forgejo_token` für den Upstream-Sync.
3. DNS: `hub.rpi-virtuell.net` vom CNAME auf `rpi-virtuell.de` auf den Container-Host `46.225.82.96`
   umstellen, dort Apache-vHost und Zertifikat, Server-Repo unter der `deploy-app.sh`-Konvention
   anlegen, `.env` nach `hub.env.example` befüllen, RAM für den Build prüfen.

## Antworten von Jörg, 26.10.2026

1. `material.rpi-virtuell.net` ist live als Svelte-Stack und wird künftig in den Hub integriert
   weiterentwickelt. Stufe 1 verlinkt dorthin; relidesk hat keine Adresse und bekommt „folgt“.
2. Die Steuerkonsole darf unter freier Lizenz öffentlich sein.
3. Woodpecker baut bereits oer-community und Materialpool und soll auch den Hub bauen.

## Dem Bauer überlassen

- Genaue Woodpecker-Syntax, Aufteilung in Schritte, Image-Versionen.
- Was `deploy-app.sh` beim Hub zusätzlich braucht (Compose-Name, Rollback bei fehlgeschlagenem Build,
  Log-Ablage), mit Ludger.
- Zerlegung von `HubLanding.svelte` in Teilkomponenten, Umsetzung der Erklärbox-Animation.
- Welche Vitest-Umgebung für die Steuerkonsolen-Tests (jsdom reicht nicht für `getScreenCTM`, die
  Trefferlogik ist aber reine Geometrie und testbar ohne DOM).
- Ob `HubKonsole` auf `/call/*` und ähnlichen Vollbild-Seiten ausgeblendet wird.
- Gestaltung des Werkstatt-Abschnitts; ob er die Konstruktionsbeschreibung als Markdown einbettet oder
  nur verlinkt.

## Erste Schritte in Reihenfolge

0. Im FOERBICO-Repo: Prototyp 5 und die Konstruktionsbeschreibung nach `docs/` unter der Nummern-
   Konvention, `docs/relihub-prototypen.json` anlegen, Commit auf main. Damit ist die Genese erreichbar.
1. Clone der edufeed-App, Remote-Umbau, Push nach Forgejo. Hub-Ordner, Doku, Spezifikation.
2. `hub.env.example`, `.woodpecker/`, Compose-Datei, Server vorbereiten. Erster Deploy: die edufeed-App
   unverändert mit Hub-Marke unter `hub.rpi-virtuell.net`. Damit ist die Pipeline bewiesen.
3. Steuerkonsole nach `static/`, `HubKonsole` ins Layout, Kontextprofil `hub`.
4. `HubLanding` mit Konsole, Erklärbox, Ökosystem und Werkstatt-Abschnitt. Tests. Deploy.
5. Upstream-Sync-Pipeline scharf schalten, erster Merge von Steffens nächstem Stand.
