# Hub-Regeln (Fork-Zusatz zur edufeed-App)

Dieses Repo ist `Comenius-Institut/hub`, ein Fork der edufeed-App (Upstream: Steffens Repo auf
relay.ngit.dev). Die `CLAUDE.md` in der Wurzel ist Steffens Datei und gilt für den edufeed-Teil.
Hier stehen die Regeln für alles, was der Hub dazubaut. Begründungen in
`superpowers/specs/2026-10-26-hub-repo-design.md`, Entscheidungen in `entscheidungen/`,
Stand in `STATUS.md`.

## Wo Hub-Code liegt, und nur dort

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

Die Layout-Berührung sind ein Import und eine Zeile `<HubKonsole />` nach `<GlobalFAB />`.
Alles andere bleibt upstream-identisch. Ein Hub-Feature, das eine weitere Upstream-Datei ändern
müsste, ist ein Anlass für eine ADR oder einen Vorschlag an Steffen.

## Die Aktionen der Steuerkonsole und ihre Ziele im Hub

Quelle der Zuordnung im Code: `src/lib/hub/konsole-ziele.js`.

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

## Konstruktionsregeln (aus Jens' Prototyp, Konstruktionsbeschreibung Nr. 5)

1. **Ontologie zuerst.** Fünf Funktionen und ihre Unteraktionen werden einmal als IDs, Farben und Erklärtexte festgelegt. Alles Weitere referenziert diese IDs. Eine neue Funktion wäre ein Eingriff in die Ontologie; eine neue Instanz nicht.
2. **Ein Element, viele Kontexte.** Die Konsole ist eine Komponente mit festem Verhalten; Unterschiede zwischen Seiten liegen ausschließlich im Kontextprofil (Parameter, Ziele, Handler). Nichts an der Konsole wird pro Seite geändert.
3. **Nachbauen, nicht neu gestalten.** Eine bestehende Instanz wird in eigenem Design rekonstruiert. Der Hub fügt genau vier Dinge hinzu: den Vermerk „Teil des reli_hub“, den Profil-Link, die schwebende Konsole, das Vorauswahl-Banner.
4. **Daten im Zielvokabular.** Oberfläche und Beschriftung sprechen Nostr/edufeed (kinds, NIPs, Relays, npubs), auch wenn die Daten Beispiele oder Schnappschüsse sind. So bleibt der Prototyp anschlussfähig an die spätere Implementierung.
5. **Lücken sind sichtbar.** data-todo, Toast mit späterer URL, Hinweisbalken, Datenstand im Fuß. Der Prototyp behauptet nie mehr, als er kann.
6. **Eine Persona trägt die Kohärenz.** Interessen, Mitgliedschaften und laufende Arbeit einer Person erscheinen konsistent auf allen Seiten und erklären, warum Vorauswahlen und Empfehlungen so sind, wie sie sind.

## Arbeiten und Testen

- Hub-Tests: `pnpm vitest run src/lib/hub`. Mocks für `$app/navigation`, `$app/state`,
  `$lib/helpers/toast.js` im Stil von `src/lib/components/__tests__/AMBResourceCard.test.js`.
- Upstream-Prüfungen (`pnpm run check`, `lint`, `test`) laufen in der Pipeline als Information,
  nicht blockierend; Vergleichswert in `STATUS.md`.
- Hub-Texte nur Deutsch, direkt im Code; kein Import aus `$lib/paraglide` in Hub-Dateien.
- Formatierung nach `.prettierrc`; vor jedem Commit `pnpm prettier --write <Hub-Dateien>`.
- **Sandbox-Falle auf Jörgs Mac:** Node-Programme beenden sich in der Claude-Shell nicht. Aufrufe so
  starten und das Log lesen:
  `perl -e 'alarm 600; exec @ARGV' pnpm vitest run src/lib/hub > /tmp/hub-test.log 2>&1; tail -40 /tmp/hub-test.log`
- Upstream holen: `git fetch upstream main --tags && git merge --no-edit upstream/main`. Konflikte
  gibt es nur in den oben genannten berührten Dateien.
