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
  assert(/kinds: \[0\], authors: \[hex\], limit: 1/.test(k), 'fünfter Filter: Gesundheitsblick (kind 0 des Community-Schlüssels)');
  assert(/direkt: neueste\(events\.filter\(ev => \[30142, 30023, 31923\]\.includes\(ev\.kind\)\)\)/.test(k), 'kind 0 zählt nicht als Inhalt');
  assert(/istHex64\(/.test(k), 'Schlüssel aus Reposts nur als 64-Hex');
  assert(/eigene/.test(k) && /ocLaden\(\)/.test(k), 'Schaufenster ohne Community aus ocDaten');
  assert(!/kinds: \[30004\] \}/.test(k) && !/groups\.edufeed\.org/.test(html), 'nie global, nie das Gruppen-Relay');
  const e = fn('eintraegeAufloesen');
  assert(/mpDaten/.test(e) && /ocDaten/.test(e) && e.indexOf('mpDaten') < e.indexOf('hubFetch') && (e.match(/hubFetch\(/g) || []).length === 1, 'Cache vor Netz, eine Nachfrage');
  assert(/kurzHash\(/.test(e) && !/\.slice\(0, 200\)/.test(e), 'Cache-Schlüssel über den Hash der ganzen Adressliste');
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
  assertEquals(j.actions['material.finden'].params, { thema: ['Frieden'], stufe: ['Primarstufe'] }); assertEquals(j.sammlung.community, null);
});

