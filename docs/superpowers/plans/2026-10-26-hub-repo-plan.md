# Repo „hub“, Stufe 1: Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Repo `Comenius-Institut/hub` als Fork der edufeed-App anlegen, mit Woodpecker-Deploy auf
`hub.rpi-virtuell.net`, täglichem Upstream-Sync und der Hub-Startseite aus Jens' Prototyp 5; davor die
Prototyp-Genese im FOERBICO-Repo veröffentlichen.

**Architecture:** Ein Git-Fork der edufeed-App mit voller Historie. Hub-Code liegt ausschließlich in
`src/lib/hub/**`, `static/steuerkonsole/**`, `.woodpecker/**`, `docs/**` und ersetzt genau eine
Upstream-Datei (`src/routes/+page.svelte`), fügt eine Zeile in `src/routes/+layout.svelte` ein, ersetzt
`docker-compose.yml` und hängt einen Abschnitt an `CLAUDE.md`. Die Steuerkonsole ist ein statisches
Skript ohne Build; Svelte-Komponenten sprechen es nur über `window.RelihubSteuerkonsole` und das
DOM-Ereignis `relihub-action` an.

**Tech Stack:** SvelteKit 2, Svelte 5 (Runes), Tailwind 4, DaisyUI (Theme `rpi`), vitest + jsdom +
`@testing-library/svelte`, pnpm 10.28 über corepack, Node 22, Woodpecker, Podman, Apache-Proxy.

**Spec:** `Hub-Entwicklung/2026-10-26-hub-repo-design.md` (FOERBICO-Repo); ab Task 1 auch
`docs/superpowers/specs/2026-10-26-hub-repo-design.md` im Hub-Repo.

## Global Constraints

- Hub-Repo lokal unter `~/repositories/hub`, Remote `origin` = `https://git.rpi-virtuell.de/Comenius-Institut/hub.git`
  (existiert, leer), Remote `upstream` = `https://relay.ngit.dev/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma/edufeed-app.git`.
- Keine Upstream-Datei anfassen außer: `src/routes/+page.svelte` (ersetzt), `src/routes/+layout.svelte`
  (eine Zeile), `docker-compose.yml` (ersetzt), `CLAUDE.md` (Anhang am Ende). Alles andere neu unter
  `src/lib/hub/`, `static/steuerkonsole/`, `.woodpecker/`, `docs/`, `hub.env.example`.
- Hub-Texte nur Deutsch, direkt im Code, kein Eingriff in `messages/`, kein Import aus `$lib/paraglide`
  in Hub-Dateien. Keine Google Fonts.
- Formatierung nach `.prettierrc` der App (2 Leerzeichen, einfache Anführungszeichen, keine
  trailing commas, printWidth 100). Vor jedem Commit `pnpm prettier --write <neue Dateien>`.
- Tests: `src/**/*.test.js`, Standardumgebung jsdom (`vite.config.js`). Hub-Tests laufen mit
  `pnpm vitest run src/lib/hub`. Mocks für `$app/navigation`, `$app/state`, `$lib/helpers/toast.js`
  im Stil von `src/lib/components/__tests__/AMBResourceCard.test.js`.
- **Sandbox-Falle auf Jörgs Mac:** Node-Programme (pnpm, vitest, vite) beenden sich in der
  Claude-Shell nicht. Jeden Aufruf so starten und das Log lesen:
  `perl -e 'alarm 600; exec @ARGV' pnpm vitest run src/lib/hub > /tmp/hub-test.log 2>&1; tail -40 /tmp/hub-test.log`
  (Exit 142 ist dann normal; das Ergebnis steht im Log).
- Commits auf Deutsch, Betreff im Stil des FOERBICO-Repos, letzte Zeile
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Direkt auf `main`, kein PR (Jörgs Vorgabe
  für dieses Vorhaben).
- Host-Port des Hub-Containers ist **8081**, nicht 8080: der Materialpool belegt auf demselben Host
  schon 8080 (`Materialpool-Entwicklung/docker-compose.yml`). Abweichung von der Spec, dort steht 8080.
- Die zwölf Aktions-IDs sind fest: `hub`, `hub.profil`, `hub.home`, `finden`, `finden.material`,
  `finden.fortbildungen`, `erstellen`, `erstellen.schreibtisch`, `erstellen.labor`, `kooperieren`,
  `kooperieren.communities`, `kooperieren.personen`, `veroeffentlichen`, `veroeffentlichen.lerninhalte`,
  `veroeffentlichen.termin`, `veroeffentlichen.beitrag` (fünf Gruppen plus elf Unteraktionen; die Spec
  zählt „zwölf Aktionen“ inklusive `hub`).

## Review Focus

1. **Werkstatt-JSON nicht erreichbar** (Netz, CORS, 404): Startseite rendert trotzdem, der Abschnitt
   zeigt nur den Link auf den Ordner. Test in Task 6 (`Genese` mit fehlgeschlagenem `fetch`).
2. **Gruppen-Aktionen** (`finden`, `erstellen`, `kooperieren`, `veroeffentlichen`) dürfen nie
   navigieren, nur erklären. Test in Task 4 (`zielFuer('finden')` liefert `art: 'hinweis'`).
3. **Skript noch nicht geladen**, wenn die Svelte-Komponente `registerContext` rufen will: der Aufruf
   muss auf das Skript warten, sonst `undefined`. Test in Task 4 (`steuerkonsoleBereit` löst erst auf,
   wenn `window.RelihubSteuerkonsole` existiert).
4. **Umlaute im Thema** (`Schöpfung`) müssen in der Materialpool-URL kodiert sein. Test in Task 4.
5. **Angemeldete Person auf `/`** muss weiter nach `/c/` geleitet werden wie upstream. Test in Task 6
   (`+page.svelte` mit aktivem Nutzer ruft `goto('/c/')`).

---

### Task 0: Genese im FOERBICO-Repo veröffentlichen

**Files:**

- Create: `docs/relihub-prototyp_5.html` (Kopie von `~/Downloads/relihub-prototyp_5.html`)
- Create: `docs/relihub-prototyp_5.md` (Kopie von `~/Downloads/reli_hub-Prototyp – Konstruktionsbeschreibung (rekonstruiert).md`)
- Create: `docs/relihub-prototypen.json`
- Repo: `~/repositories/FOERBICO_und_rpi-virtuell`, Branch `main`

**Interfaces:**

- Produces: `https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototypen.json` mit
  genau dieser Form (Task 6 liest sie):

