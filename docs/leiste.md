# Leiste unten links: `<relihub-leiste>`

## Zweck

Die Leiste ist die Klammer um die Instanzen und Communities des reli_hub. Du wechselst den Ort (Start, Materialpool, relilab, relidesk, FOERBICO oder eine deiner Communities) und bleibst doch im Ökosystem: Die Leiste steht auf jeder Seite an derselben Stelle.

Sie ist ein eigenständiges Custom Element mit Shadow DOM. Die Anwendung liefert nur die Daten und reagiert auf das Ereignis; Aussehen und Verhalten stecken im Element.

## Abgrenzung zur Steuerkonsole

| | Leiste | Steuerkonsole |
|---|---|---|
| Frage | Wo bin ich? | Was will ich tun? |
| Beschriftung | „Orte“ | „Tätigkeiten“ (Überschrift im aufgeklappten Popover) |
| Inhalt | Instanzen und Communities | finden, erstellen, kooperieren, veröffentlichen, hub |
| Element | `<relihub-leiste>` | `<relihub-steuerkonsole>` |

Darum steht „Profil“ nicht in der Leiste: Das Profil ist eine Tätigkeit der Konsole (`hub.profil`) und steht in der Kopfzeile.

## Daten

`RelihubLeiste.setItems(items)` setzt die Einträge aller Leisten der Seite. Jeder Eintrag:

```js
{ id: 'materialpool', label: 'Materialpool', short: 'Pool', href: '#materialpool', kind: 'instanz' }
```

- `id`: eindeutig, wird mit dem Attribut `current` verglichen
- `label`: sichtbarer Text
- `short` (optional): kürzerer Text unter 640 px Breite
- `href`: Ziel des Eintrags (normaler Link, Mittelklick öffnet einen neuen Tab)
- `kind`: `'instanz'` oder `'community'`; Communities stehen nach einem Trennstrich mit Ring-Symbol

Im Prototyp stehen die Instanzen in `LEISTE`; `leisteItems()` hängt nach der Anmeldung die Communities an, in denen die Person Mitglied ist, als `id: 'c-<cid>'` mit `href: '#community?c=<cid>'`. Gefolgte Communities erscheinen nicht.

## Attribute

- `current`: ID des aktiven Eintrags; er wird weiß hervorgehoben
- `label`: Beschriftung links (Standard „Orte“), unter 640 px ausgeblendet

## Ereignis

Ein Klick löst `relihub-leiste-select` aus (bubbles, composed, cancelable) mit `detail = { id, href, kind }`. Ohne `preventDefault()` navigiert das Element selbst zu `href`. Der Prototyp fängt das Ereignis ab und nutzt sein Hash-Routing:

```js
document.addEventListener('relihub-leiste-select', e => { e.preventDefault(); go(e.detail.href.slice(1)); });
```

Der Knopf „⋯“ am Ende der Leiste (`data-cfg`, `aria-label="Leiste anpassen"`) löst `relihub-leiste-config` aus (bubbles, composed, nicht abbrechbar) mit `detail = { items }`, den aktuellen Einträgen. Das Element selbst ändert nichts; die Anwendung entscheidet, was angepasst werden darf.

## Konfiguration

Zwei Ebenen, beide in der Anwendung (das Element bleibt datenfrei):

- **Pro Community/Instanz:** `LEISTE_KONTEXT` nennt je Ansicht die Einträge, die dort nicht erscheinen, z. B. `{ relilab: { aus: ['relidesk', 'oercommunity'] } }`. Ohne Eintrag zeigt eine Instanz alles. „Start“ bleibt immer als Anker; Communities werden nie ausgeblendet.
- **Pro Person:** `leisteItems()` zieht zusätzlich die IDs ab, die die Person abgewählt hat. Sie stehen als JSON-Liste im Speicher unter `relihub-leiste-aus`. Der Knopf „⋯“ öffnet das Panel `#leisteCfg` (ein Kästchen je Instanz, „Fertig“ schließt, Escape ebenso); eine Änderung wirkt sofort.
- **Vorauswahl:** alle Instanzen sichtbar. Ist der Speicher gesperrt oder ungültig, bleibt alles sichtbar.
- **Offen:** Reihenfolge per Drag-and-drop und die Aufnahmeregel für neue Instanzen (Faden „Anordnung“). Das Panel sagt „Reihenfolge ändern folgt“.

## CSS-Variablen

- `--relihub-leiste-bg`: Hintergrund (Standard `#1D1D1B`)
- `--relihub-leiste-fg`: Schrift (Standard `#FFFFFF`); der aktive Eintrag kehrt beide um

## Einbettung

Gedacht wie bei der Steuerkonsole als eigene Skript-Datei; im Prototyp steht das Skript inline als zweites `<script>` in `index.html`.

```html
<script src="relihub-leiste.js" defer></script>
<relihub-leiste id="leiste" label="Orte"></relihub-leiste>
<script>
  addEventListener('DOMContentLoaded', () => {
    RelihubLeiste.setItems([
      { id: 'start', label: 'Start', href: 'https://hub.rpi-virtuell.net/#start', kind: 'instanz' },
      { id: 'relilab', label: 'relilab', href: 'https://hub.rpi-virtuell.net/#relilab', kind: 'instanz' }
    ]);
    document.getElementById('leiste').setAttribute('current', 'relilab');
  });
</script>
```

## Was fehlt

- Reihenfolge ändern (Drag-and-drop) und die Aufnahmeregel für neue Instanzen: Faden „Anordnung“, siehe Abschnitt Konfiguration.
- Profil-Daten: Welche Communities angezeigt werden, kommt im Prototyp aus der Persona (`COMM`); echte Daten folgen mit der Personen-Ansicht.
