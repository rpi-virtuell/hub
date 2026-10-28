# ADR-0003: Teilen in Communities nach dem edufeed-Modell

## Status
angenommen · 28.10.2026 · Entscheidung der Maintainer · Bezug: Issue `ef87ccaa…` (Formular Artikel → in Communities teilen)

## Kontext
Die Editoren des Prototyps sind Nachbauten der edufeed-Editoren. Beim Veröffentlichen eines Beitrags fehlte die Möglichkeit, ihn in Communities zu teilen, die die edufeed-App bereits kennt. Dort liefert eine Komponente die eigenen Communities als Liste mit Checkboxen, „Alle auswählen/abwählen“ und einem Status je Zeile; Communities ohne Schreibrecht sind sichtbar, aber gesperrt.

## Entscheidung
1. Beitrags- und Termin-Editor bekommen denselben Abschnitt „Mit Communities teilen (optional)“: Liste der Communities, denen die Persona folgt oder in denen sie Mitglied ist; nur Mitglieder dürfen teilen, andere Zeilen sind gesperrt („Nur Mitglieder“). Vorbelegt ist die Community, aus deren Raum der Editor geöffnet wurde, oder die Community der verbundenen Instanz.
2. Datenform wie in der edufeed-App: Wird der Beitrag aus einem Community-Raum heraus veröffentlicht, trägt er selbst ein `h`-Tag dieser Community. Das Teilen in weitere Communities ist ein Repost (kind 16) mit einem `h`-Tag je Community, nicht ein Repost pro Community. Es gibt keine Freigabestufe; Moderation geschieht nachträglich.
3. Im Prototyp erscheint der Beitrag sofort im Artikel-Tab der gewählten Räume und im Profil-Panel „Artikel aus deinen Communities“; der Toast nennt die Nostr-Form.

Verworfen: eine eigene Teilen-Logik nur für den Prototyp (würde später nicht zur App passen); Teilen erst nach dem Veröffentlichen über ein Kontextmenü (so macht es die App bei Artikeln, im Prototyp ist der Weg im Editor klarer).

## Folgen
Der Lerninhalt-Editor bekommt den Abschnitt in einer späteren Runde (in der App ist er dort ein eigener Schritt). Wer die Persona-Daten ändert (Mitgliedschaften, Folgen), ändert die angebotene Liste. Die Svelte-Umsetzung kann die Komponente der App direkt übernehmen.