```json
{
  "basis": "https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/",
  "prototypen": [
    {
      "nummer": 5,
      "datum": "2026-10-26",
      "titel": "reli_hub-Prototyp 5",
      "autor": "Jens Dechow",
      "html": "relihub-prototyp_5.html",
      "beschreibung": "relihub-prototyp_5.md",
      "neu": "relilab-Termine aus einem NIP-52-Schnappschuss mit Monatsansicht, Filtern und ICS-Export; Community-Räume auch im relilab-Rahmen"
    }
  ]
}
```

- [ ] **Step 1: Dateien kopieren**

```bash
cd ~/repositories/FOERBICO_und_rpi-virtuell
cp ~/Downloads/relihub-prototyp_5.html docs/relihub-prototyp_5.html
cp "$HOME/Downloads/reli_hub-Prototyp – Konstruktionsbeschreibung (rekonstruiert).md" docs/relihub-prototyp_5.md
```

- [ ] **Step 2: `docs/relihub-prototypen.json` mit dem Inhalt aus dem Interfaces-Block anlegen**

- [ ] **Step 3: Prüfen**

Run: `python3 -I -c "import json;d=json.load(open('docs/relihub-prototypen.json'));print(d['prototypen'][0]['html'])"`
Expected: `relihub-prototyp_5.html`
Run: `grep -c 'relihub-steuerkonsole' docs/relihub-prototyp_5.html`
Expected: Zahl größer 10

- [ ] **Step 4: Commit und Push**

```bash
git add docs/relihub-prototyp_5.html docs/relihub-prototyp_5.md docs/relihub-prototypen.json
git commit -m "docs: reli_hub-Prototyp 5 von Jens mit Konstruktionsbeschreibung und Prototypen-Verzeichnis

Nummern-Konvention relihub-prototyp_<N>.html/.md, Verzeichnis relihub-prototypen.json
für den Werkstatt-Abschnitt der Hub-Startseite (Hub-Entwicklung/2026-10-26-hub-repo-design.md).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 5: Veröffentlichung prüfen** (der GitHub-Spiegel braucht einige Minuten)

Run: `curl -sS -o /dev/null -w "%{http_code}\n" https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototypen.json`
Expected: `200` (bei 404 später erneut prüfen; Task 6 hat den Fallback)

---

### Task 1: Hub-Repo anlegen, Doku-Gerüst, Abhängigkeiten

**Files:**

- Create (Repo): `~/repositories/hub` als Klon der edufeed-App
- Create: `docs/HUB.md`, `docs/STATUS.md`, `docs/entscheidungen/README.md`, `docs/entscheidungen/TEMPLATE.md`,
  `docs/entscheidungen/0001-fork-der-edufeed-app-als-unterbau.md`,
  `docs/superpowers/specs/2026-10-26-hub-repo-design.md`, `docs/superpowers/plans/2026-10-26-hub-repo-plan.md`
- Modify: `CLAUDE.md` (Anhang am Dateiende)

**Interfaces:**

- Produces: das Repo mit `main` auf Forgejo, `upstream` eingetragen, `node_modules` installiert.

- [ ] **Step 1: Klonen und Remotes setzen**

```bash
git clone ~/repositories/edufeed-app ~/repositories/hub
cd ~/repositories/hub
git remote set-url origin https://git.rpi-virtuell.de/Comenius-Institut/hub.git
git remote add upstream https://relay.ngit.dev/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma/edufeed-app.git
git fetch upstream main --tags
git log --oneline -1 && git remote -v
```

Expected: `49986bad … release: v0.10.0-rc.4 notes` und zwei Remotes.

- [ ] **Step 2: Erster Push der unveränderten edufeed-App**

Run: `git push origin main --tags`
Expected: `main -> main` ohne Fehler. Damit ist der Fork-Punkt auf Forgejo festgehalten.

- [ ] **Step 3: Doku-Gerüst anlegen**

`docs/entscheidungen/TEMPLATE.md` und `docs/entscheidungen/README.md` aus
`~/repositories/oer-community/docs/entscheidungen/` kopieren. ADR-0001 nach der Vorlage, Status
„angenommen (2026-10-26)“, Beteiligte Jörg Lohrer, Ludger, Claude; Kontext und Entscheidung aus dem
Abschnitt „Absicht“ und „Von Jörg entschieden“ der Spec; Konsequenzen: Disziplin-Tabelle „Wo
Hub-Code liegt“, Konflikt heißt rote Pipeline.

`docs/HUB.md` enthält in dieser Reihenfolge: die Tabelle „Wo Hub-Code liegt, und nur dort“ aus der
Spec, die Tabelle der Aktionen mit Zielen (Spec-Abschnitt „Schwebende Steuerkonsole“), die sechs
Konstruktionsregeln aus `docs/relihub-prototyp_5.md` Abschnitt „Konstruktionsregeln“ (FOERBICO-Repo),
die Sandbox-Falle und das Testkommando aus den Global Constraints dieses Plans, und den Satz: „Ein
Hub-Feature, das eine weitere Upstream-Datei ändern müsste, ist ein Anlass für eine ADR oder einen
Vorschlag an Steffen.“

`docs/STATUS.md` mit dem Kopf aus `~/repositories/oer-community/docs/STATUS.md` (Regeln in
`HUB.md` statt `CLAUDE.md`) und einem ersten Eintrag „2026-10-26 — Repo angelegt (ADR-0001)“.

Spec und Plan aus `~/repositories/FOERBICO_und_rpi-virtuell/Hub-Entwicklung/` nach
`docs/superpowers/specs/` und `docs/superpowers/plans/` kopieren.

- [ ] **Step 4: `CLAUDE.md` Anhang**

Am Dateiende anfügen, nichts darüber ändern:

```markdown
---

## Hub (Fork-Zusatz, Comenius-Institut)

Dieses Repo ist der Fork `Comenius-Institut/hub` der edufeed-App. Alles oberhalb dieser Linie ist
Steffens Datei und bleibt unverändert. Die Regeln für den Hub-Teil stehen in `docs/HUB.md`:
wo Hub-Code liegen darf, welche Upstream-Dateien berührt sind, wie getestet wird.
```

- [ ] **Step 5: Abhängigkeiten installieren**

Run: `cd ~/repositories/hub && perl -e 'alarm 900; exec @ARGV' pnpm install --frozen-lockfile --prefer-offline > /tmp/hub-install.log 2>&1; tail -5 /tmp/hub-install.log; ls node_modules/.bin/vitest`
Expected: `node_modules/.bin/vitest` existiert.

- [ ] **Step 6: Upstream-Tests einmal laufen lassen, Stand notieren**

Run: `perl -e 'alarm 900; exec @ARGV' pnpm vitest run > /tmp/hub-upstream-test.log 2>&1; grep -E "Test Files|Tests " /tmp/hub-upstream-test.log`
Expected: eine Zeile „Test Files … passed“ (Zahl der fehlschlagenden Dateien in `docs/STATUS.md`
notieren; sie ist der Vergleichswert, nicht blockierend).

- [ ] **Step 7: Commit und Push**

```bash
git add docs CLAUDE.md
git commit -m "Hub-Fork: Doku-Gerüst, ADR-0001, Spezifikation und Plan (Comenius-Institut/hub)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

