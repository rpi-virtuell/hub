// Vier plus ich (ADR-0010): Ordnung der Konsole, Graustufen, Themen und Vorschau der Startseite.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, consoleScript, contrast, html } from './helfer.ts';
const c = consoleScript(), s = appScript();
const block = (re: RegExp) => (s.match(re) || [''])[0];
const fn = (name: string) => block(new RegExp(`  function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}`));
const FUNCS = new Function((c.match(/const FUNCS = \[[\s\S]*?\n  \];/) || [''])[0] + '; return FUNCS;')() as { id: string; label: string; self?: boolean; subs: { id: string; label: string; kurz?: string; stand?: string; form?: string }[] }[];

Deno.test('Konsole: ich oben, dann Menschen, Communities, Materialien, Termine', () => {
  assertEquals(FUNCS.map((f) => f.id), ['ich', 'menschen', 'communities', 'material', 'termine']);
  assert(FUNCS[0].self === true && /const a = \(-90 \+ 72 \* i\)/.test(c), '„ich“ steht nicht oben oder navigiert nicht selbst');
  assert(!/'(hub|finden|erstellen|kooperieren|veroeffentlichen)\.[a-z]+'/.test(c + s), 'frühere Kennungen im Code');
});

Deno.test('Matrix: jedes der vier Dinge hat vier Knospen in der Reihenfolge der Aktionsformen', () => {
  const formen = ['sehen', 'zeigen', 'erarbeiten', 'kontakt'];
  for (const f of FUNCS.slice(1)) {
    assertEquals(f.subs.map((u) => u.form), formen, `${f.id}: Reihenfolge der Aktionsformen`);
    assertEquals(f.subs[0].id, f.id + '.finden');
  }
  assert(FUNCS[0].subs.every((u) => !u.form), '„ich“ steht außerhalb der Matrix');
  for (const k of formen) assert(new RegExp(`\\n    ${k}: \\{ label: '[^']+', blatt: '[^']+', color: '#[0-9A-F]{6}', d: '[^']+' \\}`).test(c), `Zeichen für ${k} fehlt`);
  for (const f of FUNCS.slice(1)) for (const u of f.subs) assert(u.label.split(' ').length <= 2 && (u.kurz || '').length > 0 && (u.kurz || '').length <= 11, `${u.id}: Name oder Kurzname passt nicht`);
  assert(/'data-form', s\.form/.test(c) && /s\.form \? FORMEN\[s\.form\]\.d/.test(c) && /form: FORM\[action\] \|\| null/.test(c), 'Form fehlt an der Knospe oder im Ereignis');
  assert(/FORMEN\[FORM\[act\]\]\.label/.test(c), 'Form fehlt im Linktext für Screenreader');
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
  const formen = ['sehen', 'zeigen', 'erarbeiten', 'kontakt'];
  for (const k of formen) assert(routen.includes(`'${k}':`) && ex.includes(`'${k}': {`), `Blatt ${k} ohne Route oder Erklärung`);
  const ids = FUNCS.flatMap((f) => [f.id, ...f.subs.map((u) => u.id)]).concat(formen);
  for (const m of ex.matchAll(/\n    '([a-z.]+)': \{/g)) assert(ids.includes(m[1]), `Erklärung ohne Aktion: ${m[1]}`);
  for (const m of ex.matchAll(/subs:\[([^\]]*)\]/g)) for (const x of m[1].split(',')) assert(ids.includes(x.replace(/'/g, '').trim()), `Unbekannte Knospe in subs: ${x}`);
});

Deno.test('Graustufen: Stand an der Knospe, im Ereignis, in der Karte; lesbar', () => {
  const grau = FUNCS.flatMap((f) => f.subs).filter((u) => u.stand);
  assertEquals(grau.map((u) => `${u.id}:${u.stand}`).sort(), ['communities.vorstellen:offen', 'menschen.zusammen:offen', 'termine.vorbereiten:offen']);
  assert(/const GRAU = \{ spaeter: \{ fill: '#5F6672', text: '#FFFFFF' \}, offen: \{ fill: '#C9CED6', text: '#2B2F36' \} \}/.test(c), 'GRAU');
  assert(contrast('#FFFFFF', '#5F6672') >= 4.5 && contrast('#2B2F36', '#C9CED6') >= 4.5, 'Kontrast der Graustufen');
  assert(/stand: STAND\[action\] \|\| null/.test(c) && /\(später\)/.test(c) && /\(noch nicht gebaut\)/.test(c), 'Stand fehlt im Ereignis oder im Linktext');
  assert(/'communities\.vorstellen': \{[^}]*grau:'offen'/.test(s) && /'material\.schreibtisch': \{[^\n]*\['Bearbeiten und remixen','#relidesk\?tab=schreibtisch','spaeter'\]/.test(s), 'Karte oder Handlung ohne Graustufe');
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
  assert(/<form class="st-themen" id="stThemen"[^>]*>\s*<label for="stThemenFeld">/.test(html) && /placeholder="#Frieden #Konfi #Schöpfung"/.test(html), 'Themenfeld fehlt oder ohne Beschriftung');
  assert(/speicher\('relihub-themen'/.test(s), 'Themen bleiben nicht im Browser');
  assert(/\n  themenRender\(\);[^\n]*\n  route\(\);\n\}\)\(\);/.test(s) && !/stChips\.addEventListener[^\n]*\n  themenRender\(\);/.test(s), 'Gespeicherte Themen werden vor der Definition von esc gezeichnet');
  const v = fn('stVorschau'), h = fn('stVorschauHtml'), l = fn('stLaden');
  assert(/ozSichtbar\(e\)/.test(v) && /pass\.length \? pass : alle/.test(v) && /gefiltert: pass\.length > 0/.test(v), 'Vorschau ohne Sichtbarkeitsregel oder Rückfall');
  assert(/Nichts zu deinen Themen/.test(h) && /werden geladen/.test(h) && /können gerade nicht geladen werden/.test(h), 'Zustände der Vorschau');
  assert(/#oekosystem\?wahl=\$\{encodeURIComponent\(e\.id\)\}/.test(h) && /esc\(b\)/.test(h) && /sichereUrl\(ozBild\(e\)\)/.test(h), 'Eintrag nicht maskiert oder ohne Weg in den Überblick');
  assert(/if \(ozLive \|\| stStand === 'laeuft' \|\| stStand === 'live'\) return;/.test(l) && /ozQuellenLaden\(\)/.test(l), 'Vorschau lädt mehrfach oder eigene Abfragen');
  assert(/data-thema-weg="\$\{esc\(t\)\}"/.test(fn('themenRender')) && /'#' \+ esc\(t\)/.test(fn('stThemenZeile')), 'Themen nicht maskiert');
  assert(/ich\.interessen'\) \{ go\('start\?zu=themen'\)/.test(fn('standardAktion')) && /get\('zu'\) === 'themen'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'Knospe „meine Themen“ ohne Ziel');
});

Deno.test('Sicht von den Aktionsformen: dieselbe Matrix, Blätter und Knospen getauscht', () => {
  assert(/const FUNCS_F = \[FUNCS\[0\]\]\.concat\(FORM_ORDER\.map\(/.test(c) && /f\.subs\.find\(u => u\.form === k\)/.test(c), 'Zweite Sicht wird nicht aus der Matrix abgeleitet');
  assert(/'sicht'\]/.test(c) && /get funcs\(\) \{ return this\.sicht === 'formen' \? FUNCS_F : FUNCS; \}/.test(c), 'Attribut sicht fehlt');
  assert(!/\bFUNCS\.(forEach|filter)\(/.test((c.match(/class RelihubSteuerkonsoleElement[\s\S]*?\n  const RelihubSteuerkonsole = /) || [''])[0]), 'Klasse nutzt noch die feste Liste');
  assert(/const far = s\.ding \? DING\[s\.ding\] : f;/.test(c) && /sicht: this\.sicht/.test(c), 'Knospe ohne Farbe ihres Dings oder Ereignis ohne Sicht');
  assert(/<div class="st-sicht" id="stSicht" role="group"[^>]*>.*data-sicht="dinge" aria-pressed="true".*data-sicht="formen" aria-pressed="false"/.test(html), 'Umschalter fehlt');
  const z = fn('sichtSetzen');
  assert(/speicher\('relihub-sicht', SICHT\)/.test(z) && /setAttribute\('sicht', 'formen'\)/.test(z) && /removeAttribute\('sicht'\)/.test(z) && /aria-pressed/.test(z), 'Umschalter merkt oder setzt die Sicht nicht');
  assert(/\n  sichtSetzen\(speicher\('relihub-sicht'\)\);\n  themenRender\(\);/.test(s), 'Gemerkte Sicht wird beim Start nicht gesetzt');
  for (const k of ['sehen', 'zeigen', 'erarbeiten', 'kontakt']) assert(new RegExp(`'${k}': \\{ t:'Ich möchte [^']+', p:'[^']+', subs:\\[('[a-z]+\\.[a-z]+',?){4}\\] \\}`).test(s), `Karte ${k}`);
});

Deno.test('Mitte der Blume: Ich möchte', () => {
  assert(/class: 'mitte', 'pointer-events': 'none'/.test(c) && /this\.text\(mitte, 'Ich möchte'/.test(c), 'Schrift in der Mitte fehlt oder fängt Klicks ab');
  assert(contrast('#1B2440', '#FFFFFF') >= 4.5, 'Kontrast der Mitte');
});
