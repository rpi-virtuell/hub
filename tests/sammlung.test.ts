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
  assert(/eigene/.test(k) && /ocLaden\(\)/.test(k), 'Schaufenster ohne Community aus ocDaten');
  assert(!/kinds: \[30004\] \}/.test(k) && !/groups\.edufeed\.org/.test(html), 'nie global, nie das Gruppen-Relay');
  const e = fn('eintraegeAufloesen');
  assert(/mpDaten/.test(e) && /ocDaten/.test(e) && e.indexOf('mpDaten') < e.indexOf('hubFetch') && (e.match(/hubFetch\(/g) || []).length === 1, 'Cache vor Netz, eine Nachfrage');
  assert(/kinds: \[30142, 30023, 31923\]/.test(e) && /'#d'/.test(e) && /ids: /.test(e), 'Obermenge nach Kind, Autor, d und ids');
});