### Task 2: Betrieb: Env-Vorlage, Compose, Woodpecker-Pipelines

**Files:**

- Create: `hub.env.example`
- Modify (ersetzen): `docker-compose.yml`
- Create: `.woodpecker/build-deploy.yaml`, `.woodpecker/upstream-sync.yaml`

**Interfaces:**

- Produces: Container `hub` auf Host-Port 8081; Pipelines lösen auf `push` nach `main` (Build + Deploy)
  und auf `cron`/`manual` (Upstream-Merge) aus.

- [ ] **Step 1: `hub.env.example` schreiben**

Kommentarstil und Schlüsselnamen aus `.env.example` der App übernehmen. Werte:

```
ORIGIN=https://hub.rpi-virtuell.net
PORT=3000
HOST=0.0.0.0
APP_NAME=reli_hub
APP_LOGO=/steuerkonsole/logo.svg
APP_OG_DESCRIPTION=Dein Startplatz in die digitale Welt der Religionspädagogik
THEME_DEFAULT_LIGHT=rpi
RELAYS=wss://relay-rpi.edufeed.org,wss://relay.edufeed.org
FALLBACK_RELAYS=wss://relay.edufeed.org
CALENDAR_RELAYS=wss://relay-rpi.edufeed.org,wss://relay.edufeed.org
COMMUNIKEY_RELAYS=wss://relay-rpi.edufeed.org
AMB_RELAYS=wss://relay-rpi.edufeed.org,wss://relay.edufeed.org
CALENDAR_FEATURED_AUTHORS=npub1fpcxaz2wvjl90gjs60x37ny2pa5u4yqfx7fklz73rgfjnnfujl3sr2fxgk,npub1lde034983zllh2nhe48lt60q6p3a6lsxn0g90uemhg0906jsnzesh5vz8y,npub17mq54dad6ewkrnunzx5xs4t4c0edur99gz7ymhu3dam0pz034fpsxjqk3d
SIGNUP_SUGGESTED_COMMUNITIES=npub1fpcxaz2wvjl90gjs60x37ny2pa5u4yqfx7fklz73rgfjnnfujl3sr2fxgk
NPUB_LOGIN_ENABLED=true
GOOGLE_LOGIN_ENABLED=false
IMPRINT_ENABLED=true
IMPRINT_ORGANIZATION=Comenius-Institut
IMPRINT_ADDRESS_STREET=Schreiberstraße 12
IMPRINT_ADDRESS_POSTAL_CODE=48149
IMPRINT_ADDRESS_CITY=Münster
IMPRINT_ADDRESS_COUNTRY=Deutschland
IMPRINT_CONTACT_EMAIL=info@comenius.de
FOOTER_FUNDING_TEXT=reli_hub · ein Vorhaben von FOERBICO, gefördert vom BMFSFJ
GEOCODING_API_KEY=
EDUFEED_PUBLISHER_NSEC=
```

Die drei `CALENDAR_FEATURED_AUTHORS` sind relilab (Community), relilab-impuls (Publisher) und der
relilab-Termine-Bot (Quelle: `Orga/relilab-impuls-2026-27/README.md` und oer-community-Spec vom
31.08.2026). Trennzeichen und Listenform vorher in `.env.example` an `CALENDAR_FEATURED_AUTHORS` und
`RELAYS` prüfen und übernehmen. Anschriftzeilen gegen `https://comenius.de` Impressum prüfen.

- [ ] **Step 2: `docker-compose.yml` ersetzen**

```yaml
# Hub-Fassung (Comenius-Institut/hub): ersetzt Steffens Traefik-Compose. Ludgers deploy-app.sh baut
# das Image aus dem Dockerfile mit Podman (Materialpool-Entwicklung/docs/betrieb.md). Die .env liegt
# neben dieser Datei, außerhalb von git (Vorlage: hub.env.example). Port 8081, weil 8080 der
# Materialpool ist.
services:
  hub:
    build: .
    restart: unless-stopped
    ports:
      - '8081:3000'
    env_file: .env
    environment:
      HOST: 0.0.0.0
      PORT: '3000'
```

- [ ] **Step 3: `.woodpecker/build-deploy.yaml` schreiben**

```yaml
when:
  - branch: main
    event: push

steps:
  - name: install
    image: node:22-alpine
    environment:
      HUSKY: '0'
    commands:
      - corepack enable
      - pnpm install --frozen-lockfile

  - name: hub-tests
    image: node:22-alpine
    commands:
      - corepack enable
      - pnpm paraglide:compile
      - pnpm vitest run src/lib/hub

  - name: upstream-checks
    image: node:22-alpine
    failure: ignore
    commands:
      - corepack enable
      - pnpm run check
      - pnpm run lint
      - pnpm run test

  - name: deploy
    image: appleboy/drone-ssh:1.7.3
    settings:
      host: hub.rpi-virtuell.net
      username:
        from_secret: deploy_ssh_user
      key:
        from_secret: deploy_ssh_key
      script:
        - ~/ServerSetup/scripts/deploy-app.sh hub
```

- [ ] **Step 4: `.woodpecker/upstream-sync.yaml` schreiben**

```yaml
when:
  - event: [cron, manual]
    branch: main

steps:
  - name: merge-upstream
    image: alpine/git:2.47.2
    environment:
      FORGEJO_TOKEN:
        from_secret: forgejo_token
    commands:
      - git config user.name "woodpecker-bot"
      - git config user.email "woodpecker-bot@git.rpi-virtuell.de"
      - git fetch --unshallow origin main || git fetch origin main
      - git checkout -B main origin/main
      - git remote add upstream https://relay.ngit.dev/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma/edufeed-app.git
      - git fetch upstream main --tags
      - git merge --no-edit upstream/main
      - git push "https://oauth2:$${FORGEJO_TOKEN}@git.rpi-virtuell.de/Comenius-Institut/hub.git" main --tags
```

Der Push löst `build-deploy.yaml` aus. Der Cron selbst wird in der Woodpecker-Oberfläche angelegt
(täglich, Branch `main`), nicht in der Datei.

- [ ] **Step 5: YAML und Compose prüfen**

