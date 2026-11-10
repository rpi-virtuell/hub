import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, html } from './helfer.ts';
const s = appScript();
const block = (re: RegExp) => (s.match(re) || [''])[0];
const esc = (t: string) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const sichereUrl = (u: string) => /^https?:\/\//.test(u || '') ? u : '';
const istHex64 = (x: string) => /^[0-9a-f]{64}$/.test(x || '');
const tagWert = (ev: any, n: string) => (ev.tags.find((t: string[]) => t[0] === n) || [])[1] || '';
const tagWerte = (ev: any, n: string) => ev.tags.filter((t: string[]) => t[0] === n).map((t: string[]) => t[1]);
const fn = (name: string) => block(new RegExp(`  function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}`));
const bau = (name: string, extra = '') => new Function('esc', 'sichereUrl', 'istHex64', 'tagWert', 'tagWerte', extra + fn(name) + `; return ${name};`)(esc, sichereUrl, istHex64, tagWert, tagWerte);

Deno.test('Beziehungsgefüge: Signaturen, Abfrage, Doku', async () => {
  for (const f of ['bzLaden()', 'bzQuellen()', 'bzBauen(q)', 'bzVerbinde(kanten, a, b)', 'bzNachbarn(kanten, ents, id, typ)', 'bzPunkte(ents, kanten, id, ich)', 'bzZeit(ev)', 'bzProfil(hex)']) assert(s.includes('function ' + f), f);
  const l = fn('bzLaden');
  assert(/hubFetch\('beziehungen', \[/.test(l) && /kinds: \[30000\], '#d': \['communities'\], limit: 300/.test(l) && /kinds: \[10222\], limit: 60/.test(l) && /kinds: \[31925\], limit: 200/.test(l) && /kinds: \[7\], '#k': \['30142', '30023', '31922', '31923'\]/.test(l), 'fünf Filter in einem Aufruf');
  assert(/relay-rpi\.edufeed\.org/.test(l) && !/amb-relay/.test(l) && !/purplepag/.test(html) && !/groups\.edufeed\.org/.test(html), 'Relays');
  const aufrufe = l.match(/hubFetch\(/g) || [];
  assert(aufrufe.length === 2, 'höchstens zwei Abfragen: die Beziehungsabfrage und eine abhängige Profilabfrage');
  const nach = l.slice(l.indexOf("hubFetch('beziehungen:profile'"));
  assert(/hubFetch\('beziehungen:profile', \[\{ kinds: \[0\], authors: fehlend, limit: 150 \}\]/.test(nach) && /slice\(0, 150\)/.test(l) && !/kinds: \[(?!0\])/.test(nach.split('\n')[0]), 'zweite Abfrage: nur kind 0 mit authors, höchstens 150');
  const d = await Deno.readTextFile(new URL('../docs/daten.md', import.meta.url));
  assert(/bzBauen/.test(d) && /31925/.test(d) && /ohne Rollenprüfung/.test(d), 'docs/daten.md');
});

Deno.test('bzBauen: Kanten nur aus gültigen Bezügen', () => {
  const bz = bau('bzBauen', fn('aTagLesen') + fn('repostZiel') + fn('bzVerbinde') + fn('bzZeit'));
  const A = 'aa'.repeat(32), B = 'bb'.repeat(32), C = 'cc'.repeat(32), ID = 'dd'.repeat(32), F = '99'.repeat(32), G = '88'.repeat(32);
  const mat = { id: ID, kind: 30142, pubkey: A, created_at: 10, tags: [['d', 'm1'], ['h', C], ['h', F]] };
  const term = { id: 'ee'.repeat(32), kind: 31923, pubkey: A, created_at: 11, tags: [['d', 't1'], ['start', '1800000000'], ['p', B]] };
  const q = { materialien: [mat], beitraege: [], termine: [term], reposts: [{ kind: 16, pubkey: B, created_at: 12, tags: [['a', `30142:${A}:m1`], ['h', C]] }, { kind: 16, pubkey: B, created_at: 13, tags: [['e', 'ff'.repeat(32)]] }],
    mitgliedschaften: [{ kind: 30000, pubkey: B, created_at: 14, tags: [['d', 'communities'], ['p', C], ['p', 'kaputt'], ['p', F]] }, { kind: 30000, pubkey: G, created_at: 14, tags: [['d', 'communities'], ['p', F]] }],
    zusagen: [{ kind: 31925, pubkey: B, created_at: 15, tags: [['a', `31923:${A}:t1`], ['status', 'declined']] }, { kind: 31925, pubkey: B, created_at: 16, tags: [['a', `31923:${A}:t1`], ['status', 'accepted']] }],
    reaktionen: [{ kind: 7, pubkey: B, created_at: 17, content: '-', tags: [['e', ID]] }, { kind: 7, pubkey: B, created_at: 18, content: '+', tags: [['e', ID]] }],
    personenListe: [], communities: [C] };
  const { ents, kanten } = bz(q);
  assert(ents.has('p:' + A) && ents.has('p:' + B) && ents.has('c:' + C) && ents.has(`m:30142:${A}:m1`) && ents.has(`e:31923:${A}:t1`), 'Entitäten');
  assert(!ents.has('p:kaputt') && !ents.has('c:kaputt'), 'kaputter Schlüssel ergibt nichts');
  assert(!ents.has('c:' + F) && !ents.has('p:' + F) && !kanten.has('c:' + F) && !kanten.has('p:' + F), 'gültiger fremder Schlüssel in p- oder h-Tag ergibt weder Community noch Kante');
  assert(!ents.has('p:' + G) && !kanten.has('p:' + G), 'Liste nur mit fremden Schlüsseln: keine Person, keine Kante');
  const n = (id: string) => [...(kanten.get(id) || [])].sort();
  assertEquals(n(`m:30142:${A}:m1`), ['c:' + C, 'p:' + A, 'p:' + B].sort(), 'Material: Autor, h-Community, Repost-Community bleibt C, Reaktion B');
  assertEquals(n(`e:31923:${A}:t1`), ['p:' + A, 'p:' + B].sort(), 'Termin: Autor, p-Tag, Zusage (declined zählt nicht)');
  assert(n('c:' + C).includes('p:' + B), 'Mitgliedschaft');
  assertEquals(ents.get(`e:31923:${A}:t1`).start, 1800000000);
});

Deno.test('bzNachbarn und bzPunkte', () => {
  const nb = bau('bzNachbarn'), pt = bau('bzPunkte');
  const ents = new Map([['p:a', { id: 'p:a', typ: 'person', pk: 'a' }], ['c:b', { id: 'c:b', typ: 'community', pk: 'b' }], ['m:x', { id: 'm:x', typ: 'material', pk: 'a' }]]);
  const kanten = new Map([['p:a', new Set(['c:b', 'm:x'])], ['c:b', new Set(['p:a'])], ['m:x', new Set(['p:a'])]]);
  assertEquals(nb(kanten, ents, 'p:a', 'community').map((e: any) => e.id), ['c:b']);
  assertEquals(nb(kanten, ents, 'p:a', null).length, 2);
  assertEquals(pt(ents, kanten, 'p:a', null), 4); assertEquals(pt(ents, kanten, 'p:a', 'a'), 104); assertEquals(pt(ents, kanten, 'c:b', null), 1); assertEquals(pt(ents, kanten, 'm:x', null), 0);
});

Deno.test('Ökosystem: Ansicht, Route, drei Zustände, Karten maskiert', () => {
  assert(/id="v-oekosystem" data-stand="nachbau:/.test(html), 'Ansicht mit Stand-Zeile');
  assert(/'oekosystem'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)) && /ozOpen\(/.test(s), 'Route');
  const o = fn('ozOpen');
  assert(/bzLaden\(\)/.test(fn('ozQuellenLaden')) && /ozQuellenLaden\(\)/.test(o) && /bzBauen\(bzQuellen\(\)\)/.test(o + fn('ozBauen')) && /Stand vom/.test(o + fn('datenstand')) && /ohne Rollenprüfung/.test(o) && /können gerade nicht geladen werden/.test(o), 'Zustände');
  const k = fn('ozKarte');
  assert(/esc\(/.test(k) && /sichereUrl\(/.test(k) && /kurzHash\(/.test(k) && /aria-pressed/.test(k) && /Das bist du/.test(k), 'Karte');
  assert(/function ozSichtbar\(ent\)/.test(s) && /HUB_C/.test(fn('ozSichtbar')), 'Sichtbarkeit kennt den Zuschnitt');
  assert(/'ich\.start': \{[^}]*#oekosystem/.test(s), 'Konsole: Überblick führt ins Ökosystem');
});

Deno.test('Communities live: cyAus, Partnerkacheln, RpiCommunity ausgeblendet', () => {
  const ca = bau('cyAus', "const C = { kooperieren: '#000' }; const kurzHash = () => 'abcd1234';");
  const ev = { kind: 10222, pubkey: 'ab'.repeat(32), created_at: 1, tags: [['r', 'wss://relay.edufeed.org']] };
  const c = ca(ev, { name: '<b>Kreis</b>', about: 'x'.repeat(200), picture: 'javascript:x' });
  assertEquals(c.hex, 'ab'.repeat(32)); assertEquals(c.n, '<b>Kreis</b>'); assert(c.bio.length <= 92 && c.bild === '' && c.live === true);
  const cy = fn('cyRender');
  assert(/cy-partner/.test(cy) && /Partner ohne eigenen Schlüssel/.test(cy), 'Partnerkacheln');
  assert(/npub1gc2zfp/.test(s) && /ausgeblendet|RpiCommunity/.test(block(/const CY_HEX[\s\S]*?\n  \]\)?;/) + fn('cyLaden')), 'RpiCommunity ausgeblendet');
  assert(html.includes('id="v-communities" data-stand="stand:26.10.2026 · Texte teils Beispiel"'), 'Startwert bleibt');
});

Deno.test('Communities live: echter Knopf „Beitreten“ statt Beispiel-Folgen, keine Persona', () => {
  const stubs = "const cyBtn = c => '<button data-cyf=\"' + c.id + '\">Folgen</button>'; const akKnopf = (was, ziel, label) => '<button data-ak=\"' + was + '\" data-ziel=\"' + ziel + '\">' + label + '</button>';"
    + "const cyAv = () => ''; const cyRel = () => ''; const SHIELD = ''; const PARTNERS = []; const CY = [{ id: 'relilab' }]; const CO_SCHLUESSEL = [{ id: 'relilab' }];";
  const cc = bau('cyCards', stubs), H = 'ab'.repeat(32);
  const mitSchluessel = cc([{ id: 'relilab', n: 'relilab', bio: '', back: '', m: 3, hex: H, live: true, mine: 'Mitglied' }], true, null, true);
  assert(mitSchluessel.includes(`data-ak="beitreten" data-ziel="${H}"`) && !/data-cyf/.test(mitSchluessel) && !/Mitglied ✓|Folge ich/.test(mitSchluessel), 'live mit Schlüssel: Beitreten, keine Persona');
  const ohne = cc([{ id: 'oercommunity', n: 'OER', bio: '', back: '', m: 0, mine: 'folge ich' }], true, null, true);
  assert(!/data-cyf|data-ak/.test(ohne), 'live ohne Schlüssel: kein Knopf');
  assert(/data-cyf/.test(cc([{ id: 'relilab', n: 'relilab', bio: '', back: '', m: 3 }], true)), 'eingebetteter Stand: Beispiel-Knopf bleibt');
  const r = fn('cyRender');
  assert(/cyCards\(\[\.\.\.vorn, \.\.\.schau\], true, null, true\)/.test(r) && /live \? !!\(istHex64\(c\.hex\) && akZustand\('beitreten', c\.hex\)\) : cyFollow\.has\(c\.id\)/.test(r), 'live: echter Knopf und „meine“ aus der eigenen Mitgliedsliste');
  assert(/\$\{hx \? '' : `<button type="button" class="cr-fol/.test(fn('crRender')), 'Raum mit Schlüssel: kein Beispiel-Folgen');
  assert(/'communities'\) cyRender\(\)/.test(fn('akZeichnen')), 'nach dem Beitreten neu zeichnen');
});

Deno.test('ozHinweis: Hinweiszeile in einem Zug, ohne doppelte Umhüllung', () => {
  const h = bau('ozHinweis');
  assertEquals(h({ n: 3, filter: false, wahl: '', nachbarn: false, quelle: 3 }), '3 Einträge');
  assertEquals(h({ n: 1, filter: false, wahl: '', nachbarn: false, quelle: 1 }), '1 Eintrag');
  assertEquals(h({ n: 200, filter: false, wahl: '', nachbarn: false, quelle: 200 }), '80 von 200 Einträgen');
  assertEquals(h({ n: 0, filter: true, wahl: '', nachbarn: false, quelle: 5 }), 'Nichts gefunden.');
  assertEquals(h({ n: 0, filter: true, wahl: 'X', nachbarn: false, quelle: 5 }), '„X“ gewählt · nichts gefunden');
  assertEquals(h({ n: 90, filter: false, wahl: 'X', nachbarn: false, quelle: 90 }), '„X“ gewählt · 80 von 90 weitere');
  assertEquals(h({ n: 4, filter: false, wahl: 'X', nachbarn: true, quelle: 4 }), '4 verbunden mit „X“');
  assertEquals(h({ n: 0, filter: false, wahl: 'X', nachbarn: true, quelle: 0 }), 'Keine Verbindung zu „X“');
  assertEquals(h({ n: 0, filter: true, wahl: 'X', nachbarn: true, quelle: 4 }), 'Nichts gefunden.');
  assertEquals(h({ n: 2, filter: true, wahl: 'X', nachbarn: true, quelle: 4 }), '2 von 4 verbunden mit „X“');
});

Deno.test('cyLaden: keine eigene Profilabfrage, Konten stehen in der Beziehungsabfrage', () => {
  assert(!/hubFetch\(/.test(fn('cyLaden')) && !/communities:profile/.test(s), 'cyLaden holt nichts nach');
  assert(/daten\.communities\.map\(ev => ev\.pubkey\), \.\.\.daten\.mitgliedschaften/.test(fn('bzLaden')), 'Community-Konten stehen vorn in der Profilabfrage von bzLaden');
});

Deno.test('pkEintrag: Sätze je Kind, Kommentar als Text, ohne Ziel null', () => {
  const pe = bau('pkEintrag', fn('aTagLesen') + fn('repostZiel') + "const bzProfil = () => null; const bech32 = () => 'npub1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; const CO_SCHLUESSEL = [];");
  const A = 'aa'.repeat(32), C = 'cc'.repeat(32);
  const ents = new Map([[`m:30142:${A}:m1`, { id: `m:30142:${A}:m1`, typ: 'material', ev: { kind: 30142, pubkey: A, tags: [['d', 'm1'], ['name', 'Gen 1 <b>']] }, pk: A }], ['c:' + C, { id: 'c:' + C, typ: 'community', pk: C }]]);
  const g = { ents, kanten: new Map() };
  const k = pe({ id: 'k1', kind: 1111, pubkey: A, created_at: 5, content: '<script>x</script> gut', tags: [['K', '30142'], ['A', `30142:${A}:m1`], ['a', `30142:${A}:m1`]] }, g);
  assert(k && /hat zu/.test(k.html) && /&lt;script&gt;/.test(k.html) && !/<script/.test(k.html) && /Gen 1 &lt;b&gt;/.test(k.html), 'Kommentar maskiert');
  assertEquals(pe({ id: 'k2', kind: 7, pubkey: A, created_at: 6, content: '+', tags: [['e', 'ff'.repeat(32)]] }, g), null, 'ohne Ziel null');
  const r = pe({ id: 'k3', kind: 16, pubkey: A, created_at: 7, tags: [['a', `30142:${A}:m1`], ['h', C]] }, g);
  assert(r && /geteilt/.test(r.html) && r.bezug.includes('c:' + C) && r.bezug.includes('p:' + A), 'Repost mit Community');
});

Deno.test('Protokoll live: nur Brauchbares, gekappt, Ökosystem nur bei geändertem Gefüge', () => {
  const pb = bau('pkBrauchbar', fn('aTagLesen') + fn('repostZiel'));
  const A = 'aa'.repeat(32), C = 'cc'.repeat(32), F = '99'.repeat(32), M = 'dd'.repeat(32), comm = new Set([C]);
  const g = { ents: new Map([[`m:30142:${A}:m1`, { id: `m:30142:${A}:m1`, typ: 'material', pk: A, ev: { id: M, kind: 30142, pubkey: A, tags: [['d', 'm1']] } }], ['c:' + C, { id: 'c:' + C, typ: 'community', pk: C }]]), kanten: new Map() };
  const ev = (kind: number, tags: string[][], content = 'x', id = 'e' + Math.random()) => ({ id, kind, pubkey: A, created_at: 1, content, tags });
  assert(pb(ev(1, [['h', C]]), g, comm), 'kind 1 in bekannter Community');
  assert(!pb(ev(1, []), g, comm) && !pb(ev(1, [['h', F]]), g, comm) && !pb(ev(1, [['h', C]], '  '), g, comm), 'kind 1 ohne bekannte Community oder ohne Text fällt weg');
  assert(!pb(ev(4, [['h', C]]), g, comm) && !pb(ev(30001, [['d', 'x']]), g, comm), 'Kinds, die das Protokoll nicht zeigt');
  assert(pb(ev(7, [['e', M]], '+'), g, comm) && pb(ev(7, [['a', `30142:${A}:m1`]], '+'), g, comm), 'Reaktion auf bekanntes Ziel');
  assert(!pb(ev(7, [['e', 'ff'.repeat(32)]], '+'), g, comm) && !pb(ev(31925, [['a', `31923:${A}:t9`], ['status', 'accepted']]), g, comm), 'Reaktion und Zusage ohne bekanntes Ziel fallen weg');
  assert(pb(ev(1111, [['A', `30142:${A}:m1`]], 'gut'), g, comm) && !pb(ev(1111, [['A', `30142:${A}:m1`]], ''), g, comm), 'Kommentar nur mit Ziel und Text');
  assert(pb(ev(16, [['a', `30142:${A}:m1`], ['h', C]]), g, comm) && !pb(ev(16, [['e', 'ff'.repeat(32)]]), g, comm), 'Repost nur mit bekanntem Ziel');
  assert(pb(ev(30000, [['d', 'communities'], ['p', C]]), g, comm) && !pb(ev(30000, [['d', 'communities'], ['p', F]]), g, comm) && !pb(ev(30000, [['d', 'andere'], ['p', C]]), g, comm), 'Beitritt nur zu bekannter Community');
  assert(pb(ev(30142, [['d', 'neu']]), g, comm) && !pb(ev(30142, []), g, comm), 'eigene Inhalte mit d');
  assert(pb(ev(7, [['e', 'ff'.repeat(32)]], '+'), null, comm), 'vor dem ersten Gefüge zählt nur die Form');
  const kap = bau('pkKappen'), ich = 'ee'.repeat(32);
  const liste = Array.from({ length: 700 }, (_, i) => ({ id: 'i' + i, pubkey: i === 3 ? ich : A })), gesehen = new Set(liste.map((e) => e.id)), marke = new Map(liste.map((e) => [e.id, 1]));
  kap(liste, gesehen, marke, 500, ich);
  assertEquals(liste.length, 500); assert(liste.some((e) => e.id === 'i3'), 'eigenes Event bleibt');
  assertEquals(liste[1].id, 'i201', 'die ältesten fremden gehen zuerst'); assertEquals(liste.at(-1)!.id, 'i699');
  assertEquals(gesehen.size, 500); assert(gesehen.has('i699') && !gesehen.has('i0'), 'gesehene Kennungen: älteste hinaus');
  assert(!marke.has('i0') && marke.has('i699'), 'Marken mit ihrem Event');
  const le = fn('pkLiveEvent'), bu = fn('pkBuendeln'), nz = fn('ozNachzeichnen');
  assert(/pkBrauchbar\(ev, /.test(le) && le.indexOf('pkBrauchbar') < le.indexOf('pkNeu.push'), 'pkLiveEvent verwirft vor dem Sammeln');
  assert(/pkKappen\(pkLive, pkGesehen, pkMarke, PK_MAX, ICH\.hex\)/.test(bu) && /const PK_MAX = 500/.test(s), 'pkBuendeln kappt');
  assert(/bzMass\(ozGefuege\) !== vorher\) ozNachzeichnen\(\)/.test(bu) && !/ozRender\(\)/.test(bu), 'Ökosystem nur bei geändertem Gefüge');
  assert(/input, select, textarea/.test(nz) && /ozVeraltet = true/.test(nz), 'nicht bei Fokus in einem Eingabefeld');
});

Deno.test('Mitmachen: Ansicht, Abfrage, Zustände, Protokoll im Ökosystem', () => {
  assert(/id="v-mitmachen" data-stand="nachbau:/.test(html) && /'mitmachen'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'Ansicht und Route');
  const l = fn('pkLaden');
  assert(/hubFetch\('mitmachen', \[\{ kinds: \[1111\], '#K': \['30142', '30023', '31922', '31923'\], limit: 100 \}, \{ kinds: \[1\], '#h': CO_SCHLUESSEL\.map/.test(l), 'zwei Filter, feste Mengen');
  const r = fn('pkRender');
  assert(/Noch kein Gespräch/.test(r) && /antworten gerade nicht|Relays nicht erreichbar/.test(r) && /keine Live-Verbindung/.test(r) && /Protokoll verbunden mit/.test(r), 'Zustände');
  assert(/hubAbonnieren\('protokoll', \[\{ kinds: PK_KINDS/.test(s) && /id="ozProtokoll"/.test(html), 'Subscription und Streifen');
  assert(!/mdSeite\(/.test(r) && !/mdSeite\(/.test(fn('pkEintrag')), 'Kommentare nie als Markdown');
});

Deno.test('relilab als Labor: Kriterien, Trias, Menschen nur mit Profil', () => {
  const k = block(/const RL_KRITERIEN = \[[\s\S]*?\];/);
  assert(k.includes('offen ohne Anmeldung') && k.includes('Ergebnisse unter freier Lizenz') && (k.match(/'/g) || []).length === 14, 'sieben Kriterien');
  const l = fn('rlLaden');
  assert(/coLaden\(RL_HEX\)/.test(l) && /terminLogik\(/.test(l) && /hubFetch\('relilab:menschen', \[\{ kinds: \[0\], authors:/.test(l) && (l.match(/hubFetch\(/g) || []).length === 1 && /\.bot/.test(l), 'Quellen und eine Nachfrage');
  assert(/!CO_SCHLUESSEL\.some\(c => c\.hex === pk\) && !KAL_HEX\.has\(pk\)/.test(l), 'Funktionsschlüssel (Community, Kalenderquellen) sind keine Menschen');
  const h = fn('rlHome');
  assert(/Materialien/.test(h) && /Menschen/.test(h) && /Mitmachen/.test(h) && /#person\?p=/.test(h) && /zu=katalog/.test(h) && /logik=labor/.test(h) && /esc\(/.test(h), 'drei Spalten mit Links');
  assert(/data-rlsec="mitmachen"/.test(html) && /pkRender\(/.test(fn('rlShow')), 'Raum im relilab-Rahmen');
  assert(!/Auf Instagram folgen/.test(html) && !/data-todo="Suche"/.test(html), 'Attrappen entfernt');
  assert(/id="v-relilab" data-stand="stand:/.test(html), 'Startwert bleibt ein Stand');
});
