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

Deno.test('Community-Inhalte: Konstanten, Signaturen, Doku', async () => {
  const k = block(/const CO_SCHLUESSEL = \[[\s\S]*?\n  \];/);
  for (const id of ['rpi-virtuell', 'relilab', 'religlobal', 'alpika-gs', 'oercommunity']) assert(k.includes(`id: '${id}'`), id);
  assert(/pool: true/.test(k) && /eigene: true/.test(k) && (k.match(/npub1[0-9a-z]{58}/g) || []).length === 5, 'fünf npubs, Pool- und Schaufenster-Markierung');
  for (const f of ['aTagLesen(wert)', 'repostZiel(ev)', 'listeEintraege(ev)', 'entferntAus(labels, hex)', 'coLaden(hex)', 'coEintraege(daten)', 'eintraegeAufloesen(eintraege)', 'eintragKarte(e)']) assert(s.includes('function ' + f), f);
  assert(/id: 'alpika-gs'/.test(block(/const CY = \[[\s\S]*?\n  \];/)), 'ALPIKA Grundschule in CY');
  const d = await Deno.readTextFile(new URL('../docs/daten.md', import.meta.url));
  assert(/coLaden/.test(d) && /'#h'/.test(d) && /ohne Rollenprüfung/.test(d) && /katalog-/.test(d), 'docs/daten.md');
});

Deno.test('aTagLesen, repostZiel und listeEintraege: nur gültige Adressen', () => {
  const a = bau('aTagLesen'), rz = bau('repostZiel', fn('aTagLesen')), le = bau('listeEintraege', fn('aTagLesen'));
  const pk = 'ab'.repeat(32), id = 'cd'.repeat(32);
  assertEquals(a(`30142:${pk}:https://x.org/r`), { kind: 30142, pk, d: 'https://x.org/r' });
  assertEquals(a('30023:abc:x'), null); assertEquals(a(`30023:${pk}:`), null); assertEquals(a(`kind:${pk}:x`), null);
  assertEquals(rz({ tags: [['e', id], ['a', `30142:${pk}:m1`], ['k', '30142']] }), { adr: `30142:${pk}:m1`, kind: 30142, pk, d: 'm1' }, 'a vor e');
  assertEquals(rz({ tags: [['e', id], ['k', '31923']] }), { adr: `e:${id}`, id, kind: 31923 });
  assertEquals(rz({ tags: [['e', 'kaputt']] }), null);
  const ev = { kind: 30004, pubkey: pk, created_at: 5, content: '', tags: [['d', 'katalog'], ['title', '<b>Katalog</b>'], ['a', `30142:${pk}:m1`], ['a', `30142:${pk}:m1`], ['a', '30023:kaputt:x'], ['a', `31923:${pk}:t1`], ['image', 'javascript:alert(1)']] };
  const l = le(ev);
  assertEquals(l.eintraege.length, 2); assertEquals(l.unaufloesbar, 1); assertEquals(l.bild, ''); assertEquals(l.stand, 5); assertEquals(l.titel, '<b>Katalog</b>');
});

Deno.test('coEintraege und entferntAus: Reposts aufgelöst, Entfernen nur vom Community-Schlüssel', () => {
  const co = 'ee'.repeat(32), pk = 'ab'.repeat(32), id = 'cd'.repeat(32);
  const ea = bau('entferntAus'), ce = bau('coEintraege', fn('aTagLesen') + fn('repostZiel'));
  const labels = [
    { kind: 1985, pubkey: co, tags: [['L', 'communikey.moderation'], ['l', 'remove', 'communikey.moderation'], ['h', co], ['e', id], ['a', `30142:${pk}:weg`]] },
    { kind: 1985, pubkey: pk, tags: [['L', 'communikey.moderation'], ['l', 'remove', 'communikey.moderation'], ['h', co], ['a', `30142:${pk}:bleibt`]] }
  ];
  const ent = ea(labels, co);
  assert(ent.has(`e:${id}`) && ent.has(`30142:${pk}:weg`) && !ent.has(`30142:${pk}:bleibt`), 'nur der Community-Schlüssel entfernt');
  const daten = { antwort: true, entfernt: ent, listen: [],
    direkt: [{ id: 'x1', kind: 31923, pubkey: pk, created_at: 10, tags: [['d', 't1']] }, { id: 'x2', kind: 30142, pubkey: pk, created_at: 11, tags: [['d', 'weg']] }],
    reposts: [{ kind: 16, pubkey: co, created_at: 20, tags: [['a', `30142:${pk}:m1`], ['k', '30142']] }, { kind: 16, pubkey: co, created_at: 21, tags: [['a', `30142:${pk}:m1`]] }, { kind: 16, pubkey: co, created_at: 22, tags: [['e', id], ['k', '30023']] }] };
  const e = ce(daten);
  assertEquals(e.map((x: any) => x.adr), [`30142:${pk}:m1`, `31923:${pk}:t1`], 'entfernt weg, Duplikat einmal, neueste zuerst');
  assertEquals(e[0].geteilt, co); assertEquals(e[0].zeit, 21); assertEquals(e[1].geteilt, null); assertEquals(e[0].ev, null);
});