Run: `ruby -ryaml -e 'Dir[".woodpecker/*.yaml"].each{|f| YAML.load_file(f); puts "ok #{f}"}; YAML.load_file("docker-compose.yml"); puts "ok compose"'`
Expected: drei `ok`-Zeilen.
Run: `grep -c "8081:3000" docker-compose.yml && ! grep -q traefik docker-compose.yml && echo kein-traefik`
Expected: `1` und `kein-traefik`.

- [ ] **Step 6: Commit und Push**

```bash
pnpm prettier --write hub.env.example docker-compose.yml .woodpecker/*.yaml 2>/dev/null || true
git add hub.env.example docker-compose.yml .woodpecker
git commit -m "Betrieb: hub.env.example, Compose ohne Traefik (Port 8081), Woodpecker Build/Deploy und Upstream-Sync

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

Hinweis: Läuft die Pipeline schon (Voraussetzungen 1–3 der Spec erfüllt), ist dieser Push der erste
Deploy der unveränderten edufeed-App mit Hub-Marke. Sonst bleibt er ohne Wirkung, bis Ludger das
Repo aktiviert.

---

### Task 3: Steuerkonsole als statisches Skript, Logo, Trefferlogik-Test

**Files:**

- Create: `static/steuerkonsole/relihub-steuerkonsole.js` (Zeilen 1037–1486 von `docs/relihub-prototyp_5.html` im FOERBICO-Repo)
- Create: `static/steuerkonsole/logo.svg`
- Create: `src/lib/hub/steuerkonsole-laden.js`
- Test: `src/lib/hub/__tests__/steuerkonsole.test.js`, `src/lib/hub/__tests__/steuerkonsole-laden.test.js`

**Interfaces:**

- Produces: `window.RelihubSteuerkonsole` (`version`, `functions`, `registerContext(name, profil)`,
  `resolve(action, context)`) und das Element `<relihub-steuerkonsole>` mit Attributen `size`,
  `variant`, `context`, `floating`, `popover-size`, `base-url`; Ereignis `relihub-action` mit
  `detail = { action, label, url, context }`.
- Produces: `steuerkonsoleBereit(doc = document): Promise<object>` in `steuerkonsole-laden.js`: fügt
  einmalig `<script src="/steuerkonsole/relihub-steuerkonsole.js">` in `doc.head` ein (wenn nicht
  vorhanden) und löst mit `window.RelihubSteuerkonsole` auf, sobald es existiert; mehrfacher Aufruf
  liefert dieselbe Promise.

- [ ] **Step 1: Skript extrahieren und Lizenzkopf setzen**

```bash
cd ~/repositories/hub && mkdir -p static/steuerkonsole
sed -n '1037,1486p' ~/repositories/FOERBICO_und_rpi-virtuell/docs/relihub-prototyp_5.html > static/steuerkonsole/relihub-steuerkonsole.js
head -3 static/steuerkonsole/relihub-steuerkonsole.js; tail -2 static/steuerkonsole/relihub-steuerkonsole.js
```

Expected: erste Zeile `/*!`, zweite ` * reli_hub-Steuerkonsole – Steuerelement (Prototyp)`, letzte
Zeile `})();`. Dann vor Zeile 1 einfügen:

```js
/*!
 * relihub-steuerkonsole.js 0.7.0
 * Copyright (c) 2026 Jens Dechow, Comenius-Institut (FOERBICO)
 * Lizenz: MIT (https://opensource.org/license/mit)
 * Quelle: docs/relihub-prototyp_5.html im Repo Comenius-Institut/FOERBICO_und_rpi-virtuell
 */
```

Im Kopfkommentar den Einbindungspfad `relihub-steuerkonsole.js` durch
`https://hub.rpi-virtuell.net/steuerkonsole/relihub-steuerkonsole.js` ersetzen. Sonst nichts ändern.

- [ ] **Step 2: `static/steuerkonsole/logo.svg`**

SVG mit `viewBox="-205 -205 410 410"`, fünf Kreise `r="100"`, Mittelpunkte `(98·cos a, 98·sin a)` mit
`a = -90° + 72°·i`, Farben in dieser Reihenfolge `#233E99 #008C86 #F39200 #D6336C #7B4FB8`,
`opacity="0.66"`. Das ist die `petals()`-Zeichnung des Prototyps (Zeilen 1494–1500).

- [ ] **Step 3: Test für Skript und Trefferlogik schreiben**

```js
// src/lib/hub/__tests__/steuerkonsole.test.js
// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(async () => {
  await import('../../../../static/steuerkonsole/relihub-steuerkonsole.js');
});

describe('relihub-steuerkonsole', () => {
  it('registriert fünf Funktionen mit elf Unteraktionen', () => {
    const f = window.RelihubSteuerkonsole.functions;
    expect(f.map((x) => x.id)).toEqual([
      'hub',
      'finden',
      'erstellen',
      'kooperieren',
      'veroeffentlichen'
    ]);
    expect(f.flatMap((x) => x.subs).length).toBe(11);
  });
  it('löst Routen gegen die Basis-URL auf', () => {
    expect(window.RelihubSteuerkonsole.resolve('finden.material', 'standard')).toBe(
      'https://relihub.example/finden/materialpool'
    );
  });
  it('trifft nur Punkte in genau einem Kreis', () => {
    const el = document.createElement('relihub-steuerkonsole');
    expect(el.exclusive({ x: 0, y: 0 })).toBeNull(); // Mitte: alle fünf
    expect(el.exclusive({ x: 0, y: -190 }).id).toBe('hub'); // oberes Blütenblatt
    expect(el.exclusive({ x: 0, y: -60 })).toBeNull(); // Linse hub/finden/veroeffentlichen
  });
});
```

- [ ] **Step 4: Test laufen lassen**

Run: `perl -e 'alarm 600; exec @ARGV' pnpm vitest run src/lib/hub > /tmp/hub-test.log 2>&1; tail -15 /tmp/hub-test.log`
Expected: 3 Tests bestanden. Schlägt der Import fehl, weil vitest `static/` nicht auflöst, den Pfad
relativ belassen und `server.fs.allow` nicht anfassen; stattdessen die Datei mit `readFileSync` lesen
und über `new Function(code)()` ausführen.

- [ ] **Step 5: `steuerkonsole-laden.js` mit Test**

```js
// src/lib/hub/__tests__/steuerkonsole-laden.test.js
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { steuerkonsoleBereit } from '../steuerkonsole-laden.js';

describe('steuerkonsoleBereit', () => {
  it('fügt das Skript einmal ein und löst auf, sobald das Objekt existiert', async () => {
    const p1 = steuerkonsoleBereit();
    const p2 = steuerkonsoleBereit();
    expect(p1).toBe(p2);
    expect(
      document.querySelectorAll('script[src="/steuerkonsole/relihub-steuerkonsole.js"]').length
    ).toBe(1);
    window.RelihubSteuerkonsole = { version: 'test' };
    document
      .querySelector('script[src="/steuerkonsole/relihub-steuerkonsole.js"]')
      .dispatchEvent(new Event('load'));
    expect((await p1).version).toBe('test');
  });
});
```

