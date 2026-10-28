# reli\_hub-Prototyp – Konstruktionsbeschreibung (rekonstruiert)

Oct 26, 2026 · @Joerg

## Lesart

Die Prompts in diesem Dokument sind aus der Datei `relihub-prototyp_5.html` (264 KB, Stand der Termindaten 26.10.2026) zurückgerechnet, nicht Jens’ Originale. Die Datei enthält keine Prompt-Historie; sie enthält aber sehr sprechende Kommentare, Datenstrukturen und eine eingebaute Dokumentation der Steuerkonsole, aus denen sich die Konstruktionslogik Schicht für Schicht ablesen lässt. Abschnitte 2–8 beschreiben diese Logik als Konzept, Abschnitt 9 formuliert daraus eine plausible Prompt-Sequenz, Abschnitt 10 abstrahiert sie zu Regeln, die du für neue Instanzen weiterschreiben kannst.

Drei Lesehilfen vorab:

- Der Prototyp ist eine einzige HTML-Datei ohne Build, ohne Framework, ohne externe Abhängigkeiten außer Google Fonts. Alle „Seiten“ sind `div.view`-Blöcke, zwischen denen per Hash-Routing umgeschaltet wird.
- Zwei Skripte: das erste ist die wiederverwendbare Web Component `relihub-steuerkonsole` (im Kopf als eigenständige Datei `relihub-steuerkonsole.js` gedacht), das zweite die Prototyp-Anwendung mit Beispieldaten, Routing und Kontextprofilen.
- Die Datei trägt an vielen Stellen die Herkunft der Bausteine im Klartext: „Nachbau material.rpi-virtuell.net“, „Nachbau relilab.org“, „Nachbau des ReliDesk-Prototyps“, „Editoren im Stil von edufeed.org“, „Funktionen nach edufeed, Gestaltung in der Sprache des reli\_hub“. Diese Herkunftsangaben sind der Schlüssel zur Konstruktionsweise: Bestehendes wird nachgebaut und über die Konsole verbunden, nicht neu erfunden.

## Leitidee: Steuerkonsole statt Plattform

Der reli\_hub ist im Prototyp keine Website, auf der Inhalte liegen, sondern ein Steuerelement, das auf fremden Seiten eingebettet wird. Der Starttext sagt es wörtlich: „reli\_hub ist keine weitere Plattform. Er verbindet bestehende Angebote: Wer die reli\_hub-Steuerkonsole auf der eigenen Seite einbindet, wird Teil des Ökosystems.“ Daraus folgt die gesamte Bauweise.

Drei Begriffe tragen das Konzept:

- **Steuerkonsole**: das Projektlogo (fünf überlagerte Kreise, FOERBICO) wird zum interaktiven Element. Jeder Kreis ist eine Funktion, jede Funktion hat „Knospen“ (Unteraktionen). Dieselbe Konsole erscheint groß auf der Startseite (als Erklärobjekt) und klein schwebend unten rechts auf jeder angeschlossenen Seite (als Navigation).
- **Ökosystem / Instanzen**: bestehende Angebote (Materialpool, relilab, relidesk, relimentar, narrt, reliGlobal, Konfi-Arbeit, Friedensarbeit EKD, InkRV, Comenius-Institut, edufeed) behalten Design und Funktion. Sie werden „Teil des reli\_hub“, indem sie die Konsole einbinden; sichtbar durch den Vermerk „Teil des reli\_hub“ im Fuß.
- **Mitgenommenes Profil**: ein Schlüssel (Nostr) öffnet alle Seiten; Interessen (Schöpfung, Friedenspädagogik, KI im RU, Sek I) steuern Vorauswahlen, die über die Konsole als URL-Parameter an die Instanzen weitergereicht werden.

Die Datenebene darunter ist Nostr/edufeed: Materialien, Termine und Beiträge sind signierte Ereignisse auf Relays, die jede Instanz anzeigen kann. Der Hub organisiert also drei Ebenen: Navigation (Konsole), Identität (Profil), Daten (Relays).

## Funktionsmodell: fünf Funktionen, zwölf Aktionen

Das Vokabular des gesamten Prototyps ist eine kleine, feste Ontologie: fünf Funktionen im Kreis (im Uhrzeigersinn ab oben, 72° Abstand), jede mit Farbe, Tönung und zwei bis drei Unteraktionen. Alles andere (Konsole, Erklärkarte, Partnerkacheln, Panel-Symbole, Kontextprofile, Routen) referenziert diese Aktions-IDs.