Deno.test('Sammlung: Ansicht, Route, keine eigene Abfrage, drei Ausgänge', async () => {
  assert(/id="v-sammlung" data-stand="nachbau:/.test(html), 'Ansicht mit Stand-Zeile');
  const r = block(/function route\(\)[\s\S]*?window\.scrollTo/);
  assert(/'finden'/.test(r) && /saOpen\(/.test(r), 'Route finden/sammlung');
  const o = block(/function saOpen\(qs\)[\s\S]*?\n  \}/) + block(/function saRender\(\)[\s\S]*?\n  \}/);
  assert(/mpLaden\(\)/.test(o) && /coLaden\(/.test(o) && /f\.c/.test(o) && !/hubFetch\(/.test(o), 'nur Caches, Community nur bei Filter, keine eigene Abfrage');
  assert(/id="saEinbetten"/.test(o) && /id="saAbo"/.test(o) && /Als Nostr-Liste speichern/.test(o) && /disabled aria-disabled="true"/.test(o) && /braucht einen Server/.test(o), 'Ausgänge ehrlich');
  assert(/Sammlung zusammenstellen/.test(html), 'Knopf im Materialpool');
  assert(/go\('finden\/sammlung\?q=/.test(block(/function lizenzAktionen\(stand, m\)[\s\S]*?\n  \}/)), 'In der Sammlung zeigen führt zur Sammlung');
  assert(/Sammlung/.test(await Deno.readTextFile(new URL('../docs/navigation.md', import.meta.url))), 'docs/navigation.md');
});

Deno.test('Katalog-Tab: Route, zwei Schichten, drei Zustände, Titel maskiert, Pool', () => {
  assert(/zu=katalog|'zu'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'zu=katalog');
  const k = fn('katRender');
  assert(/coLaden\(/.test(k) && /coEintraege\(/.test(k) && /eintraegeAufloesen\(/.test(k) && /eintragKarte\(/.test(k), 'Grundschicht aus geteilten Inhalten');
  assert(/In der Community geteilt/.test(k) && /zusammengestellt/.test(k) && /ohne Rollenprüfung/.test(k), 'zwei Schichten, Grenze benannt');
  assert(/noch nichts geteilt/.test(k) && /antworten gerade nicht/.test(k) && /Stand vom/.test(k) && /nicht auflösbar/.test(k), 'Zustände');
  assert(/esc\(l\.titel\)|esc\(liste\.titel\)/.test(k) && /naddr\([^)]*30004\)/.test(k) && /shortcodeAus\(/.test(k), 'maskiert, Teilen, Einbetten');
  assert(/pool/.test(k) && /#materialpool/.test(k), 'Materialpool als Katalog der Instanz rpi-virtuell');
  assert(/'katalog'/.test(fn('crRender')), 'Navigationseintrag im Raum');
  assert(/zu=katalog/.test(block(/function cyCards\([\s\S]*?\n  \}/)), 'Link auf der Kachel');
  assert(html.includes('id="v-community" data-stand="nachbau:Beispielinhalte"'), 'Startwert der Ansicht bleibt Nachbau');
});

Deno.test('coLaden: leere Antwort bleibt „keine Antwort“, ein kind-0-Gesundheitsblick belegt Antwort ohne Inhalt', async () => {
  const hex = 'ee'.repeat(32), anfragen: any[] = [];
  (globalThis as any).__anfragen = anfragen;
  const lauf = (events: any[]) => {
    const extra = `const CO_SCHLUESSEL = [{ hex: '${hex}' }]; const coDaten = new Map(); const ocLaden = () => Promise.resolve({ seiten: new Map(), beitraege: [], termine: [] });
      const listeEintraege = () => ({}); const entferntAus = () => new Set();
      const hubFetch = (name, filter) => { globalThis.__anfragen.push(filter); return Promise.resolve(EVENTS); };`.replace('EVENTS', JSON.stringify(events));
    return bau('coLaden', extra)(hex);
  };
  const leer = await lauf([]);
  assertEquals(leer.antwort, false, 'leere Antwort = keine Antwort');
  assertEquals(anfragen[0].length, 5); assertEquals(anfragen[0][4], { kinds: [0], authors: [hex], limit: 1 });
  const profil = await lauf([{ id: 'p', kind: 0, pubkey: hex, created_at: 1, tags: [], content: '{}' }]);
  assertEquals(profil.antwort, true, 'kind 0 belegt: Relays haben geantwortet');
  assertEquals(profil.direkt.length, 0); assertEquals(profil.reposts.length, 0);
  assertEquals(bau('coEintraege', fn('aTagLesen') + fn('repostZiel'))(profil).length, 0, 'kind 0 ergibt keinen Eintrag');
});

Deno.test('kurzHash: stabil, 8 Hex-Zeichen, unterscheidet auch nach Stelle 200', () => {
  const h = bau('kurzHash'), basis = 'a'.repeat(300);
  assertEquals(h('x'), h('x')); assert(/^[0-9a-f]{8}$/.test(h('')) && /^[0-9a-f]{8}$/.test(h(basis)), 'Format');
  assert(h(basis + '1') !== h(basis + '2') && h(basis.slice(0, 250) + 'b' + basis.slice(251)) !== h(basis), 'Unterschied nach Position 200');
});

Deno.test('prRender: Funkloch heißt „Relays nicht erreichbar“, nicht „kein Profil“', () => {
  const aus: any = { innerHTML: '' }, stand: string[][] = [];
  (globalThis as any).__stand = stand;
  const extra = `const document = { getElementById: () => globalThis.__aus }; const datenstand = (...a) => globalThis.__stand.push(a);`;
  (globalThis as any).__aus = aus;
  const render = bau('prRender', extra);
  render({ fehler: 'Die Relays antworten gerade nicht.', stumm: true });
  assert(aus.innerHTML.includes('Die Relays antworten gerade nicht.') && aus.innerHTML.includes('#kooperieren/personen'), 'Meldung mit Weg zurück');
  assertEquals(stand.at(-1), ['v-person', 'nachbau', 'Relays nicht erreichbar']);
  render({ fehler: 'Kein gültiges Profil in der Adresse.' });
  assertEquals(stand.at(-1), ['v-person', 'nachbau', 'Profil nicht gefunden']);
});