Implementierung: modulweite `let bereit = null`; wenn `window.RelihubSteuerkonsole` schon da ist, sofort
`Promise.resolve`; sonst Script-Tag mit `defer` anlegen oder das vorhandene nehmen, auf `load`
auflösen, auf `error` verwerfen. Im SSR-Fall (`typeof window === 'undefined'`) eine nie auflösende
Promise zurückgeben, damit Komponenten nur im Browser registrieren.

- [ ] **Step 6: Tests, Format, Commit**

Run: `perl -e 'alarm 600; exec @ARGV' pnpm vitest run src/lib/hub > /tmp/hub-test.log 2>&1; tail -15 /tmp/hub-test.log`
Expected: 4 Tests bestanden.

```bash
pnpm prettier --write src/lib/hub static/steuerkonsole/logo.svg
git add static/steuerkonsole src/lib/hub
git commit -m "Steuerkonsole als statisches Skript (MIT, aus Prototyp 5), Logo, Lader mit Tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Zielzuordnung und schwebende Konsole auf allen Seiten

**Files:**

- Create: `src/lib/hub/konsole-ziele.js`, `src/lib/hub/HubKonsole.svelte`
- Modify: `src/routes/+layout.svelte:605` (eine Zeile nach `<GlobalFAB …/>`)
- Test: `src/lib/hub/__tests__/konsole-ziele.test.js`, `src/lib/hub/__tests__/HubKonsole.test.js`

**Interfaces:**

- Consumes: `steuerkonsoleBereit()` aus Task 3.
- Produces: `zielFuer(action, { thema } = {})` → `{ art: 'intern', pfad }` | `{ art: 'extern', url }` |
  `{ art: 'hinweis', text, url? }`; `export const PROTOTYP_URL = 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.html'`;
  `export const MATERIALPOOL_URL = 'https://material.rpi-virtuell.net/'`. Task 6 nutzt beides.

Zuordnung (Spec-Tabelle): `hub`, `hub.home` → intern `/`; `hub.profil` → intern `/c/`;
`finden.material` → extern `MATERIALPOOL_URL` plus `?frage=<encodeURIComponent(thema)>`, wenn `thema`
gesetzt; `finden.fortbildungen` → intern `/calendar`; `erstellen.schreibtisch` → hinweis „relidesk ist im
Prototyp zu sehen“ mit `url = PROTOTYP_URL + '#relidesk'`; `erstellen.labor` → extern `https://relilab.org/`;
`kooperieren.communities` → intern `/communities`; `kooperieren.personen` → intern `/discover?type=people`;
`veroeffentlichen.lerninhalte` → intern `/create/resource`; `veroeffentlichen.termin` → intern `/calendar/manage`;
`veroeffentlichen.beitrag` → intern `/create/article`; die vier Gruppen `finden`, `erstellen`,
`kooperieren`, `veroeffentlichen` → hinweis „Wähle eine der Knospen.“; unbekannte Aktion → hinweis
„folgt“.

- [ ] **Step 1: Test für `zielFuer`**

```js
// src/lib/hub/__tests__/konsole-ziele.test.js
import { describe, it, expect } from 'vitest';
import { zielFuer } from '../konsole-ziele.js';

const ALLE = [
  'hub',
  'hub.profil',
  'hub.home',
  'finden',
  'finden.material',
  'finden.fortbildungen',
  'erstellen',
  'erstellen.schreibtisch',
  'erstellen.labor',
  'kooperieren',
  'kooperieren.communities',
  'kooperieren.personen',
  'veroeffentlichen',
  'veroeffentlichen.lerninhalte',
  'veroeffentlichen.termin',
  'veroeffentlichen.beitrag'
];

describe('zielFuer', () => {
  it('kennt jede Aktion', () => {
    for (const a of ALLE) expect(['intern', 'extern', 'hinweis']).toContain(zielFuer(a).art);
  });
  it('Gruppen navigieren nie', () => {
    for (const a of ['finden', 'erstellen', 'kooperieren', 'veroeffentlichen'])
      expect(zielFuer(a).art).toBe('hinweis');
  });
  it('kodiert das Thema für den Materialpool', () => {
    expect(zielFuer('finden.material', { thema: 'Schöpfung' }).url).toBe(
      'https://material.rpi-virtuell.net/?frage=Sch%C3%B6pfung'
    );
    expect(zielFuer('finden.material').url).toBe('https://material.rpi-virtuell.net/');
  });
  it('Communities intern, relidesk als Hinweis auf den Prototyp', () => {
    expect(zielFuer('kooperieren.communities')).toEqual({ art: 'intern', pfad: '/communities' });
    expect(zielFuer('erstellen.schreibtisch').url).toMatch(/relihub-prototyp_5\.html#relidesk$/);
  });
});
```

- [ ] **Step 2: Test laufen lassen, Erwartung: schlägt fehl mit „Cannot find module“**

- [ ] **Step 3: `konsole-ziele.js` schreiben**, Tabelle als Objektliteral, `zielFuer` wie oben.

- [ ] **Step 4: Test laufen lassen, Erwartung: 4 Tests bestanden**

- [ ] **Step 5: Test für `HubKonsole.svelte`**

