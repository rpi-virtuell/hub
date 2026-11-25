// Vier plus ich (ADR-0010): Ordnung der Konsole, Graustufen, Themen und Vorschau der Startseite.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, consoleScript, contrast, html } from './helfer.ts';
const c = consoleScript(), s = appScript();
const block = (re: RegExp) => (s.match(re) || [''])[0];
const fn = (name: string) => block(new RegExp(`  function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}`));
const FUNCS = new Function((c.match(/const FUNCS = \[[\s\S]*?\n  \];/) || [''])[0] + '; return FUNCS;')() as { id: string; label: string; self?: boolean; subs: { id: string; label: string; kurz?: string; stand?: string; form?: string; farbe?: string }[] }[];

Deno.test('Konsole: ich oben, dann Menschen, Materialien, Termine, Artikel (ADR-0015)', () => {
  assertEquals(FUNCS.map((f) => f.id), ['ich', 'menschen', 'material', 'termine', 'news']);
  assert(FUNCS[0].self === true && /const a = \(-90 \+ 72 \* i\)/.test(c), '„ich“ steht nicht oben oder navigiert nicht selbst');
  assert(!/'(hub|finden|erstellen|kooperieren|veroeffentlichen)\.[a-z]+'/.test(c + s), 'frühere Kennungen im Code');
  assert(!/'(communities\.(finden|vorstellen|aufbauen|mitmachen)|menschen\.(finden|zeigen|zusammen|folgen)|material\.(schreibtisch|rueckmeldung)|termine\.(eintragen|vorbereiten|teilnehmen)|ich\.(interessen|start))'/.test(c + s), 'Kennungen der früheren Belegung im Code');
});

