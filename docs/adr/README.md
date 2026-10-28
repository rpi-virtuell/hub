# Architekturentscheidungen (ADR)

Hier liegen die Grundentscheidungen des reli_hub-Prototyps als kurze, nummerierte Dokumente. Sie sind Referenzpunkte: Wer eine Entscheidung ändern will, schreibt ein neues ADR, das das alte ersetzt, statt das alte umzuschreiben. So bleibt nachvollziehbar, was wann aus welchem Grund galt.

## Vorlage

```markdown
# ADR-000N: Titel

## Status
angenommen · TT.MM.JJJJ · Entscheidung der Maintainer · Bezug: Issue `<id>` (gitworkshop)
(oder: vorgeschlagen · ersetzt durch ADR-000M)

## Kontext
Was war die Ausgangslage, welches Issue oder welche Frage hat die Entscheidung ausgelöst?

## Entscheidung
Was gilt ab jetzt, in ganzen Sätzen. Verworfene Alternativen mit einem Satz, warum nicht.

## Folgen
Was ändert sich für Prototyp, Daten und Weiterentwicklung; was wird dadurch leichter oder schwerer.
```

Regeln: Deutsch; Produktsicht (keine Projektverwaltung, keine Berichtsbezüge); keine Bewertungen von Personen, Rollen und Nostr-Handles statt Namen.

## Liste

| Nr. | Titel | Status |
|---|---|---|
| [0001](0001-farbsystem.md) | Farbsystem: Fünf-Bereiche-Ontologie, FOERBICO-Blau und -Orange, Kontrastregel | angenommen |
| [0002](0002-instanzen-als-nachbau.md) | Instanzen als Nachbau im Hub | angenommen |
| [0003](0003-teilen-in-communities.md) | Teilen in Communities nach dem edufeed-Modell | angenommen |
| [0004](0004-newsletter-als-nip-b0.md) | Newsletter einer Community als NIP-B0-Lesezeichen | angenommen |
| [0005](0005-artikel-im-finden.md) | Artikel und Nachrichten gehören zu „finden“ | angenommen |