```js
// src/lib/hub/__tests__/HubKonsole.test.js
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { goto } from '$app/navigation';
import HubKonsole from '../HubKonsole.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (p) => p }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/communities') } }));
vi.mock('$lib/helpers/toast.js', () => ({ showToast: vi.fn() }));
const registerContext = vi.fn();
vi.mock('../steuerkonsole-laden.js', () => ({
  steuerkonsoleBereit: () => Promise.resolve({ registerContext })
}));

describe('HubKonsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
  });
  it('rendert die schwebende Konsole mit Kontext hub und registriert den Handler', async () => {
    const { container } = render(HubKonsole);
    await new Promise((r) => setTimeout(r, 0));
    const el = container.querySelector('relihub-steuerkonsole');
    expect(el.getAttribute('floating')).not.toBeNull();
    expect(el.getAttribute('context')).toBe('hub');
    expect(registerContext).toHaveBeenCalledWith(
      'hub',
      expect.objectContaining({ handler: expect.any(Function) })
    );
  });
  it('Handler: intern per goto, extern per window.open, Gruppen nur Hinweis', async () => {
    render(HubKonsole);
    await new Promise((r) => setTimeout(r, 0));
    const { handler } = registerContext.mock.calls[0][1];
    expect(handler({ action: 'kooperieren.communities' })).toBe(false);
    expect(goto).toHaveBeenCalledWith('/communities');
    handler({ action: 'erstellen.labor' });
    expect(window.open).toHaveBeenCalledWith('https://relilab.org/', '_blank', 'noopener');
    handler({ action: 'finden' });
    expect(goto).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 6: Test laufen lassen, Erwartung: schlägt fehl (Komponente fehlt)**

- [ ] **Step 7: `HubKonsole.svelte` schreiben**

Svelte 5. Rendert nichts, wenn `page.url.pathname === '/'` (dort steht die große Konsole). Sonst
`<relihub-steuerkonsole floating context="hub" size="58" popover-size="210" base-url="https://hub.rpi-virtuell.net"></relihub-steuerkonsole>`.
Im `$effect`: `steuerkonsoleBereit().then((K) => K.registerContext('hub', { handler }))`. Der Handler
nimmt `detail`, ruft `zielFuer(detail.action)`: `intern` → `goto(resolve(pfad))`, `extern` →
`window.open(url, '_blank', 'noopener')`, `hinweis` → `showToast(text)` (bei `url` den Text mit Link
ergänzen); gibt immer `false` zurück, damit das Skript nicht selbst navigiert. CSS-Variable
`--relihub-float-y: 88px`, damit die Konsole über dem `GlobalFAB` sitzt (Abstand nach Sichtprüfung
anpassen).

- [ ] **Step 8: Test laufen lassen, Erwartung: alle Hub-Tests bestanden**

- [ ] **Step 9: Layout-Zeile**

In `src/routes/+layout.svelte` direkt nach der Zeile `<GlobalFAB hideButton={pageHasOwnCreateAction} />`
(Zeile 605) einfügen: `<HubKonsole />`, und oben bei den Imports als letzten Import
`import HubKonsole from '$lib/hub/HubKonsole.svelte';`. Zwei Zeilen Berührung, dokumentiert in HUB.md.

- [ ] **Step 10: Format, Check, Commit**

Run: `pnpm prettier --write src/lib/hub src/routes/+layout.svelte`
Run: `perl -e 'alarm 900; exec @ARGV' pnpm run check > /tmp/hub-check.log 2>&1; grep -E "svelte-check found|errors" /tmp/hub-check.log | tail -2`
Expected: keine neuen Fehler gegenüber dem Stand aus Task 1 Step 6 (Zahl vergleichen).

```bash
git add src/lib/hub src/routes/+layout.svelte
git commit -m "Hub: Zielzuordnung der Steuerkonsole und schwebende Konsole im Layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Inhalte der Startseite: Erklärungen, Partner, Farben

**Files:**

- Create: `src/lib/hub/erklaerungen.js`, `src/lib/hub/partner.js`, `src/lib/hub/hub.css`
- Test: `src/lib/hub/__tests__/inhalte.test.js`

**Interfaces:**

- Produces: `ERKLAERUNGEN` – Objekt mit den 16 Aktions-IDs als Schlüssel, je `{ fn, titel, text, knospen?: string[], weiter?: string, mitProfil?: boolean }`
  (aus `EX` des Prototyps, Zeilen 1506–1523, `t`→`titel`, `p`→`text`, `subs`→`knospen`, `go[0]`→`weiter`,
  `lock`→`mitProfil`; das Ziel kommt aus `zielFuer`, nicht aus `go[1]`). Zusätzlich die Standardkarte
  `ERKLAERUNG_START = { fn: 'So funktioniert’s', titel: 'Wähle einen Bereich der Steuerkonsole', text: 'Tippe einen Kreis an oder fahre an seinen äußeren Rand – er springt heraus. Klicke ihn oder eine seiner Knospen an, und hier erfährst du, worum es geht.' }`.
- Produces: `PARTNER` – Liste von 12 `{ name, rolle, funktion, kuerzel, url, text, hinweis? }` in der
  Reihenfolge des Prototyps (Zeilen 1554–1567). `funktion` ∈ `finden|erstellen|kooperieren|hub`.
  URLs (am 26.10.2026 geprüft): Materialpool `https://material.rpi-virtuell.net/`;
  Fortbildungskalender `/calendar` (intern); relilab `https://relilab.org/`; relidesk
  `PROTOTYP_URL + '#relidesk'` mit `hinweis: 'im Prototyp'`; relimentar `https://relimentar.de/`;
  narrt `https://narrt.de/`; reliGlobal `https://religlobal.org/`; Konfi-Arbeit `https://konfi-arbeit.de/`;
  Friedensarbeit EKD `https://www.evangelische-friedensarbeit.de/`; InkRV `url: null`,
  `hinweis: 'in Überarbeitung'`; Comenius-Institut `https://comenius.de/`; edufeed `https://edufeed.org/`.
- Produces: `hub.css` mit `.hub { --c-hub:#233E99; --c-finden:#008C86; --c-erstellen:#F39200; --c-koop:#D6336C; --c-ver:#7B4FB8; --t-hub:#E6EAF5; --t-finden:#DDF1F0; --t-erstellen:#FEEFD9; --t-koop:#FAE1EA; --t-ver:#EEE7F7; }`
  und den Klassen `.hub-stage`, `.hub-explain`, `.hub-pcard` (Flip-Kachel) aus dem Prototyp-CSS
  (Zeilen 9–673), auf `.hub` gescopt, ohne `@import` und ohne Schriftdeklarationen.

- [ ] **Step 1: Test**

```js
// src/lib/hub/__tests__/inhalte.test.js
import { describe, it, expect } from 'vitest';
import { ERKLAERUNGEN, ERKLAERUNG_START } from '../erklaerungen.js';
import { PARTNER } from '../partner.js';

describe('Inhalte', () => {
  it('erklärt alle 16 Aktionen', () => {
    expect(Object.keys(ERKLAERUNGEN).length).toBe(16);
    expect(ERKLAERUNGEN['veroeffentlichen'].knospen).toEqual([
      'veroeffentlichen.lerninhalte',
      'veroeffentlichen.termin',
      'veroeffentlichen.beitrag'
    ]);
    expect(ERKLAERUNGEN['erstellen'].mitProfil).toBe(true);
    expect(ERKLAERUNG_START.titel).toMatch(/Wähle einen Bereich/);
  });
  it('listet zwölf Partner mit Funktion', () => {
    expect(PARTNER.length).toBe(12);
    for (const p of PARTNER)
      expect(['finden', 'erstellen', 'kooperieren', 'hub']).toContain(p.funktion);
    expect(PARTNER.find((p) => p.name === 'InkRV').url).toBeNull();
  });
});
```