Deno.test('Belegung: Knospen je Blatt, vier Wege, Reagieren ist kein Menüpunkt', () => {
  const k = (id: string) => FUNCS.find((f) => f.id === id)!.subs.map((u) => u.id.split('.')[1]);
  assertEquals(k('ich'), ['menschen', 'materialien', 'profil', 'termine', 'communities'], 'Profil in der Mitte, daneben Materialien und Termine, außen Personen und Communities');
  assert(/\{ id: 'ich', label: 'ich', offen: 'mein\(e\)',/.test(c) && /this\.text\(pop, f\.offen \|\| f\.label,/.test(c), 'aufgeklappt steht „mein(e)“ auf dem Blatt');
  assertEquals(k('menschen'), ['personen', 'communities']);
  assertEquals(k('material'), ['finden', 'teilen', 'erstellen', 'bearbeiten']);
  assertEquals(k('termine'), ['finden', 'teilen', 'erstellen', 'bearbeiten']);
  assertEquals(k('news'), ['finden', 'teilen', 'veroeffentlichen', 'bearbeiten']);
  assertEquals(FUNCS.find((f) => f.id === 'news')!.label, 'Artikel');
  assert(!/Beitr[aä]g/.test(JSON.stringify(FUNCS)), 'Wort Beitrag in der Blume');
  const weg = (id: string) => FUNCS.find((f) => f.id === id)!.subs.map((u) => u.form);
  assertEquals(weg('ich'), [undefined, undefined, undefined, undefined, undefined], '„ich“ steht außerhalb der Wege');
  assertEquals(weg('menschen'), ['suchen', 'suchen']);
  assertEquals(weg('material'), ['suchen', 'teilen', 'anlegen', 'bearbeiten']);
  assertEquals(weg('termine'), ['suchen', 'teilen', 'anlegen', 'bearbeiten']);
  assertEquals(weg('news'), ['suchen', 'teilen', 'anlegen', 'bearbeiten']);
  for (const [k, wort] of [['suchen', 'finden'], ['teilen', 'teilen'], ['anlegen', 'erstellen'], ['bearbeiten', 'bearbeiten']]) assert(new RegExp(`\\n    ${k}: \\{ label: '${wort}', blatt: '${wort}', color: '#[0-9A-F]{6}', d: '[^']+' \\}`).test(c), `Zeichen für ${wort} fehlt`);
  // Farbpunkte: eine Knospe, die zu einem anderen Ding gehört als ihr Blatt, trägt dessen Farbe
  const farbe = Object.fromEntries(FUNCS.flatMap((f) => f.subs).filter((u) => u.farbe).map((u) => [u.id, u.farbe]));
  assertEquals(farbe, { 'ich.communities': 'communities', 'ich.menschen': 'menschen', 'ich.materialien': 'material', 'ich.termine': 'termine', 'material.bearbeiten': 'ich', 'termine.bearbeiten': 'ich', 'news.bearbeiten': 'ich' });
  assert(/const fb = s\.farbe && FARBE\[s\.farbe\]/.test(c) && /menschen: \['#AF4112', '#FFFFFF'\], communities: \['#AF4112', '#FFFFFF'\]/.test(c) && /material: \['#85992C', '#1B2400'\]/.test(c) && /ich: \['#2A3B8E', '#FFFFFF'\]/.test(c), 'Communities tragen die Farbe der Menschen, Eigenes ist blau');
  assert(!/reagieren|Rückmeldung geben|teilnehmen|folgen'/.test(JSON.stringify(FUNCS)), 'Reagieren, Teilnehmen oder Folgen als Menüpunkt');
  for (const f of FUNCS) for (const u of f.subs) assert(u.label.split(' ').length <= 3 && (u.kurz || '').length > 0 && (u.kurz || '').length <= 11, `${u.id}: Name oder Kurzname passt nicht`);
  assert(/d\.stand === 'offen'\) \{ toast\(/.test(fn('standardAktion')), 'Hellgraue Knospe ohne Hinweis');
});

Deno.test('Konsole: jede Aktion hat Route, Erklärung und Farben', () => {
  const routen = (c.match(/const ROUTES = \{[\s\S]*?\n  \};/) || [''])[0], ex = block(/const EX = \{[\s\S]*?\n  \};/), root = (html.match(/:root\s*\{([\s\S]*?)\}/) || ['', ''])[1];
  for (const f of FUNCS) {
    for (const v of ['c', 'x', 'text']) assert(root.includes(`--relihub-${v}-${f.id}:`), `--relihub-${v}-${f.id} fehlt`);
    assert(ex.includes(`'${f.id}': {`), `Erklärung ${f.id} fehlt`);
    for (const u of f.subs) {
      assert(routen.includes(`'${u.id}':`), `Route ${u.id} fehlt`);
      assert(ex.includes(`'${u.id}': {`), `Erklärung ${u.id} fehlt`);
    }
  }
  const formen = ['suchen', 'teilen', 'anlegen', 'bearbeiten'];
  for (const k of formen) assert(routen.includes(`'${k}':`) && ex.includes(`'${k}': {`), `Blatt ${k} ohne Route oder Erklärung`);
  const ids = FUNCS.flatMap((f) => [f.id, ...f.subs.map((u) => u.id)]).concat(formen);
  for (const m of ex.matchAll(/\n    '([a-z.]+)': \{/g)) assert(ids.includes(m[1]), `Erklärung ohne Aktion: ${m[1]}`);
  for (const m of ex.matchAll(/subs:\[([^\]]*)\]/g)) for (const x of m[1].split(',')) assert(ids.includes(x.replace(/'/g, '').trim()), `Unbekannte Knospe in subs: ${x}`);
});

Deno.test('Graustufen: Stand an der Knospe, im Ereignis, in der Karte; lesbar', () => {
  const grau = FUNCS.flatMap((f) => f.subs).filter((u) => u.stand);
  assertEquals(grau.map((u) => `${u.id}:${u.stand}`).sort(), [], 'keine Knospe ist mehr grau');
  assert(/const GRAU = \{ spaeter: \{ fill: '#5F6672', text: '#FFFFFF' \}, offen: \{ fill: '#C9CED6', text: '#2B2F36' \}, anmelden: \{ fill: '#C9CED6', text: '#2B2F36' \} \}/.test(c), 'GRAU');
  assert(contrast('#FFFFFF', '#5F6672') >= 4.5 && contrast('#2B2F36', '#C9CED6') >= 4.5, 'Kontrast der Graustufen');
  assert(/stand: STAND\[action\] \|\| null/.test(c) && /\(später\)/.test(c) && /\(noch nicht gebaut\)/.test(c), 'Stand fehlt im Ereignis oder im Linktext');
  assert(/'termine\.bearbeiten': \{[^\n]*\['Im Hub ändern','','offen'\]/.test(s) && /'material\.bearbeiten': \{[^\n]*\['Übernehmen und verändern','#relidesk\?tab=schreibtisch','spaeter'\]/.test(s), 'Karte oder Handlung ohne Graustufe');
  assert(/if \(d\.stand\) toast\(/.test(fn('standardAktion')) && /d\.stand === 'offen'\) \{ toast\(/.test(fn('standardAktion')), 'Kein Hinweis beim Klick auf eine graue Knospe');
  assert(/if \(stand\) \{/.test(fn('exKnopf')) && /aria-disabled="true"/.test(fn('exKnopf')), 'Graue Handlung in der Karte fehlt');
});

Deno.test('themenAus: Schlagworte ohne #, klein, ohne Zeichen, höchstens acht', () => {
  const themenAus = new Function(fn('themenAus') + '; return themenAus;')() as (t: unknown) => string[];
  assertEquals(themenAus('#Frieden, konfi  #Frieden'), ['frieden', 'konfi']);
  assertEquals(themenAus('<b>x</b> "Schöpfung" a'), ['bxb', 'schöpfung']);
  assertEquals(themenAus(null), []);
  assertEquals(themenAus('a1 b2 c3 d4 e5 f6 g7 h8 i9 j0').length, 8);
  assertEquals(themenAus('x'.repeat(60))[0].length, 40);
});

Deno.test('themaPasst: Name, Untertitel und t-Tags; ohne Themen passt alles', () => {
  const tagWerte = (ev: { tags: string[][] }, n: string) => ev.tags.filter((t) => t[0] === n).map((t) => t[1]);
  const themaPasst = new Function('ozEntesc', 'ozName', 'ozUntertitel', 'tagWerte', fn('themaPasst') + '; return themaPasst;')((t: string) => t, (e: { n: string }) => e.n, (e: { u: string }) => e.u, tagWerte) as (e: unknown, t: string[]) => boolean;
  assert(themaPasst({ n: 'Psalm 104', u: '' }, []));
  assert(themaPasst({ n: 'Frieden lernen', u: '' }, ['frieden']));
  assert(themaPasst({ n: 'x', u: 'Einheit für die Konfi-Arbeit' }, ['konfi']));
  assert(themaPasst({ n: 'x', u: '', ev: { tags: [['t', 'Schöpfung']] } }, ['schöpfung']));
  assert(!themaPasst({ n: 'Psalm 104', u: 'Lob', ev: { tags: [['t', 'Bibel']] } }, ['frieden']));
});

Deno.test('Startseite: Themenfeld, Vorschau mit Rückfall, maskiert, Laden nur einmal', () => {
  assert(/<form class="st-themen" id="stThemen"[^>]*>\s*<label for="stThemenFeld">/.test(html) && /placeholder="Advent, Frieden, relilab"/.test(html), 'Themenfeld fehlt oder ohne Beschriftung');
  assert(/speicher\('relihub-themen'/.test(s), 'Themen bleiben nicht im Browser');
  assert(/\n  themenRender\(\);[^\n]*\n  route\(\);\n\}\)\(\);/.test(s) && !/stChips\.addEventListener[^\n]*\n  themenRender\(\);/.test(s), 'Gespeicherte Themen werden vor der Definition von esc gezeichnet');
  const v = fn('stVorschau'), h = fn('stVorschauHtml'), l = fn('stLaden');
  assert(/ozSichtbar\(e\)/.test(v) && /pass\.length \? pass : alle/.test(v) && /gefiltert: pass\.length > 0/.test(v), 'Vorschau ohne Sichtbarkeitsregel oder Rückfall');
  assert(/Nichts zu deinen Themen/.test(h) && /werden geladen/.test(h) && /können gerade nicht geladen werden/.test(h), 'Zustände der Vorschau');
  assert(/#oekosystem\?wahl=\$\{encodeURIComponent\(e\.id\)\}/.test(h) && /esc\(b\)/.test(h) && /sichereUrl\(ozBild\(e\)\)/.test(h), 'Eintrag nicht maskiert oder ohne Weg in den Überblick');
  assert(/if \(ozLive \|\| stStand === 'laeuft' \|\| stStand === 'live'\) return;/.test(l) && /ozQuellenLaden\(\)/.test(l), 'Vorschau lädt mehrfach oder eigene Abfragen');
  assert(/data-thema-weg="\$\{esc\(t\)\}"/.test(fn('themenRender')) && /'#' \+ esc\(t\)/.test(fn('stThemenZeile')), 'Themen nicht maskiert');
  assert(/'ich': \{[^\n]*\['Themen eintragen','#start\?zu=themen'\]/.test(s) && /get\('zu'\) === 'themen'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'Weg zu den Themen fehlt');
});

Deno.test('Sicht vom Tun her: dieselbe Belegung, Blätter sind die vier Wege, Knospen die Dinge', () => {
  assert(/const FUNCS_F = \[FUNCS\[0\]\]\.concat\(FORM_ORDER\.map\(/.test(c) && /f\.subs\.filter\(u => u\.form === k\)/.test(c), 'Zweite Sicht wird nicht aus der Belegung abgeleitet');
  assert(/'sicht', 'mitte', 'stiel'\]/.test(c) && /get funcs\(\) \{ return this\.belegung \|\| \(this\.sicht === 'formen' \? FUNCS_F : FUNCS\); \}/.test(c), 'Attribut sicht fehlt');
  assert(/sicht: this\.sicht/.test(c) && /'data-form', s\.form/.test(c) && /s\.form \? FORMEN\[s\.form\]\.d/.test(c), 'Ereignis ohne Sicht oder Knospe ohne Zeichen ihres Wegs');
  assert(/<div class="st-sicht" id="stSicht" role="group"[^>]*>.*data-sicht="dinge".*role="switch" aria-checked="false".*data-sicht="formen"/.test(html), 'Umschalter fehlt');
  const z = fn('sichtSetzen');
  assert(/speicher\('relihub-sicht', SICHT\)/.test(z) && /mitteStand\(\)/.test(z) && /aria-checked/.test(z), 'Umschalter merkt oder setzt die Sicht nicht');
  assert(/\n  sichtSetzen\(speicher\('relihub-sicht'\)\);\n  themenRender\(\);/.test(s), 'Gemerkte Sicht wird beim Start nicht gesetzt');
  const zahl: Record<string, number> = { suchen: 5, teilen: 3, anlegen: 3, bearbeiten: 3 };
  assert(/k === 'bearbeiten' \? \[Object\.assign\(\{ ding: 'ich', name: 'mein Profil' \}/.test(c) && /subs:\['material\.bearbeiten','termine\.bearbeiten','news\.bearbeiten','ich\.profil'\]/.test(s), 'unter bearbeiten steht zuletzt das eigene Profil');
  assert(/s\.ding \? \(s\.name \|\| DING\[s\.ding\]\.label\)/.test(c) && /name: 'Personen'/.test(c) && /name: 'Communities'/.test(c), 'vom Tun her trägt die Knospe den Namen ihres Dings, bei Menschen Personen und Communities');
  for (const k of Object.keys(zahl)) {
    assert(new RegExp(`'${k}': \\{ t:'Ich möchte [^']+', p:'[^']+', subs:\\[('[a-z]+\\.[a-z]+',?){${zahl[k] + (k === 'bearbeiten' ? 1 : 0)}}\\] \\}`).test(s), `Karte ${k}`);
    assertEquals(FUNCS.slice(1).flatMap((f) => f.subs).filter((u) => u.form === k).length, zahl[k], `Knospen am Weg ${k}`);
  }
});

Deno.test('Mitte der Blume: der Ort, sonst „Ich möchte“ (ADR-0013)', () => {
  assert(/class: 'mitte', 'pointer-events': 'none'/.test(c) && /const mText = ort \? ort\.label : 'Ich möchte'/.test(c) && /this\.text\(mitte, mText/.test(c), 'Schrift in der Mitte fehlt oder fängt Klicks ab');
  assert(/const ort = this\.sicht === 'formen' \? null : attrMitte \? \{ label: attrMitte \} : profMitte \|\| null/.test(c), 'Ort aus Profil oder Attribut, nicht in der Sicht von den Aktionsformen');
  assert(/'sicht', 'mitte', 'stiel'\]/.test(c), 'Attribut mitte wird beobachtet');
  assert(contrast('#1B2440', '#FFFFFF') >= 4.5 && contrast('#FFFFFF', '#6D3BE0') >= 4.5, 'Kontrast der Mitte, weiß und in Instanzfarbe');
});

Deno.test('Mitte plus vier am Beispiel relilab: Zeichen, Kontext, Abschnitt', () => {
  assert(/registerContext\('hub-start', \{\n    mitte: \{ label: 'ReliHub' \}/.test(s) && /registerContext\('hub-start-float', \{\n    mitte: \{ label: 'ReliHub' \}/.test(s), 'Startseite: ReliHub in der Mitte');
  assert(/registerContext\('relilab', \{\n    mitte: \{ label: 'relilab', kurz: 'rl', color: '#6D3BE0' \}/.test(s), 'relilab: Name, Kürzel, Farbe');
  assert(/class: 'ort', r: 94, fill: ort\.color/.test(c) && /\.mini svg circle\.ort\{opacity:1\}/.test(c) && /', Ort: ' \+ ort\.label/.test(c), 'Zeichen am schwebenden Knopf trägt den Ort, auch für Screenreader');
  assert(/<section class="rl-hubband"[\s\S]{0,900}<relihub-steuerkonsole id="rlBlume" size="230" context="relilab" variant="knospen">/.test(html) && /In der Mitte steht relilab/.test(html), 'Abschnitt in der relilab-Ansicht');
  assert(/<relihub-steuerkonsole id="rlFlower" floating[^>]*context="relilab"/.test(html), 'schwebende Konsole der relilab-Ansicht bleibt');
});

Deno.test('Stiel mit den Orten (ADR-0014): Aufbau, Schnittstelle, Weitergabe aus der Leiste', async () => {
  assert(/stielAn\(\) \{[\s\S]{0,200}if \(at === 'off'\) return false;\s*return this\.compact \|\| at !== null;/.test(c), 'an in der Kompaktform, groß nur mit Attribut, off blendet aus');
  assert(/sc\.setAttribute\('aria-label', 'Orte im ReliHub'\)/.test(c) && /a\.setAttribute\('aria-current', 'page'\)/.test(c), 'Navigation benannt, aktueller Ort markiert');
  assert(/new CustomEvent\('relihub-leiste-select', \{ detail: \{ id: o\.id, href: o\.href, kind: o\.kind \|\| 'instanz', quelle: 'stiel' \}/.test(c), 'Klick löst dasselbe Ereignis aus wie die Leiste');
  assert(/setOrte\(items\) \{/.test(c) && /setOrt\(id\) \{/.test(c) && /a\.textContent = o\.label/.test(c), 'Schnittstelle; Namen als Text, nicht als HTML');
  const l = (html.match(/function setItems\(items\) \{[\s\S]*?\n  \}/) || [''])[0];
  assert(/RelihubSteuerkonsole\.setOrte\(ITEMS\.filter\(o => o\.kind !== 'zuschnitt' && o\.id !== 'start'\)\)/.test(l), 'Leiste reicht ihre Orte weiter, ohne Zuschnitt und ohne Start');
  assert(/RelihubSteuerkonsole\.setOrt\(leisteEl\.getAttribute\('current'\)\)/.test(s), 'aktueller Ort folgt der Leiste');
  assert(/setWeitereOrte\(items\) \{/.test(c) && /RelihubSteuerkonsole\.setWeitereOrte\(PARTNERS\.filter\(/.test(s) && /kind: p\[4\] \? 'instanz' : 'ausblick'/.test(s), 'weitere Orte des Ökosystems aus der Partnerliste');
  assert(/if \(d\.kind === 'ausblick'\) \{/.test(s) && /a\.rel = 'noopener'/.test(c), 'Ort ohne Ansicht führt zur Kachel, fremde Seite öffnet neu');
  assert(!/id="startFlower"[^>]* stiel/.test(html) && !/id="rlBlume"[^>]* stiel/.test(html), 'Startseite und Abschnitt bei relilab ohne Stiel (ADR-0017)');
  assert(contrast('#1F3A22', '#E4F0E1') >= 4.5 && contrast('#FFFFFF', '#2E7D4F') >= 4.5, 'Kontrast der Blätter am Stiel');
  assert(/id="rlFilterHinweis" hidden/.test(html) && /gefiltert auf <b>relilab<\/b>/.test(s), 'Hinweiszeile zum Filter in der relilab-Ansicht');
  const adr = await Deno.readTextFile(new URL('../docs/adr/0014-stiel-mit-orten.md', import.meta.url));
  assert(/Entwurf/.test(adr) && /Stiel/.test(adr), 'ADR-0014 fehlt');
});
