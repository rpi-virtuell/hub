# STATUS — Logbuch

Neuester Eintrag oben. Jeder Eintrag beantwortet drei Fragen:
**Was ist passiert? Wo steht das Projekt? Was ist der nächste Schritt?**

Regeln stehen in `HUB.md`, Begründungen in
`superpowers/specs/2026-10-26-hub-repo-design.md` — hier steht nur der Stand.

---

## 2026-10-26 — Stufe 1 im Repo fertig, Inbetriebnahme offen

- Fertig auf `main` (4e712a4f): Startseite nach Prototyp 5 (Steuerkonsole, Erklärkarte, zwölf
  Kacheln, Werkstatt aus dem FOERBICO-Verzeichnis), schwebende Konsole auf allen Seiten mit
  Zielzuordnung, Steuerkonsole als `static/steuerkonsole/relihub-steuerkonsole.js` (MIT), Logo,
  `hub.env.example`, Compose (Port 8081), Pipelines `.woodpecker/build-deploy.yaml` und
  `upstream-sync.yaml`. Hub-Tests: 27 in 11 Dateien grün (`pnpm vitest run src/lib/hub src/routes/__tests__`),
  `pnpm run check` 0 Fehler. Sichtprüfung lokal mit `pnpm dev` bestanden.
- Offen (Jörg/Ludger, Spec „Voraussetzungen“): Repo im Woodpecker aktivieren, Secrets
  `deploy_ssh_user`, `deploy_ssh_key`, `forgejo_token`; DNS `hub.rpi-virtuell.net` vom CNAME auf den
  Container-Host `46.225.82.96`; Apache-vHost auf Port 8081 mit Zertifikat; Server-Repo unter der
  `deploy-app.sh`-Konvention; `.env` nach `hub.env.example`; Cron „upstream-sync“ täglich auf `main`.
  Stand 26.10., 18 Uhr: DNS zeigt noch auf `rpi-virtuell.de`, kein Deploy.
- Nächster Schritt: Voraussetzungen schaffen, erster Deploy, `upstream-sync` einmal manuell starten
  (Plan Task 7). Danach Stufe 2: Startplatz, eigene Spezifikation.

## 2026-10-26 — Repo angelegt (ADR-0001)

- Fork der edufeed-App (Upstream `main` 49986bad, v0.10.0-rc.4) nach `Comenius-Institut/hub`
  gepusht, Remote `upstream` eingetragen. Doku-Gerüst, Spezifikation und Umsetzungsplan liegen in
  `docs/`.
- Upstream-Tests am 26.10.2026 lokal: 1071 von 1073 Testdateien grün, 2 rot (scripts/lib/**tests**/publish-forms-build.amb.test.mjs scripts/lib/**tests**/publish-forms-build.test.mjs). Das ist der Vergleichswert; Upstream-Prüfungen sind nicht blockierend (HUB.md).
- Stand: noch keine Hub-Dateien, keine Pipeline.
- Nächster Schritt: Betrieb (hub.env.example, Compose, Woodpecker), dann Steuerkonsole und Startseite
  nach `superpowers/plans/2026-10-26-hub-repo-plan.md`.