- [ ] **Step 2: Test laufen lassen, Erwartung: schlägt fehl**
- [ ] **Step 3: Die drei Dateien schreiben** (Texte wörtlich aus dem Prototyp übernehmen)
- [ ] **Step 4: Test laufen lassen, Erwartung: bestanden**
- [ ] **Step 5: Commit**

```bash
pnpm prettier --write src/lib/hub
git add src/lib/hub
git commit -m "Hub: Erklärtexte, Partnerliste und Farben aus Prototyp 5

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Startseite mit Konsole, Erklärbox, Ökosystem, Werkstatt

**Files:**

- Create: `src/lib/hub/genese.js`, `src/lib/hub/Erklaerbox.svelte`, `src/lib/hub/Oekosystem.svelte`,
  `src/lib/hub/Genese.svelte`, `src/lib/hub/HubLanding.svelte`
- Modify (ersetzen): `src/routes/+page.svelte`
- Test: `src/lib/hub/__tests__/genese.test.js`, `src/lib/hub/__tests__/Erklaerbox.test.js`,
  `src/lib/hub/__tests__/Oekosystem.test.js`, `src/lib/hub/__tests__/Genese.test.js`,
  `src/routes/__tests__/hub-startseite.test.js`

**Interfaces:**

- Consumes: `steuerkonsoleBereit`, `zielFuer`, `PROTOTYP_URL`, `ERKLAERUNGEN`, `ERKLAERUNG_START`,
  `PARTNER`, `hub.css`; upstream `modalStore.openModal('login')` aus `$lib/stores/modal.svelte.js`,
  `useActiveUser` aus `$lib/stores/accounts.svelte`, `runtimeConfig` aus `$lib/stores/config.svelte.js`.
- Produces: `GENESE_URL = 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototypen.json'`,
  `GENESE_ORDNER = 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/'`,
  `ladeGenese(fetchFn = fetch): Promise<{ basis, prototypen } | null>` (null bei Fehler oder
  Nicht-200), `prototypLinks(basis, eintrag) → { html, beschreibung }` (absolute URLs).
- Komponenten: `Erklaerbox` Prop `aktion: string | null`, zeigt `ERKLAERUNG_START` bei null, sonst
  den Eintrag; Knospen als Buttons, die `onwahl(id)` rufen; „Weiter“-Button nach `zielFuer`
  (`intern` → `goto`, `extern` → Link `target=_blank`, `hinweis` → Link auf `url` oder nur Text);
  bei `hub.profil` statt Navigation `modalStore.openModal('login')`; Badge „mit Profil“ bei
  `mitProfil`. `Oekosystem` ohne Props, 12 Kacheln. `Genese` ohne Props, lädt beim Mount.
  `HubLanding` ohne Props: Bühne mit `<relihub-steuerkonsole context="hub-start" variant="knospen" size="320" base-url="https://hub.rpi-virtuell.net">`,
  darunter `Erklaerbox`, `Oekosystem`, `Genese`, Fußzeile „reli_hub · ein Vorhaben von FOERBICO“.
  Auf Breite unter 640 px `size="240"`.

- [ ] **Step 1: Test `genese.js`**

```js
// src/lib/hub/__tests__/genese.test.js
import { describe, it, expect } from 'vitest';
import { ladeGenese, prototypLinks, GENESE_URL } from '../genese.js';

const daten = {
  basis: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/',
  prototypen: [
    { nummer: 5, html: 'relihub-prototyp_5.html', beschreibung: 'relihub-prototyp_5.md' }
  ]
};

describe('Genese', () => {
  it('lädt das Verzeichnis', async () => {
    const fetchFn = async (url) => {
      expect(url).toBe(GENESE_URL);
      return { ok: true, json: async () => daten };
    };
    expect((await ladeGenese(fetchFn)).prototypen[0].nummer).toBe(5);
  });
  it('liefert null bei Fehler oder Nicht-200', async () => {
    expect(
      await ladeGenese(async () => {
        throw new Error('netz');
      })
    ).toBeNull();
    expect(await ladeGenese(async () => ({ ok: false, json: async () => ({}) }))).toBeNull();
  });
  it('baut absolute Links', () => {
    expect(prototypLinks(daten.basis, daten.prototypen[0])).toEqual({
      html: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.html',
      beschreibung: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.md'
    });
  });
});
```

- [ ] **Step 2: Test laufen lassen (fehlt), `genese.js` schreiben, Test bestanden**

- [ ] **Step 3: Komponententests**

```js
// src/lib/hub/__tests__/Erklaerbox.test.js  (@vitest-environment jsdom; Mocks wie in HubKonsole.test.js
// plus vi.mock('$lib/stores/modal.svelte.js', () => ({ modalStore: { openModal: vi.fn() } })))
it('zeigt die Startkarte ohne Aktion', () => {
  const { getByText } = render(Erklaerbox, { props: { aktion: null } });
  expect(getByText(/Wähle einen Bereich der Steuerkonsole/)).toBeTruthy();
});
it('zeigt Knospen einer Gruppe und meldet die Wahl', async () => {
  const onwahl = vi.fn();
  const { getByText } = render(Erklaerbox, { props: { aktion: 'finden', onwahl } });
  await fireEvent.click(getByText(/Fortbildungen/));
  expect(onwahl).toHaveBeenCalledWith('finden.fortbildungen');
});
it('öffnet bei hub.profil den Login statt zu navigieren', async () => {
  const { getByText } = render(Erklaerbox, { props: { aktion: 'hub.profil' } });
  await fireEvent.click(getByText(/Mit Nostr-Schlüssel anmelden/));
  expect(modalStore.openModal).toHaveBeenCalledWith('login');
});

// src/lib/hub/__tests__/Oekosystem.test.js
it('rendert zwölf Kacheln, InkRV ohne Link', () => {
  const { container } = render(Oekosystem);
  expect(container.querySelectorAll('.hub-pcard').length).toBe(12);
  expect(container.querySelector('.hub-pcard[data-name="InkRV"] a')).toBeNull();
});

// src/lib/hub/__tests__/Genese.test.js  (vi.mock('../genese.js', …) mit ladeGenese als vi.fn())
it('listet Prototypen aus dem Verzeichnis', async () => {
  /* ladeGenese → daten; erwartet Link-Text "Prototyp 5" */
});
it('zeigt bei Fehler nur den Ordner-Link', async () => {
  /* ladeGenese → null; erwartet href GENESE_ORDNER, kein "Prototyp 5" */
});
```

- [ ] **Step 4: Tests laufen lassen (fehlen), Komponenten schreiben, Tests bestanden**

