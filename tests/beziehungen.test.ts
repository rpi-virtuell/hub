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
  const A = 'aa'.repeat(32), B = 'bb'.repeat(32), C = 'cc'.repeat(32), ID = 'dd'.repeat(32);
  const mat = { id: ID, kind: 30142, pubkey: A, created_at: 10, tags: [['d', 'm1'], ['h', C]] };
  const term = { id: 'ee'.repeat(32), kind: 31923, pubkey: A, created_at: 11, tags: [['d', 't1'], ['start', '1800000000'], ['p', B]] };
  const q = { materialien: [mat], beitraege: [], termine: [term], reposts: [{ kind: 16, pubkey: B, created_at: 12, tags: [['a', `30142:${A}:m1`], ['h', C]] }, { kind: 16, pubkey: B, created_at: 13, tags: [['e', 'ff'.repeat(32)]] }],
    mitgliedschaften: [{ kind: 30000, pubkey: B, created_at: 14, tags: [['d', 'communities'], ['p', C], ['p', 'kaputt']] }],
    zusagen: [{ kind: 31925, pubkey: B, created_at: 15, tags: [['a', `31923:${A}:t1`], ['status', 'declined']] }, { kind: 31925, pubkey: B, created_at: 16, tags: [['a', `31923:${A}:t1`], ['status', 'accepted']] }],
    reaktionen: [{ kind: 7, pubkey: B, created_at: 17, content: '-', tags: [['e', ID]] }, { kind: 7, pubkey: B, created_at: 18, content: '+', tags: [['e', ID]] }],
    personenListe: [], communities: [C] };
  const { ents, kanten } = bz(q);
  assert(ents.has('p:' + A) && ents.has('p:' + B) && ents.has('c:' + C) && ents.has(`m:30142:${A}:m1`) && ents.has(`e:31923:${A}:t1`), 'Entitäten');
  assert(!ents.has('p:kaputt') && !ents.has('c:kaputt'), 'kaputter Schlüssel ergibt nichts');
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
  assert(/bzLaden\(\)/.test(o) && /bzBauen\(bzQuellen\(\)\)/.test(o + fn('ozBauen')) && /Stand vom/.test(o + fn('datenstand')) && /ohne Rollenprüfung/.test(o) && /können gerade nicht geladen werden/.test(o), 'Zustände');
  const k = fn('ozKarte');
  assert(/esc\(/.test(k) && /sichereUrl\(/.test(k) && /kurzHash\(/.test(k) && /aria-pressed/.test(k) && /Das bist du/.test(k), 'Karte');
  assert(/function ozSichtbar\(ent\)/.test(s) && /HUB_C/.test(fn('ozSichtbar')), 'Sichtbarkeit kennt den Zuschnitt');
  assert(/'hub\.home': \{[^}]*#oekosystem/.test(s), 'Konsole: Home führt ins Ökosystem');
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