Deno.test('coLaden: ein REQ je Community, h-Tag statt Autoren, Listen und Labels mitgeholt', () => {
  const k = fn('coLaden');
  assert(/hubFetch\('community:' \+ hex, \[/.test(k) && /kinds: \[30142, 30023, 31923\], '#h': \[hex\]/.test(k) && /kinds: \[6, 16\], '#h': \[hex\]/.test(k), 'Inhalt und Reposts über h');
  assert(/kinds: \[30004\], authors: \[hex\]/.test(k) && /kinds: \[1985\], '#h': \[hex\], '#L': \['communikey\.moderation'\], authors: \[hex\]/.test(k), 'Listen und Labels nur vom Schlüssel');
  assert(/istHex64\(/.test(k), 'Schlüssel aus Reposts nur als 64-Hex');
  assert(/eigene/.test(k) && /ocLaden\(\)/.test(k), 'Schaufenster ohne Community aus ocDaten');
  assert(!/kinds: \[30004\] \}/.test(k) && !/groups\.edufeed\.org/.test(html), 'nie global, nie das Gruppen-Relay');
  const e = fn('eintraegeAufloesen');
  assert(/mpDaten/.test(e) && /ocDaten/.test(e) && e.indexOf('mpDaten') < e.indexOf('hubFetch') && (e.match(/hubFetch\(/g) || []).length === 1, 'Cache vor Netz, eine Nachfrage');
  assert(/istHex64\(/.test(e), 'Treffer nur mit gültigem Schlüssel');
  assert(/kinds: \[30142, 30023, 31923\]/.test(e) && /'#d'/.test(e) && /ids: /.test(e), 'Obermenge nach Kind, Autor, d und ids');
});

Deno.test('sammlungFilter und sammlungPasst', () => {
  const KAT = block(/const CO_SCHLUESSEL = \[[\s\S]*?\n  \];/);
  const sf = bau('sammlungFilter'), sp = bau('sammlungPasst', KAT + fn('mpPasst'));
  const f = sf('c=religlobal&fach=Ethik&fach=Religion&stufe=Sekundarstufe%20I&lizenz=offen&q=Frieden%20Schule&lizenz=kaputt');
  assertEquals(f.c, 'religlobal'); assertEquals(f.fach, ['Ethik', 'Religion']); assertEquals(f.stufe, ['Sekundarstufe I']); assertEquals(f.q, ['Frieden', 'Schule']);
  assertEquals(sf('lizenz=kaputt').lizenz, '');
  const pk = 'cd'.repeat(32), m = { t: 'Frieden in der Schule', x: '', fach: 'Religion', stufe: 'Sekundarstufe I', art: 'Arbeitsblatt', stand: 'offen', pk, d: 'm1', ev: { tags: [['about:prefLabel:de', 'Religion'], ['educationalLevel:prefLabel:de', 'Sekundarstufe I'], ['keywords', 'Frieden']] } };
  assert(sp(m, { c: '', fach: ['religion'], stufe: [], lizenz: 'offen', q: ['frieden'] }, new Set()));
  assert(!sp(m, { c: '', fach: ['Ethik'], stufe: [], lizenz: '', q: [] }, new Set()));
  assert(!sp(m, { c: 'religlobal', fach: [], stufe: [], lizenz: '', q: [] }, new Set()), 'nicht geteilt und fremder Schlüssel: kein Treffer');
  assert(sp(m, { c: 'religlobal', fach: [], stufe: [], lizenz: '', q: [] }, new Set([`30142:${pk}:m1`])), 'mit der Community geteilt: Treffer');
});

Deno.test('shortcodeAus und kontextprofilAus', () => {
  const KAT = block(/const CO_SCHLUESSEL = \[[\s\S]*?\n  \];/);
  const sc = bau('shortcodeAus', KAT), kp = bau('kontextprofilAus', KAT + "const RELAYS = ['wss://relay.edufeed.org'];");
  assertEquals(sc({ c: '', fach: [], stufe: [], lizenz: '', q: [] }), '[amb_nostr limit="12"]');
  const out = sc({ c: 'religlobal', fach: ['Ethik'], stufe: [], lizenz: 'offen', q: ['Frieden"x'] });
  assert(/^\[amb_nostr_search /.test(out) && /community="npub12atlg/.test(out) && /search="Friedenx"/.test(out) && /Lizenzfilter: offen/.test(out) && !/fixed_level/.test(out));
  const j = JSON.parse(kp({ c: '', fach: ['Ethik'], stufe: ['Primarstufe'], lizenz: '', q: ['Frieden'] }));
  assertEquals(j.actions['finden.material'].params, { thema: ['Frieden'], stufe: ['Primarstufe'] }); assertEquals(j.sammlung.community, null);
});

Deno.test('Sammlung: Ansicht, Route, keine eigene Abfrage, drei Ausgänge', async () => {
  assert(/id="v-sammlung" data-stand="nachbau:/.test(html), 'Ansicht mit Stand-Zeile');
  const r = block(/function route\(\)[\s\S]*?window\.scrollTo/);
  assert(/'finden'/.test(r) && /saOpen\(/.test(r), 'Route finden/sammlung');
  const o = block(/function saOpen\(qs\)[\s\S]*?\n  \}/) + block(/function saRender\(\)[\s\S]*?\n  \}/);
  assert(/mpLaden\(\)/.test(o) && /coLaden\(/.test(o) && /f\.c/.test(o) && !/hubFetch\(/.test(o), 'nur Caches, Community nur bei Filter, keine eigene Abfrage');
  assert(/id="saEinbetten"/.test(o) && /id="saAbo"/.test(o) && /Als Nostr-Liste speichern/.test(o) && /disabled aria-disabled="true"/.test(o) && /braucht einen Server/.test(o), 'Ausgänge ehrlich');
  assert(/Sammlung zusammenstellen/.test(html), 'Knopf im Materialpool');
  assert(/go\('finden\/sammlung\?q=/.test(block(/function lizenzAktionen\(stand, m\)[\s\S]*?\n  \}/)), 'In Sammlung aufnehmen führt zur Sammlung');
  assert(/Sammlung/.test(await Deno.readTextFile(new URL('../docs/navigation.md', import.meta.url))), 'docs/navigation.md');
});