| Funktion | Farbe | Unteraktion (ID) | Route im Hub | Ziel im Prototyp |
| --- | --- | --- | --- | --- |
| reli\_hub | #233E99 (blau) | hub.profil | /profil | Ansicht Profil (setzt „angemeldet“) |
|  |  | hub.home | / | Ansicht Start |
| finden | #008C86 (türkis) | finden.material | /finden/materialpool | Ansicht Materialpool, mit Vorauswahl-Parametern |
|  |  | finden.fortbildungen | /finden/fortbildungen | relilab-Termine (im relilab-Kontext), sonst „später“ |
| erstellen | #F39200 (orange) | erstellen.schreibtisch | /erstellen/schreibtisch | Ansicht relidesk, Tab Schreibtisch |
|  |  | erstellen.labor | /erstellen/labor | Ansicht relilab |
| kooperieren | #D6336C (pink) | kooperieren.communities | /kooperieren/communities | Ansicht Communities |
|  |  | kooperieren.personen | /kooperieren/personen | „später“ |
| veröffentlichen | #7B4FB8 (violett) | veroeffentlichen.lerninhalte | /veroeffentlichen/lerninhalte | Editor Lerninhalt (Bereichswahl, dann 7 Schritte) |
|  |  | veroeffentlichen.termin | /veroeffentlichen/termin | Editor Termin |
|  |  | veroeffentlichen.beitrag | /veroeffentlichen/beitrag | Editor Beitrag (Markdown) |

Regeln, die sich aus dem Code ablesen lassen:

- Die vier Funktionen finden, erstellen, kooperieren, veröffentlichen haben keine eigene Zielseite. Ein Klick auf den Kreis löst nur das Ereignis aus; die Konsole zeigt dann die Knospen. Nur „hub“ navigiert selbst.
- erstellen und veröffentlichen sind als „mit Profil“ markiert (Schloss-Badge). finden und kooperieren sind ohne Anmeldung zugänglich.
- Jede Funktion hat eine Hellton-Variante (`--t-finden` usw.) für Hintergründe, Chips und Kartenrückseiten. Die Partnerkacheln tragen die Farbe der Funktion, die sie primär bedienen (Materialpool = finden, relilab und relidesk = erstellen, Communities = kooperieren, CI und edufeed = hub).
- Jede Aktion hat eine Erklärung (`EX`): Funktionspfad, Titel, ein Absatz, Weiter-Buttons. Diese Texte sind die eigentliche Produktbeschreibung des Hub und tauchen identisch in der Erklärkarte der Startseite und in den Toasts auf.

## Die Steuerkonsole als Web Component

Die Konsole ist als eigenständiges Custom Element `<relihub-steuerkonsole>` gebaut (Shadow DOM, reines SVG, keine externen Dateien). Das ist die zentrale Abstraktion: ein Element, das auf jeder Seite gleich aussieht, aber je nach Einbettungsort anderes tut. Die Geometrie folgt dem Logo (Radius 100, Mittenabstand 98, fünf Kreise); beim Überfahren springt ein Kreis 16 Einheiten heraus und wächst um 5 %.

**Attribute** (laut eingebauter Dokumentation):

| Attribut | Bedeutung | Im Prototyp genutzt |
| --- | --- | --- |
| size | Kantenlänge in px (Standard 240) | 320 auf der Startseite, 240 mobil, 58 schwebend |
| variant | „knospen“ (Unteroptionen wachsen als Kreise heraus) oder „scheibe“ (Kreis teilt sich) | knospen |
| context | Name eines Kontextprofils | hub-start, hub-profil, hub-communities, hub-community, rpi-materialpool, relilab, relidesk |
| base-url | Adresse des Hub | Platzhalter https://relihub.example |
| target | \_self oder \_blank | – |
| config-src | JSON-Datei mit Kontextprofil zum Nachladen | – (vorgesehen) |
| demo | nur Ereignis, keine Navigation | – |
| compact / floating | Kleinform in Kopfzeile bzw. schwebend unten rechts, klappt auf | floating auf allen Unterseiten |
| popover-size / popover-align | Größe und Ausrichtung der aufgeklappten Form | 210 |

**Kontextprofile** sind der Mechanismus, der dieselbe Konsole seitenabhängig macht. `RelihubSteuerkonsole.registerContext(name, profil)` nimmt entgegen: ein globales `target`, globale `params` (werden an alle Ziel-URLs angehängt), pro Aktion `params`, `href` (anderes Ziel) oder `handler` (eigene Funktion; `return false` verhindert die Navigation), und einen Profil-weiten `handler`. Die eingebaute Doku nennt als Beispiel ein Profil „narrt“, das finden.material mit den Themen „antisemitismuskritisch, rassismuskritisch“ vorbelegt.

