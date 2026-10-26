# STATUS — Logbuch

Neuester Eintrag oben. Jeder Eintrag beantwortet drei Fragen:
**Was ist passiert? Wo steht das Projekt? Was ist der nächste Schritt?**

Regeln stehen in `HUB.md`, Begründungen in
`superpowers/specs/2026-10-26-hub-repo-design.md` — hier steht nur der Stand.

---

## 2026-10-26 — Repo angelegt (ADR-0001)

- Fork der edufeed-App (Upstream `main` 49986bad, v0.10.0-rc.4) nach `Comenius-Institut/hub`
  gepusht, Remote `upstream` eingetragen. Doku-Gerüst, Spezifikation und Umsetzungsplan liegen in
  `docs/`.
- Upstream-Tests am 26.10.2026 lokal: 1071 von 1073 Testdateien grün, 2 rot (scripts/lib/**tests**/publish-forms-build.amb.test.mjs scripts/lib/**tests**/publish-forms-build.test.mjs). Das ist der Vergleichswert; Upstream-Prüfungen sind nicht blockierend (HUB.md).
- Stand: noch keine Hub-Dateien, keine Pipeline.
- Nächster Schritt: Betrieb (hub.env.example, Compose, Woodpecker), dann Steuerkonsole und Startseite
  nach `superpowers/plans/2026-10-26-hub-repo-plan.md`.
