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


Deno.test('terminLogik und terminMerkmale: fehlende Tags', () => {
  const relilab = '48706e89'.padEnd(64, '0');
  const extra = `const KAL_HEX = new Map([['${'f6'.repeat(32)}', { logik: 'labor' }], ['${'65'.repeat(32)}', { logik: 'institut' }]]); const RL_HEX = '${relilab}';`;
  const tl = bau('terminLogik', extra), tm = bau('terminMerkmale');
  const ev = (pk: string, tags: string[][]) => ({ pubkey: pk, tags });
  assertEquals(tl(ev('f6'.repeat(32), [])), 'labor');
  assertEquals(tl(ev('65'.repeat(32), [['t', 'Relilab']])), 'labor', 't=relilab zählt als Labor');
  assertEquals(tl(ev('65'.repeat(32), [['h', relilab]])), 'labor');
  assertEquals(tl(ev('65'.repeat(32), [])), 'institut'); assertEquals(tl(ev('00'.repeat(32), [])), 'institut');
  assertEquals(tm(ev('', [])), { online: null, anmeldung: null, kostenfrei: null });
  assertEquals(tm(ev('', [['location', 'Zoom: https://relilab.org/live'], ['registrationUrl', 'https://x.org/a'], ['price', '0', 'EUR']])), { online: true, anmeldung: true, kostenfrei: true });
  assertEquals(tm(ev('', [['location', 'Evangelische Akademie Frankfurt'], ['price', '25', 'EUR'], ['registrationUrl', 'javascript:x']])), { online: false, anmeldung: null, kostenfrei: false });
});

Deno.test('kalLaden: eine Abfrage für Kalender und rpi-virtuell, feste Quellen', async () => {
  const q = block(/const KAL_QUELLEN = \[[\s\S]*?\n  \];/);
  assertEquals((q.match(/npub1[0-9a-z]{58}/g) || []).length, 14); assert(!/npub1f7jar/.test(q), 'kein persönlicher Schlüssel als Quelle');
  const k = block(/function kalLaden\(\)[\s\S]*?\n  \}/);
  assert(/hubFetch\('kalender', \[/.test(k) && /logik === 'labor'/.test(k) && (k.match(/since:/g) || []).length >= 3 && (k.match(/limit: 500/g) || []).length === 2 && /authors: labor/.test(k) && /authors: andere/.test(k) && /'#h': CO_SCHLUESSEL\.map/.test(k) && /RT_RAW/.test(k), 'zwei Filter, Schnappschuss gemischt');
  assert(!/amb-relay/.test(k) && !/groups\.edufeed\.org/.test(html));
  assert(/Relay-Grenze erreicht/.test(fn('kaRender')), 'Grenze sichtbar');
  const rv = block(/function rvOpen\(qs\)[\s\S]*?\n  \}/);
  assert(/kalLaden\(\)/.test(rv) && !/kinds: \[31923\]/.test(rv) && /terminLogik\(/.test(rv) && /#finden\/fortbildungen/.test(rv), 'rpi-virtuell teilt die Abfrage');
  assert(/RT_RAW\.filter\(ev => RT_HEX\[ev\.pubkey\]\)/.test(s), 'relilab filtert den Schnappschuss');
  assert(/'finden\.fortbildungen': 'finden\/fortbildungen'/.test(s), 'Konsole');
  assert(/id="v-fortbildungen"/.test(html) && /keine Angabe/.test(block(/function kaRender\(\)[\s\S]*?\n  \}/)), 'Ansicht und ehrliche Merkmale');
  const t = await Deno.readTextFile(new URL('../tools/schnappschuss.ts', import.meta.url));
  assert(new Set(t.match(/npub1[0-9a-z]{58}/g) || []).size >= 14, 'Schnappschuss kennt alle Quellen');
  assert(/#finden\/fortbildungen/.test(await Deno.readTextFile(new URL('../docs/navigation.md', import.meta.url))));
});

Deno.test('profilAus: maskiert, sichere Adressen, Bots erkannt', () => {
  const pa = bau('profilAus', block(/  function bech32\([^)]*\) \{[\s\S]*?\n  \}/));
  const ev = (c: unknown) => ({ pubkey: 'ab'.repeat(32), content: typeof c === 'string' ? c : JSON.stringify(c), tags: [] });
  const p = pa(ev({ name: '<b>Ada</b>', about: 'x'.repeat(400), picture: 'data:image/png;base64,AAA', website: 'https://ada.example', nip05: 'ada@example.org', bot: true }));
  assert(p.name === '&lt;b&gt;Ada&lt;/b&gt;' && p.about.length <= 162 && p.bild === '' && p.web === 'https://ada.example' && p.nip05 === 'ada@example.org' && p.bot === true && /^npub1/.test(p.npub));
  assertEquals(pa(ev('{kaputt')), null); assertEquals(pa(ev({ about: 'ohne Namen' })), null);
  assertEquals(pa(ev({ name: 'A', nip05: 'kein mail' })).nip05, '');
});

Deno.test('peLaden: zwei Abfragen, feste Autoren; Personen und Person: Rückfall Teamseite, Folgen deaktiviert', () => {
  const l = block(/function peLaden\(\)[\s\S]*?\n  \}/);
  assert(/hubFetch\('personen', \[\{ kinds: \[30000\], authors: PERSONEN_LISTE\.autoren, '#d': \[PERSONEN_LISTE\.d\]/.test(l), 'Liste nur von festen Autoren');
  assert(/hubFetch\('personen:profile'/.test(l) && /kinds: \[0\]/.test(l) && /'#d': \['communities'\]/.test(l) && (l.match(/hubFetch\(/g) || []).length === 2, 'zweite Abfrage abhängig, keine dritte');
  assert(/istHex64\(/.test(l) && /150/.test(l), 'Schlüssel geprüft, gedeckelt');
  const r = block(/function peRender\(daten\)[\s\S]*?\n  \}/);
  assert(/OC_TEAM/.test(r) && /noch nicht angelegt/.test(r) && /antworten gerade nicht/.test(r) && /disabled aria-disabled="true"/.test(r) && /\.bot/.test(r), 'Zustände, Teamseite, Folgen, Bots');
  const o = block(/function prOpen\(qs\)[\s\S]*?\n  \}/);
  assert(/npubToHex\(/.test(o) && /kinds: \[30142, 30023, 31923\]/.test(o) && /Kein gültiges Profil/.test(o), 'Profilseite');
  assert(/id="v-personen" data-stand="stand:04\.11\.2026/.test(html) && /id="v-person" data-stand="nachbau:/.test(html), 'Ansichten mit Stand');
  assert(/'kooperieren\.personen': 'kooperieren\/personen'/.test(s) && /'person'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'Konsole und Route');
});