**Ereignis**: jeder Klick löst `relihub-action` aus (bubbles, composed, cancelable) mit `detail = { action, label, url, context }`. Damit kann eine Gastseite die Konsole nutzen, ohne ihren Code zu kennen.

**Gestaltung** über CSS-Variablen (`--relihub-font`, `--relihub-label`, `--relihub-halo`, `--relihub-blend`, `--relihub-alpha`), damit die Konsole auf hellem wie dunklem Grund funktioniert. Tastaturbedienung und Screenreader-Texte sind eingebaut (`.kbd`, `.sr`).

Das Logo wird außerdem als Mini-Symbol wiederverwendet: `svg.mark` zeichnet die fünf Kreise als Marke, Panel-Überschriften heben jeweils einen Kreis hervor (`data-c`), die Erklärkarte ebenso. Die Konsole ist damit zugleich Navigation, Logo und Legende.

## Ansichten-Architektur: sieben Ansichten, zwei Sorten

Der Prototyp hält sieben Ansichten in einer Datei und schaltet per Hash-Routing (`#start`, `#profil`, `#materialpool?thema=…`, `#relilab?tab=termine`, `#relidesk?tab=schreibtisch`, `#communities`, `#community?c=relilab`) zwischen ihnen um. Entscheidend ist die Zweiteilung: Hub-eigene Ansichten tragen das reli\_hub-Design (Barlow, Papierton, runde Panels), die Instanzen tragen ihr jeweils eigenes Design (Inter/Space Grotesk und Türkis für den Materialpool, Roboto/Oswald und Magenta-Pink für relilab, Outfit und Orange für relidesk). Nur die Konsole ist auf allen gleich.

&#91;embedded content: Architektur · 4 Hub-Ansichten, 4 Instanz-Nachbauten, 1 Konsole, Relays darunter\]

Die Konsole ist in jeder Ansicht mit eigenem `context` eingebettet; die Routing-Pfeile stehen für Links, die Vorauswahlen als URL-Parameter mitnehmen (z. B. Profil → Materialpool mit `thema=Schöpfung&stufe=sek1`). Die Relays sind im Prototyp nur als Beschriftung präsent („Materialdaten aus dem Spiegel vom 22.10.2026, 296 Materialien“, „live vom AMB-Relay“), die Daten selbst sind eingebettete Schnappschüsse oder Beispieldaten.

Die Nachbauten sind erkennbar Rekonstruktionen echter Seiten: der Materialpool mit rotierendem Untertitel („für die Schule / Kita / Gemeinde …“), Alters-Einstieg und „Neu im Pool“; relilab mit Hero-Blobs, Monatskalender, Instagram-Kachelspalte und der originalen Suchleiste; relidesk mit Schule/Gemeinde-Umschalter, Planen/Schreibtisch-Tabs und Zwei-Spalten-Schreibtisch („Auf dem Schreibtisch“, „Das will ich verwenden“). Hinzugefügt wurde jeweils nur: der Vermerk „Teil des reli\_hub“, der Profil-Link zum Hub, die schwebende Konsole und ein Vorauswahl-Banner, wenn die Konsole Parameter übergibt.

## Datenschicht: Nostr-Vokabular, Schnappschüsse, Editoren

Der Prototyp hat keine Netzverbindung, spricht aber durchgehend die Sprache des edufeed-Datenraums. Das ist eine bewusste Konstruktionsentscheidung: die Oberfläche soll zeigen, wie es aussieht, wenn alle Instanzen aus denselben signierten Ereignissen lesen.

