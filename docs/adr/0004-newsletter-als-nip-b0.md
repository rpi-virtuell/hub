# ADR-0004: Newsletter einer Community als NIP-B0-Lesezeichen

## Status
angenommen · 28.10.2026 · Entscheidung der Maintainer · Bezug: Issue `da392383…` (Finden → Newsletter)

## Kontext
Communities haben Newsletter in fremden Systemen (Mailinglisten, Newsletter-Dienste, Matrix-Räume). Das Issue schlägt vor, diese Newsletter im Hub anzuzeigen. Gesucht war eine Form, die ohne neue Kind-Nummer auskommt, Anmelde-URLs fremder Systeme zulässt und von jedem Client mit einer Abfrage gefunden wird.

## Entscheidung
Je Newsletter veröffentlicht der Community-Schlüssel ein Web-Lesezeichen nach NIP-B0 (kind 39701): `d` = Anmelde-URL ohne Schema, `title` = Name des Newsletters, `content` = Rhythmus und Beschreibung, `t` = `newsletter` (dazu Themen-Tags). Clients fragen `{kinds:[39701], authors:[<community>], '#t':['newsletter']}`. Kommentare dazu sind NIP-22, Löschen ist kind 5.

Verworfen: NIP-51-Sets (kennen nur Nostr-Referenzen, keine URLs); ein Feld im Community-Event kind 10222 (dort bedeutet `r` Relay); das `website`-Feld im kind 0 (nur eine Adresse, kein Rhythmus, keine Mehrzahl).

Im Prototyp: Feld `nl` je Community (Name, Rhythmus, Anmelde-URL), Pille „Newsletter“ auf der Community-Kachel, Zeile im Raum-Kopf, Liste „Newsletter der Communities“ neben den relilab-Terminen mit Fußnote zur Nostr-Form. Fehlt eine gesicherte Anmelde-URL, bleibt der Link als sichtbare Lücke (Toast).

## Folgen
Communities können ihre Newsletter selbst pflegen, ohne dass der Hub eine Liste führt. Die Svelte-Umsetzung liest die Lesezeichen von den Relays der Community. Eine spätere Standardisierung (eigener Tag-Wert, eigene Kind-Nummer) wäre ein neues ADR.
