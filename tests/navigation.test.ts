import { assert } from 'jsr:@std/assert@1';
import { html, appScript, consoleScript, leisteScript, rootVars, contrast } from './helfer.ts';
const block = (re: RegExp) => (appScript().match(re) || [''])[0];   // Ausschnitt aus dem Anwendungsskript
const hblock = (re: RegExp) => (html.match(re) || [''])[0];         // Ausschnitt aus dem HTML

Deno.test('Datenschicht: Grenzen und Rückfall', () => {
  const s = appScript();
  assert(/const RELAYS = \[[^\]]*relay\.edufeed\.org[^\]]*relay-rpi\.edufeed\.org[^\]]*amb-relay\.edufeed\.org/.test(s), 'RELAYS');
  assert(!/groups\.edufeed\.org/.test(html), 'groups.edufeed.org darf nie gelesen werden');
  assert(/TIMEOUT_MS = 8000/.test(s) && /MAX_CONN = 3/.test(s) && /RETRY_MS = 60000/.test(s), 'Grenzen');
  const hf = block(/function hubFetch\(name, filters[\s\S]*?\n  \}/);
  assert(/sessionStorage/.test(hf) && /new WebSocket\(/.test(hf) && /'EOSE'/.test(hf) && /resolve\(/.test(hf) && !/reject\(/.test(hf), 'hubFetch löst immer auf');
  assert(/function datenstand\(viewId, zustand, info\)/.test(s) && /function npubToHex\(/.test(s) && /function evToTermin\(/.test(s), 'Signaturen');
  assert((html.match(/<div class="view"/g) || []).length - 1 === (html.match(/class="stand"/g) || []).length, 'jede Ansicht außer Start hat eine Stand-Zeile');
  assert(/schnappschuss:termine \*\/[\s\S]*let RT_RAW = \[[\s\S]*let RT_STAND = '\d\d\.\d\d\.\d{4}'[\s\S]*\/schnappschuss:termine/.test(s), 'Schnappschuss-Block');
  assert(/RT_EV = RT_RAW\.map\(evToTermin\)/.test(s), 'RT_EV aus RT_RAW');
  assert(/hubFetch\('relilab-termine'/.test(block(/function rtOpen[\s\S]*?\n  \}/)), 'relilab-Termine nutzen die Datenschicht');
  assert(/vom Relay · \$\{/.test(block(/function rtOpen[\s\S]*?\n  \}/)), 'Live-Kennzeichnung nennt die Zahl vom Relay');
  assert(!/Arbeitspaket|Meilenstein|Förderkennzeichen|Projektträger|Zwischenbericht/.test(html), 'Projektsprache in index.html');
});

Deno.test('Schnappschuss-Skript und Doku vorhanden', async () => {
  const t = await Deno.readTextFile(new URL('../tools/schnappschuss.ts', import.meta.url));
  assert(/schnappschuss:termine/.test(t) && /31923/.test(t) && !/groups\.edufeed\.org/.test(t));
  assert(t.includes('\\u003c'), 'Skript maskiert < nicht');
  assert(!/<\//.test(appScript().match(/let RT_RAW = .*/)![0]), 'RT_RAW enthält </');
  const d = await Deno.readTextFile(new URL('../docs/daten.md', import.meta.url));
  assert(/hubFetch/.test(d) && /Stand vom/.test(d) && /Nachbau/.test(d));
  const dj = JSON.parse(await Deno.readTextFile(new URL('../deno.json', import.meta.url)));
  assert(dj.tasks.schnappschuss, 'deno task schnappschuss fehlt');
});

Deno.test('Konsole: Aktivieren meldet sich sofort', () => {
  const c = consoleScript(), s = appScript();
  assert(/new CustomEvent\('relihub-activate'/.test(c), 'Ereignis fehlt');
  assert(/onActivate\(/.test(c), 'Profil-Haken onActivate fehlt');
  assert(/relihub-activate/.test((c.match(/\/\*!?[\s\S]*?\*\//) || [''])[0]), 'Doku-Kommentar nennt das Ereignis nicht');
  assert(/registerContext\('hub-start',\s*\{[\s\S]*?onActivate:/.test(s), 'hub-start nutzt onActivate nicht');
  assert(/_touchAct = true/.test(c), 'Touch-Regel verloren');
});

Deno.test('Konsole: ganze Knospe samt Wort ist Trefferfläche', () => {
  const c = consoleScript();
  assert(/\.out\{[^}]*pointer-events:auto[^}]*cursor:pointer/.test(c), '.out nicht klickbar');
  assert(/\.lbl\{[^}]*pointer-events:none/.test(c), '.lbl verändert');
  assert(/const HIT = 44/.test(c) && /el\('circle', \{ class: 'hit', r: HIT, fill: 'transparent' \}, bud\)/.test(c), 'Treffer-Kreis fehlt');
  assert(/\.bud circle:not\(\.hit\)\{transition/.test(c) && /\.bud:hover circle:not\(\.hit\),\.bud\.kbd circle:not\(\.hit\)\{fill/.test(c) && /\.kbd>circle:not\(\.hit\)/.test(c), 'Treffer-Kreis nicht von Füllung/Fokusring ausgenommen');
});

Deno.test('Konsole: Tutorial- und Direktmodus, eine Standardkette', () => {
  const s = appScript();
  assert(/function speicher\(key, value\)/.test(s) && /try\s*\{[^}]*localStorage/.test(block(/function speicher[\s\S]*?\n  \}/)), 'speicher() fängt Ausnahmen');
  assert(/'relihub-modus'/.test(s) && /function setModus\(m\)/.test(s), 'Modus');
  assert(/function standardAktion\(d, ctx\)/.test(s), 'standardAktion fehlt');
  assert((s.match(/later\(d\); return false;/g) || []).length === 1, 'later() nur in standardAktion');
  assert((s.match(/return standardAktion\(d,/g) || []).length >= 8, 'nicht alle Kontexte enden in der Standardkette');
  assert(/MODUS === 'direkt'/.test(block(/registerContext\('hub-start'[\s\S]*?\n  \}\);/)), 'hub-start kennt den Direktmodus nicht');
  assert(html.includes('href="#hilfe"') && /data-modus="direkt"/.test(s) && /data-modus="tutorial"/.test(s), 'Umschalter');
  assert(/view === 'hilfe'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'route kennt hilfe nicht');
});

Deno.test('Konsole mobil: Sheet statt Sprung, Toleranz beim Tippen', () => {
  const c = consoleScript(), s = appScript();
  assert(/@media \(max-width:640px\)\{[\s\S]*?\.explain\.sheet\{[^}]*position:fixed/.test(html), 'Sheet-Regel fehlt');
  assert(/function kleinerSchirm\(\)/.test(s) && /data-sheet-close/.test(s), 'Sheet-Logik fehlt');
  assert(/const TOUCH_SLACK = 18/.test(c) && /nearest\(p, slack\)/.test(c) && /this\.exclusive\(p\) \|\| this\.nearest\(p, TOUCH_SLACK\)/.test(c), 'Toleranz fehlt');
  assert(/function explainDefault\(\) \{\s*exEl\.classList\.remove\('sheet'\)/.test(s) && /function route\(\) \{\s*exEl\.classList\.remove\('sheet'\)/.test(s), 'Sheet wird bei Routenwechsel nicht geschlossen');
});

Deno.test('Leiste: eigenständiges Widget, klar von der Konsole unterschieden', async () => {
  const l = leisteScript(), s = appScript(), c = consoleScript();
  assert(/customElements\.define\('relihub-leiste'/.test(l) && /relihub-leiste-select/.test(l) && /setItems\(items\)/.test(l), 'Widget');
  assert(/--relihub-leiste-bg/.test(l) && /label/.test(l), 'Variablen oder Beschriftung fehlen');
  assert(html.includes('<relihub-leiste id="leiste" label="Orte"') && !/class="proto"/.test(html), 'Leiste nicht ersetzt');
  assert(/const LEISTE = \[/.test(s) && !/id: 'profil'/.test(block(/const LEISTE = \[[\s\S]*?\n  \];/)), 'LEISTE oder Profil-Eintrag');
  assert(/function leisteItems\(\)/.test(s) && /kind: 'community'/.test(s) && /relihub-leiste-select/.test(s), 'Anwendung nutzt das Widget nicht');
  assert(/Tätigkeiten/.test(c) && /\.cap\{/.test(c), 'Konsole ohne Überschrift');
  const rt = block(/function route\(\)[\s\S]*?window\.scrollTo/), si = rt.indexOf('setItems(leisteItems())');
  assert(si > 0 && si < rt.indexOf('return'), 'setItems läuft nicht bei jedem Routenaufruf');
  const d = await Deno.readTextFile(new URL('../docs/leiste.md', import.meta.url));
  assert(/relihub-leiste-select/.test(d) && /setItems/.test(d) && /Tätigkeiten/.test(d), 'docs/leiste.md unvollständig');
});

Deno.test('rpi-virtuell: eigene Instanz in Leiste, Kachel, Konsole und Community', () => {
  const s = appScript(), v = rootVars();
  const view = hblock(/<div class="view" id="v-rpi-virtuell"[\s\S]*?<\/div>\s*\n<!--/);
  assert(view && /data-stand="nachbau:/.test(view), 'Ansicht fehlt');
  assert(v['rv'] && v['rv-x'] && contrast(v['rv-x'], v['paper']) >= 4.5 && contrast(v['rv-x'], v['card']) >= 4.5, 'rpi-virtuell-Textfarbe unter 4,5:1');
  assert(/'rpi-virtuell'/.test(block(/function route\(\)[\s\S]*?includes\(view\)/)) && /function rvOpen\(qs\)/.test(s), 'Route');
  assert(/registerContext\('rpi-virtuell'/.test(s) && /'rpi-virtuell': 'rpi-virtuell'/.test(s), 'Kontext');
  assert(/id: 'rpi-virtuell', label: 'rpi-virtuell'/.test(block(/const LEISTE = \[[\s\S]*?\n  \];/)), 'Leisten-Eintrag');
  assert(/\['rpi-virtuell', 'Materialpool, Fortbildungen, News', 'finden', 'rv', '#rpi-virtuell'/.test(s) && !/'FK', null/.test(s), 'Partner-Kachel');
  assert(/id: 'rpi-virtuell'[^}]*inst: \['rpi-virtuell', 'rpi-virtuell'\]/.test(block(/const CY = \[[\s\S]*?\n  \];/)), 'Community-Bezug');
  assert(/'finden\.fortbildungen': 'rpi-virtuell\?tab=fortbildungen'/.test(s) && /'#rpi-virtuell\?tab=fortbildungen'/.test(s), 'Fortbildungen haben ein Ziel');
  const rv = block(/function rvOpen[\s\S]*?hubFetch\('rpi-virtuell'[\s\S]*?\]\s*\)/);
  assert(/kinds: \[31923\]/.test(rv) && /kinds: \[30023\]/.test(rv) && /npubToHex\('npub12jguy/.test(rv) && !/amb-relay/.test(rv), 'Filter der Ansicht');
  assert(/mit Teilnahmebescheinigung/.test(view) && /href="#relilab"/.test(view), 'Institutslogik und Verweis auf das relilab');
});

Deno.test('rpi-virtuell: Tabs mit Standard', () => {
  const rv = block(/function rvOpen\(qs\)[\s\S]*?\n  \}/);
  assert(/\['material', 'fortbildungen', 'news'\]\.includes\(/.test(rv) && /: 'material'/.test(rv), 'unbekannter Tab fällt nicht auf material zurück');
});

Deno.test('Navigation: Tabelle, Farben in der Konsole, Lerninhalte in den Materialpool', async () => {
  const c = consoleScript(), s = appScript();
  const d = await Deno.readTextFile(new URL('../docs/navigation.md', import.meta.url));
  assert(/\| Begriff \| Startseite \| Konsole \(Aktion\) \| Ziel \(Route\) \| Leiste \(Instanz\) \| Farbe \| Stand \|/.test(d), 'Tabellenkopf');
  for (const b of ['Material', 'Fortbildungen', 'Beiträge', 'Schreibtisch', 'Labor', 'Communities', 'Personen', 'Lerninhalte', 'Termin', 'Beitrag', 'Profil', 'Start', 'Hilfe']) assert(new RegExp(`\\| ${b} \\|`).test(d), `Zeile ${b} fehlt`);
  assert(/this\.text\(bud, s\.label[^;]*f\.ink, 'out'\)/.test(c) && !/\.out\{[^}]*fill:/.test(c), 'Knospen nicht in Bereichsfarbe');
  assert(/veroeffentlichen\.lerninhalte'\) \{ go\('materialpool'\); openChooser\('materialpool'\)/.test(block(/function standardAktion[\s\S]*?\n  \}/)), 'Lerninhalte springen nicht in den Materialpool');
  const nullZiele = [...block(/const EX = \{[\s\S]*?\n  \};/).matchAll(/go:\['[^']*',null\]/g)].length;
  assert(nullZiele === 1, `offene Ziele in EX: ${nullZiele}, erlaubt ist nur Personen`);
});

Deno.test('Konsole auf der Startseite verankert', () => {
  const s = appScript(), start = hblock(/id="v-start"[\s\S]*?<!-- =+ Ansicht 2/);
  assert(/<relihub-steuerkonsole id="startFloat" floating[^>]*context="hub-start-float"/.test(start), 'schwebende Konsole fehlt auf der Startseite');
  assert(/new IntersectionObserver\(/.test(s) && /\.observe\(document\.getElementById\('startFlower'\)\)/.test(s), 'Observer fehlt');
  assert(/registerContext\('hub-start-float'/.test(s) && /MODUS === 'direkt'/.test(block(/registerContext\('hub-start-float'[\s\S]*?\n  \}\);/)), 'Kontext fehlt');
  assert(/unten rechts/.test(block(/function explainDefault[\s\S]*?\n  \}/)), 'Hinweissatz fehlt');
});

Deno.test('Startseite erzählt die Haltung', () => {
  const start = hblock(/id="v-start"[\s\S]*?<!-- =+ Ansicht 2/);
  assert(!/Startplatz/.test(html), 'Slogan noch da');
  const n = (start.match(/<section class="narrativ">[\s\S]*?<\/section>/) || [''])[0];
  assert(n && (n.match(/<p>/g) || []).length >= 3, 'drei Absätze fehlen');
  assert(/class="einladung"[\s\S]*href="#profil"[\s\S]*data-open="lerninhalt"[\s\S]*data-open="termin"/.test(n), 'Einladung mit drei Wegen fehlt');
  assert(/<small>offen · vernetzt · digital<\/small>/.test(start) && !/class="eyebrow"/.test(start), 'Marke und Eyebrow');
  assert(/offen lizenziert/.test(n) && /Institute/.test(n) && /mitmachen/.test(n), 'Kernaussagen fehlen');
});

Deno.test('Leiste konfigurierbar: pro Community und pro Person', async () => {
  const l = leisteScript(), s = appScript();
  assert(/data-cfg/.test(l) && /relihub-leiste-config/.test(l) && /Leiste anpassen/.test(l), 'Knopf oder Ereignis fehlt');
  assert(/const LEISTE_KONTEXT = \{[\s\S]*relilab: \{ aus: \['relidesk', 'oercommunity'\] \}/.test(s), 'Community-Konfiguration');
  assert(/speicher\('relihub-leiste-aus'/.test(s) && /LEISTE_KONTEXT\[/.test(block(/function leisteItems\(\)[\s\S]*?\n  \}/)), 'leisteItems filtert nicht');
  assert(html.includes('id="leisteCfg"') && /Reihenfolge ändern folgt/.test(html), 'Panel');
  const d = await Deno.readTextFile(new URL('../docs/leiste.md', import.meta.url));
  assert(/relihub-leiste-config/.test(d) && /LEISTE_KONTEXT|pro Community/.test(d), 'Doku');
});