| Objekt | Nostr-Form im Prototyp | Woher die Daten | Wo sie erscheinen |
| --- | --- | --- | --- |
| Termine | NIP-52, kind 31923 (zeitbasiert), Quellen mit npub: relilab, relilab-impuls, relilab-Termine-Bot | echter Schnappschuss (`RT_EV`), Stand 26.10.2026 | relilab-Termine (Liste/Monat, Filter-Chips, .ics-Export, Filter-Link), relilab-Kalender, Profil „Passende Veranstaltungen“, Community-Räume |
| Materialien | AMB-Metadaten über Relays (wss://relay.edufeed.org, wss://relay-rpi.edufeed.org) | Beispielliste mit echten Titeln („Neu im Pool“), Fußnote „Spiegel vom 22.10.2026, 296 Materialien“ | Materialpool, Profil „Neue Materialien für dich“ (mit „warum“-Begründung), relidesk-Schreibtisch |
| Beiträge | NIP-23, kind 30023 (Langform-Artikel) | keine; Editor zeigt nur, was passieren würde | Community-Räume (Typ „Artikel“), Profil-News |
| Communities | Beispieldaten, „Texte teils von edufeed.org übernommen“, verifiziert-Schild | 10 Communities, z. T. reale (reliGlobal, Konfiarbeit EKD, narrt, relimentar, CampusCom, KuRU & Schuldek.de, AG Didaktische Metadaten, KPH Wien/NÖ, RPI EKKW/EKHN) | Communities-Übersicht, Räume, Profil „Meine Communities“, relilab-Communities |
| Identität | „Mit Nostr-Schlüssel anmelden“ | Persona Luca Beispiel, Interessen als Chips | Profil, Hub-Box im relidesk, Kontextprofil hub-profil |

**Editoren** sind „Nachbau der edufeed-Editoren“ und öffnen als Overlay über jeder Ansicht. Sie tragen ein Kontext-Badge (reli\_hub, relilab, Materialpool, relidesk oder Community-Name) und belegen Felder kontextabhängig vor: im relilab-Kontext ist der Termin mit Tag „relilab“ und Organisation „relilab“ vorbelegt, sonst mit „Luca Beispiel, Organisator:in“.

- **Termin**: Typ (ganztägig/zeitgebunden), Titel (Pflicht), Beschreibung, Links, Tags, Personen mit Rolle.
- **Lerninhalt**: zuerst Bereichswahl (Elementarpädagogik, Schule, Gottesdienstliche Angebote mit Kindern, Konfi-Arbeit, Jugendarbeit, Hochschule, Erwachsenenbildung, Familienbildung, Seniorenbildung; im Prototyp nur Schule und Konfi-Arbeit freigeschaltet), dann sieben Schritte: Bildungsbereich, Ressourcen-URL, Titel & Beschreibung, Einordnung, Lizenz, Schlagworte, Prüfen & veröffentlichen.
- **Beitrag**: Titel, Markdown-Textfeld mit Werkzeugleiste (fett, kursiv, Überschrift, Link, Bild, Liste, Zitat, Code), Live-Vorschau, Tags. Beim Veröffentlichen erscheint ein Toast: „würde jetzt als Nostr-Langform-Artikel veröffentlicht (NIP-23, kind 30023)“.

Das Muster ist überall gleich: echte Protokollbegriffe und echte Relay-Adressen in der Oberfläche, aber keine echte Schreib- oder Leseoperation. Der Prototyp dokumentiert so die Zielarchitektur, ohne sie zu implementieren.

## Instanzen und Communities

Der Prototyp zieht eine klare Linie, die er auf der Communities-Seite selbst erklärt: Instanzen sind Orte im Ökosystem (Seiten wie relilab oder der Materialpool), Communities sind Menschen, die sich zusammentun. Beides kann verbunden sein („Die relilab-Community steuert und entwickelt die Instanz relilab gemeinsam weiter“), und wo es diesen Bezug gibt, zeigt die Kachel ihn mit „↔ Instanz: relilab“. Das ist die konzeptionelle Antwort auf die Frage, wie Nostr-Communities (edufeed-Logik) und bestehende Websites zusammengehören.

**Communities-Übersicht**: Kacheln mit Avatar, Kurzbio, Mitgliederzahl, Verifiziert-Schild und Rückseite (Flip wie bei den Partnerkacheln), Filter nach Alle / Meine / Themen / Zielgruppen / Institute & Netzwerke, Suche, „+ Community gründen“. Beziehung zum Nutzer in drei Stufen: nichts, „folge ich“, „Mitglied“.

**Community-Raum** („Funktionen nach edufeed.org, Gestaltung reli\_hub“): linke Navigation mit Übersicht, Inhalte (Artikel, Lernen, Kalender), Kanäle (#allgemein-Chat), Mitglieder, Einstellungen. Kalender und Einstellungen sind für Nichtmitglieder gesperrt (Schloss); Beitritt per Anfrage an die Moderation oder per Einladungscode. Jede Inhaltsart hat ihren Erstell-Knopf, der den passenden edufeed-Editor mit dem Community-Namen als Kontext öffnet.

Zwei Konstruktionsdetails sind für die Weiterentwicklung wichtig:

- Ein Community-Raum kann im Hub (`#community?c=relilab`) oder eingebettet in einer Instanz (`#relilab?tab=communities` → Raum im relilab-Rahmen) erscheinen; derselbe Render-Code, anderer Rahmen. Die Instanz zeigt nur die Communities, die in ihr aktiv sind (Flag `rl: 1`).
- Serien (z. B. relilab-Serien, „Bilderbuchstunde“ bei relimentar) hängen an Communities, nicht an Instanzen: „Die Serien im relilab werden von Akteursgemeinschaften verantwortet, die sich als Communities verstehen.“

## Prototyp-Konventionen

Einige wiederkehrende Mechanismen machen aus den Nachbauten einen vorführbaren Klick-Prototyp. Sie sind so konsequent eingesetzt, dass sie wahrscheinlich als Regeln vorgegeben waren:

| Konvention | Umsetzung | Wirkung |
| --- | --- | --- |
| Nicht Gebautes wird benannt, nicht versteckt | `data-todo="…"` an jedem Link ohne Ziel; Klick zeigt einen Toast „… ist im Prototyp noch nicht gebaut“ | kein toter Link, jede Lücke ist sichtbar |
| Konsolen-Ziele ohne Ansicht zeigen die spätere URL | `later(d)`: Toast „führt später hierhin: https://relihub.example/…“ | die Zielarchitektur wird auch dort erklärt, wo nichts gebaut ist |
| Hinweis-Leiste für Vorführungen | fixe „Prototyp“-Leiste unten links mit Sprung zu Start, Profil, Materialpool, relilab, relidesk | Betrachter können jede Ansicht direkt anspringen |
| Eine Persona | Luca Beispiel (LB), Interessen Schöpfung, Friedenspädagogik, KI im RU, Sek I, Mitglied in relilab und narrt | konsistente Vorauswahlen, Empfehlungen „warum“, Schreibtisch „Schöpfung erzählen, Kl. 6“ |
| Anmeldung als Zustand, nicht als Funktion | `LOGGED` wird beim Betreten des Profils gesetzt, beim Abmelden gelöscht; ändert Beschriftungen (Anmelden/Mein Profil) und das Ziel von „hub“ | zeigt die Profil-Logik ohne echte Authentifizierung |
| Nachbau-Hinweis in der Instanz | relidesk trägt einen Hinweisbalken „ist ein Prototyp … nur nachgestellt“; Fußzeilen nennen Datenstand und Relay | Betrachter wissen, was echt ist |
| Touch-Regel für Flip-Kacheln | erstes Antippen dreht, zweites öffnet; Maus: Hover dreht, Klick öffnet | Rückseiten (Beschreibungen) auch mobil erreichbar |
| Barrierefreiheit als Grundausstattung | `aria-live` für die Erklärkarte, Fokusringe, `prefers-reduced-motion`, Tastatursteuerung der Konsole, Screenreader-Texte | kein nachträgliches Thema |
| Eine Datei, kein Build | alles inline, Fonts von Google, Konsole mit Verweis auf eine spätere Datei `relihub-steuerkonsole.js` | per Mail versendbar, überall lauffähig |

## Rekonstruierte Prompt-Sequenz

Die Datei heißt `_5`, also mindestens fünf Iterationen. Die Schichtung im Code (Konsole zuerst, dann Hub-Ansichten, dann Nachbauten, dann Editoren, dann Communities, zuletzt Termine via Nostr) legt eine Reihenfolge nahe. Die folgenden Prompts sind so formuliert, dass sie den vorliegenden Stand erzeugen würden; sie sind Rekonstruktion, nicht Protokoll.

**P0 · Briefing (vermutlich als Systemkontext oder erste Nachricht)**

> Wir entwickeln im Projekt FOERBICO (Comenius-Institut) den „reli\_hub“, einen Startplatz in die digitale Welt der Religionspädagogik. Der Hub ist keine weitere Plattform, sondern verbindet bestehende Angebote: rpi-virtuell Materialpool, rpi-virtuell Fortbildungskalender, relilab, relidesk, relimentar, narrt, reliGlobal, Konfi-Arbeit, Friedensarbeit EKD, InkRV, Comenius-Institut, edufeed. Die Datenbasis ist der Nostr-Datenraum von edufeed (Materialien als AMB-Metadaten, Termine als NIP-52-Kalenderereignisse, Beiträge als NIP-23-Artikel, Communities nach edufeed-Logik). Nutzer:innen melden sich mit einem Nostr-Schlüssel an und nehmen ihr Profil auf alle angeschlossenen Seiten mit. Das Logo sind fünf überlagerte Kreise; sie stehen für fünf Funktionen: reli\_hub, finden, erstellen, kooperieren, veröffentlichen. Baue einen Klick-Prototyp als eine einzige HTML-Datei ohne Build und ohne Framework, der dieses Konzept vorführt. Deutsch, Du-Ansprache (relidesk siezt, das bleibt so). Was nicht gebaut ist, soll sichtbar als „noch nicht gebaut“ erscheinen, nie als toter Link.

**P1 · Die Steuerkonsole als Komponente**

> Mache aus dem Logo ein wiederverwendbares Steuerelement `<relihub-steuerkonsole>` als Web Component mit Shadow DOM, reinem SVG, ohne externe Dateien. Fünf Kreise mit Radius 100, Mittenabstand 98, Farben: reli\_hub #233E99, finden #008C86, erstellen #F39200, kooperieren #D6336C, veröffentlichen #7B4FB8. Beim Überfahren springt ein Kreis heraus; beim Klick wachsen Unteroptionen als „Knospen“ (alternativ Variante „scheibe“). Unteraktionen: hub.profil, hub.home; finden.material, finden.fortbildungen; erstellen.schreibtisch, erstellen.labor; kooperieren.communities, kooperieren.personen; veroeffentlichen.lerninhalte, veroeffentlichen.termin, veroeffentlichen.beitrag. Jeder Klick löst ein DOM-Ereignis `relihub-action` aus. Attribute: size, variant, context, base-url, target, config-src, demo, compact, floating, popover-size, popover-align. Kontextprofile über `registerContext(name, {target, params, actions, handler})`, damit dieselbe Konsole auf jeder Seite anderes auslösen kann. Tastatur- und Screenreader-tauglich, Gestaltung über CSS-Variablen. Schreibe die Einbindungs-Dokumentation als Kommentar in die Datei.

**P2 · Startseite mit Erklärkarte**

> Baue die Startseite (nicht angemeldet): Kopfzeile mit Marke und „Anmelden“, Claim „Dein Startplatz in die digitale Welt der Religionspädagogik“, Eyebrow „offen · vernetzt · digital“, die Konsole groß in der Mitte, darunter eine Erklärkarte, die beim Klick auf Kreis oder Knospe den Bereich erklärt (Funktionspfad, Titel, ein Absatz, Weiter-Buttons; erstellen und veröffentlichen mit Badge „mit Profil“). Darunter „Das Ökosystem des reli\_hub“ mit Flip-Kacheln je Partner (Vorderseite: Kürzel, Name, Rolle; Rückseite: Beschreibung) in der Farbe der primären Funktion. Fußzeile „ein Vorhaben von FOERBICO · Prototyp“.

**P3 · Profilseite**

> Baue die Profilseite (angemeldet) für die Persona Luca Beispiel mit Interessen Schöpfung, Friedenspädagogik, KI im Religionsunterricht, Sekundarstufe I, @relilab. Panels: Neue Materialien für dich (mit „warum“-Begründung und Quelle), News aus deinem Netz, Meine Communities, Passende Veranstaltungen, Weiterarbeiten (Schreibtisch im relidesk, Labor im relilab). Die Konsole schwebt klein unten rechts; im Kontext hub-profil übergibt finden.material die Interessen als Parameter an den Materialpool.

**P4 · Nachbau Materialpool**

> Baue material.rpi-virtuell.net als eigene Ansicht nach: eigene Schrift und Farbe (Inter/Space Grotesk, Türkis), Kopfzeile mit Stöbern/Gemerkt/Mein Profil, Hero mit rotierendem Untertitel, Suche, beliebte Themen, Nach Alter einsteigen, Aktuelle Empfehlung, Neu im Pool (echte Titel). Füge nur hinzu: Fußvermerk „Teil des reli\_hub“ und Datenstand der Relays, die schwebende Konsole mit Kontext rpi-materialpool, und ein Banner „Vorauswahl über die reli\_hub-Steuerkonsole“, wenn thema/stufe-Parameter ankommen.

**P5 · Nachbau relilab, dann relilab-Termine via Nostr**

> Baue relilab.org nach (Magenta-Pink, Roboto/Oswald, Hero mit Blobs und Claim „… ist, was du draus machst!“, Monatskalender, Instagram-Kacheln, Suchformular). Konsole im Kontext relilab: erstellen.labor bleibt hier, finden.material übergibt thema=Digitalität. Ergänze dann eine Unterseite „relilab-Termine via Nostr“: Liste und Monatsansicht, Suche, Filter-Chips, Quellenangabe mit npubs (relilab, relilab-impuls, relilab-Termine-Bot), .ics-Export der gefilterten Termine, kopierbarer Filter-Link, „+ Termin eintragen“ öffnet den Termin-Editor. Verwende den beigefügten Schnappschuss der NIP-52-Ereignisse (kind 31923).

**P6 · Nachbau relidesk**

> Baue den ReliDesk-Prototyp in der Farbe von „erstellen“ nach: Hinweisbalken „ist ein Prototyp“, Umschalter Schule/Gemeinde, Tabs Planen und Schreibtisch, Planen mit Eingabe „Weltreligionen, Klasse 7“, Aktuelles, Direkt einsteigen (Bildungsstufe, Kompetenz, Materialart); Schreibtisch mit zwei Spalten „Auf dem Schreibtisch“ und „Das will ich verwenden“ und Lucas Sammlung „Schöpfung erzählen, Kl. 6“. Hub-Box „Angemeldet über den reli\_hub als Luca Beispiel“. Stöbern führt in den Materialpool.

**P7 · Editoren nach edufeed**

> Baue die edufeed-Editoren als Overlays nach, die aus jeder Ansicht über veröffentlichen.\* geöffnet werden: Termin (ganztägig/zeitgebunden, Titel, Beschreibung, Links, Tags, Personen mit Rolle), Lerninhalt (erst Bereichswahl, dann sieben Schritte: Bildungsbereich, Ressourcen-URL, Titel & Beschreibung, Einordnung, Lizenz, Schlagworte, Prüfen & veröffentlichen), Beitrag (Markdown mit Werkzeugleiste und Vorschau, Tags). Jeder Editor zeigt ein Kontext-Badge (reli\_hub, relilab, Materialpool, relidesk oder Community) und belegt Felder je nach Kontext vor. Beim Veröffentlichen nur ein Toast, der sagt, was passieren würde (kind 31923 bzw. 30023).

**P8 · Communities und Community-Räume**

> Baue eine Communities-Übersicht (Funktionen nach edufeed, Gestaltung reli\_hub): Kacheln mit Flip, Filter Alle/Meine/Themen/Zielgruppen/Institute & Netzwerke, Suche, „+ Community gründen“, Erklärbox „Instanzen und Communities“. Verwende diese Liste realer Communities mit Texten von edufeed.org: … Zeige den Bezug zur Instanz („↔ Instanz: relilab“). Baue dazu den Community-Raum: Seitennavigation Übersicht / Artikel / Lernen / Kalender / #allgemein / Mitglieder / Einstellungen; Kalender und Einstellungen nur für Mitglieder; Beitritt per Anfrage oder Einladungscode; Erstell-Knöpfe öffnen die Editoren mit Community-Kontext. Derselbe Raum soll auch eingebettet im relilab erscheinen (Tab Communities, nur Communities mit relilab-Bezug).

**P9 · Kontextprofile und Routing verdrahten**

> Registriere für jede Ansicht ein Kontextprofil (hub-start, hub-profil, hub-communities, hub-community, rpi-materialpool, relilab, relidesk). Regel: Was eine Ansicht hat, erreicht die Konsole intern (go); was sie selbst ist, quittiert sie mit Toast („Du bist bereits im Materialpool“); veröffentlichen.\* öffnet den Editor; alles andere zeigt per Toast die spätere URL. Hash-Routing mit eigener Navigation (funktioniert auch in Vorschauen, die Links abfangen), Prototyp-Leiste unten links, Titel je Ansicht.

Dazwischen liegen mit Sicherheit Korrekturschleifen (Touch-Verhalten der Flip-Kacheln, mobile Breiten, reduzierte Bewegung, Kontextnamen), die sich als Sonderfälle im Code niedergeschlagen haben.

## Konstruktionsregeln und Beschreibungs-Template

Abstrahiert man die Sequenz, bleiben sechs Regeln, nach denen der Prototyp gebaut ist. Sie sind das, was sich als Konstruktionsweise weiterschreiben lässt, unabhängig von einzelnen Ansichten.

1. **Ontologie zuerst.** Fünf Funktionen und ihre Unteraktionen werden einmal als IDs, Farben und Erklärtexte festgelegt. Alles Weitere referenziert diese IDs. Eine neue Funktion wäre ein Eingriff in die Ontologie; eine neue Instanz nicht.
2. **Ein Element, viele Kontexte.** Die Konsole ist eine Komponente mit festem Verhalten; Unterschiede zwischen Seiten liegen ausschließlich im Kontextprofil (Parameter, Ziele, Handler). Nichts an der Konsole wird pro Seite geändert.
3. **Nachbauen, nicht neu gestalten.** Eine bestehende Instanz wird in eigenem Design rekonstruiert. Der Hub fügt genau vier Dinge hinzu: den Vermerk „Teil des reli\_hub“, den Profil-Link, die schwebende Konsole, das Vorauswahl-Banner.
4. **Daten im Zielvokabular.** Oberfläche und Beschriftung sprechen Nostr/edufeed (kinds, NIPs, Relays, npubs), auch wenn die Daten Beispiele oder Schnappschüsse sind. So bleibt der Prototyp anschlussfähig an die spätere Implementierung.
5. **Lücken sind sichtbar.** data-todo, Toast mit späterer URL, Hinweisbalken, Datenstand im Fuß. Der Prototyp behauptet nie mehr, als er kann.
6. **Eine Persona trägt die Kohärenz.** Interessen, Mitgliedschaften und laufende Arbeit einer Person erscheinen konsistent auf allen Seiten und erklären, warum Vorauswahlen und Empfehlungen so sind, wie sie sind.

**Template: Eine neue Instanz an den reli\_hub anbinden** (als Beschreibung, die du pro Partner ausfüllen und als Prompt verwenden kannst):

```markdown
## Instanz: <Name>
Quelle: <URL der echten Seite>
Primäre Funktion: finden | erstellen | kooperieren | veröffentlichen | hub
Eigenes Design: Schrift <…>, Leitfarbe <…>, Kopfzeile <Elemente>, Fuß <Elemente>
Nachzubauende Bereiche: <Hero, Listen, Formulare … mit echten Beispieltexten>
Hub-Ergänzungen: Vermerk „Teil des reli_hub“, Profil-Link, schwebende Konsole (context="<name>"), Vorauswahl-Banner für Parameter <thema|stufe|…>

## Kontextprofil <name>
params (global): <z. B. quelle=<name>>
finden.material: params <thema=…>
finden.fortbildungen: <intern | später>
erstellen.schreibtisch / erstellen.labor: <intern | Toast „Du bist bereits …“ | später>
kooperieren.communities: <Hub | eingebettet mit Filter auf Communities dieser Instanz>
veroeffentlichen.termin / .lerninhalte / .beitrag: Editor mit Kontext-Badge <name>, Vorbelegungen <Tags, Organisation, Bereich>
hub: Start oder Profil je nach Anmeldezustand

## Daten
Materialien: <Relay, AMB-Felder, Datenstand>
Termine: <npubs der Quellen, NIP-52 kind 31923>
Communities mit Bezug zu dieser Instanz: <Liste, Flag „aktiv in <name>“>

## Noch nicht gebaut
<Liste der data-todo-Ziele mit späterer URL>
```

Dasselbe Schema lässt sich für eine neue Hub-Ansicht (z. B. Personen, Fortbildungskalender) oder einen weiteren Editor verwenden; dort entfällt der Block „Eigenes Design“, weil Hub-Ansichten die reli\_hub-Gestaltung tragen.

## Offene Stellen und Ansatzpunkte

Der Prototyp markiert selbst, wo er aufhört. Diese Stellen sind zugleich die Punkte, an denen sich die Konstruktionsbeschreibung weiterentwickeln lässt.

| Stelle | Stand im Prototyp | Was zu beschreiben wäre |
| --- | --- | --- |
| finden.fortbildungen außerhalb relilab | Toast „später“; Partnerkachel „rpi-virtuell Fortbildungskalender“ ohne Ziel | ein gemeinsamer Kalender über alle Quellen (NIP-52), analog zur relilab-Termine-Seite, als Hub-Ansicht |
| kooperieren.personen | Toast „später“ | Personenprofile (kind 0), Folgen, Kontakt; Verhältnis zu Community-Mitgliedschaft |
| Anmeldung | „Mit Nostr-Schlüssel anmelden“ ist ein Link auf die Profilseite | Signer-Fluss (NIP-07/NIP-46), Profil aus kind 0, Interessen als Tags |
| Materialdaten | eingebetteter Schnappschuss, Relay-Adressen nur im Fuß | Live-Abfrage über die genannten Relays; AMB-Felder, die das „warum“ der Empfehlungen speisen |
| config-src | Attribut vorgesehen, nicht genutzt | Kontextprofile als JSON pro Partner, damit Einbindung ohne JavaScript-Kenntnis möglich ist |
| Lerninhalt-Editor | nur Bereiche Schule und Konfi-Arbeit freigeschaltet | Vokabulare je Bildungsbereich (SKOS), Lizenzen, Einordnungsfelder |
| Community gründen, Interessen bearbeiten, Merkliste | data-todo | Nostr-Entsprechungen (Gruppen, Listen) und wo sie im Hub erscheinen |
| Partner ohne Nachbau | relimentar, narrt, reliGlobal, Konfi-Arbeit, Friedensarbeit EKD, InkRV, CI, edufeed nur als Kacheln | je Partner das Template aus dem vorigen Abschnitt ausfüllen; reliGlobal und KuRU sind als Communities bereits angelegt |

Für ein Gespräch mit Jens wären drei Fragen am ergiebigsten: ob die Konsole tatsächlich als eigenständige Datei `relihub-steuerkonsole.js` geplant ist (der Kopf deutet es an), ob die Editoren Wrapper um die echten edufeed-Editoren werden sollen oder eigene Implementierungen, und welche Instanz als erste echte Einbindung dient.
