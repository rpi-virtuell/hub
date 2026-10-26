# ADR-0001: Wir bauen den reli_hub als Fork der edufeed-App

**Status:** angenommen (2026-10-26)
**Beteiligte:** Jörg Lohrer, Ludger (CI), Claude; Vorlage von Jens Dechow (Prototyp 5)

## Kontext

Der reli_hub soll auf `hub.rpi-virtuell.net` laufen und das Gesicht aus Jens' Klick-Prototyp
tragen: Startseite mit Steuerkonsole, persönlicher Startplatz, Ökosystem-Kacheln. Login, Communities,
Kalender, Editoren, Profile und Kommentare gibt es in der edufeed-App bereits, und Steffen entwickelt
sie dort weiter. Jörg hat auf die edufeed-Subdomains keinen Zugriff. Zur Wahl standen: ein Nachbau
mit eigenem Stack, ein Hub als Modus in Steffens Repo, oder ein Fork mit strukturellem Mitnehmen
seines Stands.

## Entscheidung

Wir forken die edufeed-App mit voller Historie, halten Hub-Code an abgegrenzten Orten
(`docs/HUB.md`, Tabelle „Wo Hub-Code liegt“) und holen Steffens `main` täglich per Pipeline herein.
Die Steuerkonsole ist ein statisches Skript unter MIT-Lizenz, das Partner einbinden.

## Konsequenzen

- Leichter: Steffens Änderungen sind spätestens am nächsten Tag im Hub, ohne Handarbeit pro Änderung.
- Schwerer: Disziplin. Jede weitere berührte Upstream-Datei vergrößert die Konfliktfläche. Ein
  Konflikt zeigt sich als rote Sync-Pipeline und wird lokal gelöst.
- Falsch war sie, wenn der Merge nach Monaten regelmäßig scheitert oder Hub-Features Upstream-Dateien
  brauchen. Dann: Hub-Teile als Vorschlag zu Steffen tragen oder den Hub als Modus upstream anlegen.