`HubLanding.svelte` bindet die Konsole per `bind:this`, lauscht im `$effect` auf `relihub-action`
(`detail.action` → `aktion`), und ruft `steuerkonsoleBereit().then((K) => K.registerContext('hub-start', { handler: () => false }))`,
damit das Skript nichts selbst navigiert. `onwahl` der Erklärbox setzt `aktion` ebenfalls. Markup
und Klassen aus dem Prototyp-Abschnitt `#v-start` (Zeilen 678–708), ohne die Kopfzeile `hub-top`
(die edufeed-Navbar bleibt).

- [ ] **Step 5: `src/routes/+page.svelte` ersetzen**

```svelte
<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { runtimeConfig } from '$lib/stores/config.svelte.js';
  import { useActiveUser } from '$lib/stores/accounts.svelte';
  import HubLanding from '$lib/hub/HubLanding.svelte';

  const activeUser = useActiveUser();
  $effect(() => {
    if (browser && activeUser()) goto(resolve('/c/'), { replaceState: true });
  });
</script>

<svelte:head>
  <title
    >{runtimeConfig.appName} · Dein Startplatz in die digitale Welt der Religionspädagogik</title
  >
  <meta
    name="description"
    content="reli_hub verbindet bestehende Angebote der Religionspädagogik: finden, erstellen, kooperieren, veröffentlichen – mit einem Profil überall."
  />
</svelte:head>

{#if !activeUser()}
  <HubLanding />
{/if}
```

Test `src/routes/__tests__/hub-startseite.test.js`: mit `useActiveUser` gemockt auf `() => () => ({ pubkey: 'x' })`
erwartet `goto` mit `/c/`; mit `() => () => null` erwartet `HubLanding` im DOM (Mock der Komponente
auf ein Stub-Element `<div data-testid="hub-landing">`).

- [ ] **Step 6: Alle Hub-Tests, Check, Lint**

Run: `perl -e 'alarm 600; exec @ARGV' pnpm vitest run src/lib/hub src/routes/__tests__/hub-startseite.test.js > /tmp/hub-test.log 2>&1; tail -20 /tmp/hub-test.log`
Expected: alle bestanden.
Run: `pnpm prettier --write src/lib/hub src/routes/+page.svelte src/routes/__tests__ && perl -e 'alarm 900; exec @ARGV' pnpm run lint > /tmp/hub-lint.log 2>&1; tail -5 /tmp/hub-lint.log`
Expected: keine Fehler in Hub-Dateien.

- [ ] **Step 7: Sichtprüfung lokal**

Run: `perl -e 'alarm 120; exec @ARGV' pnpm dev --port 5180 > /tmp/hub-dev.log 2>&1 &` dann im Browser
`http://localhost:5180/`: Konsole sichtbar, Klick auf oberen Kreis zeigt Erklärkarte „reli_hub“,
zwölf Kacheln, Werkstatt-Abschnitt mit „Prototyp 5“ oder Ordner-Link, auf `/communities` schwebende
Konsole unten rechts über dem Plus-Knopf. Screenshot ablegen.

- [ ] **Step 8: Commit und Push**

```bash
git add src/lib/hub src/routes/+page.svelte src/routes/__tests__
git commit -m "Hub-Startseite: Steuerkonsole, Erklärbox, Ökosystem-Kacheln und Werkstatt aus Prototyp 5

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

### Task 7: Inbetriebnahme, Upstream-Sync scharf, Logbuch

**Files:**

- Modify: `docs/STATUS.md`, `docs/HUB.md` (Layout-Berührung: zwei Zeilen statt einer)

- [ ] **Step 1: Voraussetzungen abfragen** (Jörg/Ludger, Spec-Abschnitt „Voraussetzungen“): Repo im
      Woodpecker aktiv, Secrets `deploy_ssh_user`, `deploy_ssh_key`, `forgejo_token`, DNS auf
      `46.225.82.96`, vHost mit `ProxyPass` auf Port 8081, `.env` auf dem Server, Cron „upstream-sync“
      täglich auf `main`.

- [ ] **Step 2: Deploy prüfen**

Run: `curl -sS -o /dev/null -w "%{http_code}\n" https://hub.rpi-virtuell.net/ && curl -sS https://hub.rpi-virtuell.net/ | grep -o 'relihub-steuerkonsole' | head -1`
Expected: `200` und `relihub-steuerkonsole`.
Run: `curl -sS -o /dev/null -w "%{http_code}\n" https://hub.rpi-virtuell.net/steuerkonsole/relihub-steuerkonsole.js`
Expected: `200`.

- [ ] **Step 3: Upstream-Sync einmal manuell starten** (Woodpecker-Oberfläche, Pipeline
      `upstream-sync`), dann:

Run: `cd ~/repositories/hub && git fetch origin && git log --oneline -3 origin/main`
Expected: entweder „Already up to date“ im Pipeline-Log (kein neuer Commit) oder ein Merge-Commit
„Merge remote-tracking branch 'upstream/main'“ von woodpecker-bot an der Spitze.

- [ ] **Step 4: Logbuch**

Eintrag in `docs/STATUS.md`: Datum, was live ist, Zahl der Hub-Tests, Vergleichswert der
Upstream-Tests, nächster Schritt „Stufe 2: Startplatz, eigene Spezifikation“. In `docs/HUB.md` die
Layout-Berührung auf „Import plus eine Zeile“ präzisieren.

```bash
git add docs
git commit -m "Logbuch: Stufe 1 live auf hub.rpi-virtuell.net, Upstream-Sync aktiv

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

## Selbstprüfung (durchgeführt beim Schreiben)

- Spec-Abdeckung: Repo/Fork (Task 1), Tabelle „Wo Hub-Code liegt“ (Tasks 1–6, Compose ersetzt statt
  `compose.hub.yml`, Kontextprofil-JSONs für Partner auf Stufe 3 verschoben), Startseite (5, 6), Zwei
  Gleise (0, 6), schwebende Konsole mit Zielen (4), Env (2), Upstream-Sync (2, 7), Build/Deploy (2, 7),
  Tests (3–6), Voraussetzungen (7).
- Abweichungen von der Spec, bewusst: Host-Port 8081 statt 8080; Layout-Berührung sind Import plus
  eine Zeile; `kontexte/*.json` erst in Stufe 3; Steuerkonsole-Test läuft in jsdom statt reinem Node,
  weil das Skript beim Laden `customElements` braucht.
- Namen quer über Tasks: `steuerkonsoleBereit`, `zielFuer`, `PROTOTYP_URL`, `MATERIALPOOL_URL`,
  `ERKLAERUNGEN`, `ERKLAERUNG_START`, `PARTNER`, `ladeGenese`, `prototypLinks`, `GENESE_URL`,
  `GENESE_ORDNER`, `HubKonsole`, `HubLanding`, `Erklaerbox`, `Oekosystem`, `Genese`.
