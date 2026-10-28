# Betrieb: Forgejo, GitHub-Spiegel, GitHub Pages, Domain

Stand 28.10.2026. Diese Anleitung richtet sich an die technische Umsetzung. Ziel: Der Prototyp (`index.html`) ist zuerst unter `https://rpi-virtuell.github.io/hub/` erreichbar, danach unter `https://hub.rpi-virtuell.net`.

## Wie der Code fließt

```
gitworkshop.dev (Nostr, reli-hub)  ──pusht main──▶  Forgejo Comenius-Institut/hub  ──Push-Spiegel──▶  GitHub rpi-virtuell/hub  ──Pages──▶  rpi-virtuell.github.io/hub  ──Domain──▶  hub.rpi-virtuell.net
      Quelle, PRs, Issues                           Arbeitskopie, Issues im Projekt           nur Spiegel, nichts direkt ändern          Auslieferung
```

- **Quelle** ist das Nostr-Repo `reli-hub` (nostr://laoc.xyz/reli-hub, Web: gitworkshop.dev). Änderungen kommen dort als Pull Request an und werden nach `main` gemergt.
- **Forgejo** `Comenius-Institut/hub` bekommt `main` nach jedem Merge gepusht (siehe „Laufender Betrieb“). Es ist die Arbeitskopie im Projekt und die Quelle für den Spiegel.
- **GitHub** `rpi-virtuell/hub` ist ein reiner Push-Spiegel von Forgejo. Dort wird nichts direkt bearbeitet; jeder Commit dort würde beim nächsten Spiegeln überschrieben.
- **GitHub Pages** liefert den Inhalt von `main` (Wurzelverzeichnis) aus. Es gibt keinen Build: `index.html` liegt fertig im Repo, die Datei `.nojekyll` verhindert, dass Pages Jekyll darüberlaufen lässt.

## Schritt 1: Push-Spiegel in Forgejo einrichten (einmalig, mit GitHub-Token)

1. Auf GitHub ein Token anlegen: Settings → Developer settings → Personal access tokens → Fine-grained. Repository access: nur `rpi-virtuell/hub`; Permissions: Contents = Read and write, Metadata = Read. Ablaufdatum nach Wahl (Erinnerung setzen).
2. In Forgejo `Comenius-Institut/hub` → Einstellungen → Repository → Abschnitt „Mirror-Einstellungen“ → „Push-Mirror hinzufügen“:
   - Git-Remote-Repository-URL: `https://github.com/rpi-virtuell/hub.git`
   - Autorisierung: Benutzername = GitHub-Konto, Passwort = das Token
   - Intervall: `8h` (Standard); Haken bei „Bei Push synchronisieren“ setzen, damit der Spiegel sofort nach jedem Push läuft
3. Speichern, dann beim neuen Eintrag „Jetzt synchronisieren“. Nach einer Minute zeigt GitHub `main` mit demselben Commit wie Forgejo.

Der Spiegel überträgt alle Branches und Tags. Deshalb liegen auf Forgejo nur Branches, die auch auf GitHub erscheinen dürfen.

## Schritt 2: GitHub Pages aktivieren (einmalig)

1. GitHub `rpi-virtuell/hub` → Settings → Pages.
2. Build and deployment → Source: „Deploy from a branch“; Branch: `main`, Ordner: `/ (root)` → Save.
3. Unter Actions erscheint ein Lauf „pages build and deployment“. Danach ist `https://rpi-virtuell.github.io/hub/` erreichbar. Prüfen:

```bash
curl -sI https://rpi-virtuell.github.io/hub/ | head -5
```

Das Hash-Routing des Prototyps (`#start`, `#profil`, `#oercommunity`) funktioniert unter diesem Pfad ohne weitere Einstellung.

## Schritt 3: Domain hub.rpi-virtuell.net (sobald möglich)

1. **DNS**: einen CNAME-Eintrag anlegen: `hub.rpi-virtuell.net` → `rpi-virtuell.github.io.` (kein A-Record nötig, keine Proxy-Funktion davor). TTL kurz halten, bis alles läuft.
2. **CNAME-Datei im Repo**: Eine Datei `CNAME` mit genau einer Zeile `hub.rpi-virtuell.net` ins Wurzelverzeichnis legen. Wichtig: über den normalen Weg (Pull Request auf gitworkshop oder Push nach Forgejo), nicht über die GitHub-Oberfläche. Trägt man die Domain zuerst in den GitHub-Einstellungen ein, legt GitHub die Datei selbst per Commit auf GitHub an, und der nächste Spiegel-Lauf entfernt sie wieder.
3. **GitHub**: Settings → Pages → Custom domain: `hub.rpi-virtuell.net` eintragen → Save. GitHub prüft den DNS-Eintrag (grüner Haken). Sobald das Zertifikat da ist (meist Minuten, höchstens etwa ein Tag), „Enforce HTTPS“ anhaken.
4. Ab dann leitet `rpi-virtuell.github.io/hub/` auf die Domain um. Prüfen:

```bash
curl -sI https://hub.rpi-virtuell.net/ | head -5
```

Empfohlen, nicht zwingend: In der GitHub-Organisation `rpi-virtuell` unter Settings → Pages die Domain `rpi-virtuell.net` verifizieren (TXT-Eintrag), damit niemand anders Pages-Seiten unter dieser Domain anlegen kann.

## Laufender Betrieb

Nach jedem Merge auf gitworkshop wird `main` nach Forgejo gepusht; der Spiegel und Pages laufen dann von allein (zusammen etwa eine Minute). Befehl im Klon des Nostr-Repos:

```bash
cd ~/repositories/reli-hub && git fetch origin && git checkout main && git merge --ff-only origin/main && git push forgejo main
```

Dabei ist `forgejo` ein zweites Remote: `git remote add forgejo git@git.rpi-virtuell.de:Comenius-Institut/hub.git`.

Nie direkt auf GitHub committen. Issues zum Prototyp werden auf gitworkshop geführt; Forgejo-Issues gehören zur Projektarbeit.

## Wenn etwas nicht geht

- **Spiegel meldet Fehler** (Forgejo, Mirror-Einstellungen, rotes Symbol): meist Token abgelaufen oder ohne Schreibrecht. Neues Token eintragen, „Jetzt synchronisieren“.
- **Pages zeigt 404**: prüfen, ob `index.html` und `.nojekyll` auf `main` im GitHub-Repo liegen und die Pages-Quelle `main` / `/ (root)` ist. Ein Lauf unter Actions zeigt den Fehler.
- **Domain ohne HTTPS / „certificate pending“**: DNS-CNAME prüfen (`dig +short hub.rpi-virtuell.net` muss `rpi-virtuell.github.io.` liefern), dann warten; Enforce HTTPS erst anhaken, wenn das Zertifikat ausgestellt ist.
- **Alter Stand sichtbar**: Browser-Cache; Pages liefert `index.html` mit kurzer Cache-Zeit, ein harter Reload genügt.

## Später: Build-Schritt

Wenn der Svelte-Stack dazukommt, wechselt Pages auf „GitHub Actions“ als Quelle: ein Workflow baut und lädt das Ergebnis hoch (`actions/upload-pages-artifact`, `actions/deploy-pages`). Die Spiegel-Kette bleibt gleich; der Workflow liegt dann unter `.github/workflows/` im Repo und läuft auf GitHub, weil Forgejo ihn nur mitspiegelt.
