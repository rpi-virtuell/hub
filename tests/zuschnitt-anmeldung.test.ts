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

Deno.test('zuschnittAus: npub, Hex, Unsinn', () => {
  const za = bau('zuschnittAus', fn('npubToHex'));
  assertEquals(za('?c=npub14esenw6rt4c2pmxwvyey4jqw0sjdahetq6qvh5lffxp7w4thg63ql480z2'), 'ae6199bb435d70a0ecce61324ac80e7c24dedf2b0680cbd3e94983e7557746a2');
  assertEquals(za('?c=' + 'ab'.repeat(32)), 'ab'.repeat(32)); assertEquals(za('?c=kaputt'), null); assertEquals(za(''), null);
});

Deno.test('Zuschnitt: Leiste, Ansichten, eigene Instanz', () => {
  assert(/let HUB_C = null/.test(s) && /function zuschnittSetzen\(hex\)/.test(s) && /relihub-c/.test(fn('zuschnittSetzen')), 'Zustand und Speicher');
  assert(/kind: 'zuschnitt'/.test(fn('leisteItems')) && /Zuschnitt aufheben/.test(html), 'Leiste');
  for (const f of ['saOpen', 'kaOpen', 'crOpen', 'peRender', 'pkRender']) assert(/HUB_C/.test(fn(f)), f + ' kennt den Zuschnitt');
  assert(/id="v-eigene-instanz" data-stand="nachbau:/.test(html) && /'eigene-instanz'/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'Ansicht und Route');
  const e = fn('eiRender');
  assert(/kontextprofilAus\(/.test(e) && /shortcodeAus\(/.test(e) && /config-src/.test(e) && /\?c=/.test(e) && /kooperationsvereinbarung/.test(e) && /bedarfe-technik/.test(e) && /relihub-steuerkonsole/.test(e) && /relihub-leiste/.test(e), 'Vorschau und Schnipsel');
  assert(/"c"/.test(fn('kontextprofilAus')) || /c:/.test(fn('kontextprofilAus')), 'Kontextprofil trägt den Zuschnitt');
  const d = Deno.readTextFileSync(new URL('../docs/leiste.md', import.meta.url));
  assert(/zuschnitt/.test(d), 'docs/leiste.md');
});

Deno.test('listeErgaenzen: ergänzt, ersetzt nie, doppelt ergibt null', () => {
  const le = bau('listeErgaenzen');
  const alt = { kind: 30000, content: 'x', tags: [['d', 'communities'], ['p', 'aa'.repeat(32)], ['client', 'Edufeed']] };
  const neu = le(alt, 30000, 'communities', ['p', 'bb'.repeat(32)]);
  assertEquals(neu.kind, 30000); assertEquals(neu.content, 'x');
  assertEquals(neu.tags, [['d', 'communities'], ['p', 'aa'.repeat(32)], ['client', 'Edufeed'], ['p', 'bb'.repeat(32)]], 'alte Tags bleiben, d einmal, neuer Tag hinten');
  assertEquals(le(alt, 30000, 'communities', ['p', 'aa'.repeat(32)]), null, 'schon enthalten');
  const k3 = le(null, 3, null, ['p', 'cc'.repeat(32)]);
  assertEquals(k3.tags, [['p', 'cc'.repeat(32)]]); assert(!k3.tags.some((t: string[]) => t[0] === 'd'), 'kind 3 ohne d');
});

Deno.test('sammlungListe: d aus Filter, höchstens 100 Einträge, kein Hub-Name', () => {
  const sl = bau('sammlungListe', fn('kurzHash'));
  const f = { c: 'religlobal', fach: ['Ethik'], stufe: [], lizenz: 'offen', q: ['Frieden'] };
  const e = Array.from({ length: 120 }, (_, i) => ({ adr: `30142:${'ab'.repeat(32)}:m${i}`, kind: 30142 }));
  const ev = sl(f, e);
  assertEquals(ev.kind, 30004); assert(/^sammlung-[0-9a-f]{8}$/.test(ev.tags.find((t: string[]) => t[0] === 'd')[1]));
  assertEquals(ev.tags.filter((t: string[]) => t[0] === 'a').length, 100); assert(!JSON.stringify(ev).includes('reli_hub'));
  assertEquals(sl(f, e).tags.find((t: string[]) => t[0] === 'd')[1], ev.tags.find((t: string[]) => t[0] === 'd')[1], 'deterministisch');
});

Deno.test('Aktionen: nur mit Signer, frisch holen, Relays zählen, kein nsec', () => {
  assert(/const ICH = \{ hex: null, kann: false \}/.test(s) && /window\.nostr/.test(fn('anmelden')) && !/nsec/.test(s.replace(/nsec1…|kein nsec|nie nach einem nsec/g, '')), 'NIP-07, kein nsec im Skript');
  const a = fn('aktion');
  assert(/listeSchreiben\(/.test(a) && /listeErgaenzen\(/.test(fn('listeSchreiben')) && /authors: \[ICH\.hex\]/.test(a) && /kinds: \[3\]/.test(a) && /kinds: \[30000\]/.test(a) && /kind: 31925/.test(a) && /kind: 7/.test(a) && /sammlungListe\(/.test(a), 'alle Aktionen über Listen-Ergänzung und Vorlagen');
  const su = fn('signierenUndSenden');
  assert(/ICH\.kann/.test(su) && /Signieren abgebrochen/.test(su) && /Kein Relay hat/.test(su) && /angenommen von/.test(su), 'Zustände');
  assert(/function hubSenden\(ev\)/.test(s) && /'OK'/.test(fn('hubSenden')) && /RELAYS/.test(fn('hubSenden')), 'Senden an die drei Relays mit OK');
  assert(/braucht Anmeldung mit Schlüssel/.test(s) && /id="anmelden"/.test(html), 'Hinweis und Dialog');
  assert(/Das bist du/.test(block(/if \(v === 'profil'\)[\s\S]*?\n    \}/) + s), 'eigenes Profil');
});

Deno.test('hubSenden: drei Relays, zählt nur OK mit true und passender id, schließt jede Verbindung', async () => {
  const socks: any[] = [], ev = { id: 'ab'.repeat(32), kind: 7, pubkey: 'cd'.repeat(32), created_at: 1, content: '+', tags: [], sig: 'ef'.repeat(64) };
  class FakeWS {
    url: string; onopen: any; onmessage: any; onerror: any; onclose: any; gesendet: any[] = []; zu = false;
    constructor(url: string) { this.url = url; socks.push(this); setTimeout(() => this.onopen && this.onopen(), 0); }
    send(t: string) {
      this.gesendet.push(JSON.parse(t));
      const melde = (m: unknown[]) => setTimeout(() => this.onmessage && this.onmessage({ data: JSON.stringify(m) }), 0);
      if (this.url.endsWith('eins')) melde(['OK', ev.id, true, '']);
      if (this.url.endsWith('zwei')) melde(['OK', ev.id, false, 'blocked: nein']);
      if (this.url.endsWith('drei')) melde(['OK', 'ff'.repeat(32), true, '']);   // fremde id, danach Schweigen bis zur Zeitgrenze
    }
    close() { this.zu = true; }
  }
  (globalThis as any).__WS = FakeWS;
  assert(/TIMEOUT_MS/.test(fn('hubSenden')) && /const TIMEOUT_MS = 8000/.test(s), 'Zeitgrenze 8 s je Relay');
  const hs = new Function(`const RELAYS = ['wss://eins', 'wss://zwei', 'wss://drei']; const TIMEOUT_MS = 60; const WebSocket = globalThis.__WS;` + fn('hubSenden') + '; return hubSenden;')();
  const t0 = Date.now(), n = await hs(ev);
  assertEquals(n, 1, 'nur das angenommene OK zählt');
  assertEquals(socks.length, 3); assert(socks.every((w) => w.zu), 'jede Verbindung geschlossen');
  assert(socks.every((w) => w.gesendet.length === 1 && w.gesendet[0][0] === 'EVENT' && w.gesendet[0][1].id === ev.id), 'je Relay einmal EVENT');
  assert(Date.now() - t0 < 2000, 'löst nach der Zeitgrenze auf');
});

Deno.test('listeSchreiben: ohne Antwort nichts, fehlende Liste fragt, Sitzungskopie gewinnt, kind 3 fragt immer, Sammlung wird ergänzt', async () => {
  const ls = bau('listeSchreiben', fn('listeErgaenzen')), ich = 'aa'.repeat(32), B = 'bb'.repeat(32), C = 'cc'.repeat(32), D = 'dd'.repeat(32);
  const lauf = async (evs: any[], a: any, sitzung: any = null, ja = true, alle = true) => {
    const r = { gesendet: [] as any[], fragen: [] as string[], meldungen: [] as string[] };
    const ok = await ls(a, { ich, sitzung, holen: () => Promise.resolve({ evs, alle }), senden: (v: any) => { r.gesendet.push(v); return Promise.resolve(true); }, fragen: (q: string) => { r.fragen.push(q); return ja; }, melden: (m: string) => r.meldungen.push(m), merken: () => {} });
    return Object.assign(r, { ok });
  };
  const gesund = { kind: 0, pubkey: 'ff'.repeat(32), created_at: 1, tags: [], content: '{}' };
  const beitreten = { filter: {}, kind: 30000, d: 'communities', tags: [['p', C]], frage: 'neu?', schon: 'schon', erfolg: 'ok' };
  const leer = await lauf([], beitreten);
  assertEquals(leer.gesendet.length, 0); assert(/antworten gerade nicht/.test(leer.meldungen[0]), 'leere Antwort sendet nichts');
  const nein = await lauf([gesund], beitreten, null, false);
  assertEquals(nein.fragen, ['neu?']); assertEquals(nein.gesendet.length, 0, 'fehlende Liste: erst fragen, Nein sendet nichts');
  const ja = await lauf([gesund], beitreten);
  assertEquals(ja.gesendet[0].tags, [['d', 'communities'], ['p', C]]);
  const alt = { kind: 30000, pubkey: ich, created_at: 10, content: '', tags: [['d', 'communities'], ['p', B]] };
  const sitz = { kind: 30000, pubkey: ich, created_at: 20, content: '', tags: [['d', 'communities'], ['p', B], ['p', D]] };
  const s1 = await lauf([gesund, alt], beitreten, sitz);
  assertEquals(s1.fragen.length, 0); assertEquals(s1.gesendet[0].tags, [['d', 'communities'], ['p', B], ['p', D], ['p', C]], 'Sitzungskopie ist neuer und gewinnt');
  const s2 = await lauf([gesund, sitz], beitreten, alt);
  assertEquals(s2.gesendet[0].tags, [['d', 'communities'], ['p', B], ['p', D], ['p', C]], 'frische Antwort ist neuer und gewinnt');
  const k3alt = { kind: 3, pubkey: ich, created_at: 1700000000, content: 'r', tags: [['p', B], ['p', D]] };
  const folgen = { filter: {}, kind: 3, d: null, tags: [['p', C]], nameText: 'Name', frage: 'keine Liste?', schon: 'schon', erfolg: 'ok' };
  const k3nein = await lauf([gesund, k3alt], folgen, null, false);
  assertEquals(k3nein.gesendet.length, 0); assert(/^Gefunden: Folgeliste vom .+ mit 2 Einträgen\. Sie wird um Name ergänzt und neu veröffentlicht\. Folgst du anderswo mehr Personen, gehen diese Einträge verloren\. Fortfahren\?$/.test(k3nein.fragen[0]), 'kind 3 fragt auch mit Liste');
  const k3ja = await lauf([gesund, k3alt], folgen);
  assertEquals(k3ja.gesendet[0], { kind: 3, content: 'r', tags: [['p', B], ['p', D], ['p', C]] });
  assertEquals((await lauf([gesund], folgen, null, false)).fragen, ['keine Liste?']);
  const samm = { kind: 30004, pubkey: ich, created_at: 5, content: '', tags: [['d', 'sammlung'], ['title', 'Meine Sammlung'], ['a', '30142:' + B + ':x']] };
  const zur = { filter: {}, kind: 30004, d: 'sammlung', tags: [['a', '30142:' + B + ':y']], basis: { kind: 30004, content: '', tags: [['title', 'Meine Sammlung']] }, schon: 'schon drin', erfolg: 'ok' };
  const z = await lauf([gesund, samm], zur);
  assertEquals(z.fragen.length, 0); assertEquals(z.gesendet[0].tags, [['d', 'sammlung'], ['title', 'Meine Sammlung'], ['a', '30142:' + B + ':x'], ['a', '30142:' + B + ':y']], 'bestehende Sammlung ergänzt, nicht ersetzt');
  const doppelt = await lauf([gesund, samm], { ...zur, tags: [['a', '30142:' + B + ':x']] });
  assertEquals(doppelt.gesendet.length, 0); assertEquals(doppelt.meldungen, ['schon drin']);
});

Deno.test('listeSchreiben: ein schweigendes Relay sendet nichts, Sammlung ohne Liste fragt, created_at über der alten Fassung', async () => {
  const daten = s.slice(s.indexOf('  const RELAYS ='), s.indexOf('  /** Datenstand sichtbar'));
  const ich = 'aa'.repeat(32), B = 'bb'.repeat(32), C = 'cc'.repeat(32), FO = 'ff'.repeat(32);
  const alt = { id: '11'.repeat(32), kind: 30000, pubkey: ich, created_at: 10, content: '', tags: [['d', 'communities'], ['p', B]] };
  const gesund = { id: '22'.repeat(32), kind: 0, pubkey: FO, created_at: 1, tags: [], content: '{}' };
  const aufbau = (stumm: string[]) => {
    const socks: any[] = [];
    class WS {
      url: string; onopen: any; onmessage: any; onerror: any; onclose: any; zu = false;
      constructor(u: string) { this.url = u; socks.push(this); queueMicrotask(() => this.onopen && this.onopen()); }
      send(x: string) {
        const [, sub] = JSON.parse(x); if (stumm.includes(this.url)) return;   // stumm: weder EVENT noch EOSE, nur die Zeitgrenze
        const m = (d: unknown) => queueMicrotask(() => this.onmessage && this.onmessage({ data: JSON.stringify(d) }));
        m(['EVENT', sub, gesund]); if (this.url.includes('rpi')) m(['EVENT', sub, alt]); m(['EOSE', sub]);
      }
      close() { this.zu = true; }
    }
    const ss = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    const kurz = (f: any, ms: number) => setTimeout(f, Math.min(ms, 20));
    const api = new Function('WebSocket', 'sessionStorage', 'setTimeout', 'tagWert', 'tagWerte', 'istHex64', daten + `const FO_HEX = '${FO}';` + fn('frischHolen') + fn('listeErgaenzen') + fn('listeSchreiben') + '; return { frischHolen, listeSchreiben };')(WS, ss, kurz, tagWert, tagWerte, istHex64);
    return { api, socks };
  };
  const beitreten = { filter: { kinds: [30000], authors: [ich], '#d': ['communities'], limit: 1 }, kind: 30000, d: 'communities', tags: [['p', C]], frage: 'neu?', schon: 'schon', erfolg: 'ok' };
  const lauf = async (stumm: string[], a: any = beitreten, ja = true) => {
    const { api, socks } = aufbau(stumm), r = { gesendet: [] as any[], fragen: [] as string[], meldungen: [] as string[], socks };
    await api.listeSchreiben(a, { ich, sitzung: null, holen: api.frischHolen, senden: (v: any) => { r.gesendet.push(v); return Promise.resolve(true); }, fragen: (q: string) => { r.fragen.push(q); return ja; }, melden: (m: string) => r.meldungen.push(m), merken: () => {} });
    return r;
  };
  const still = await lauf(['wss://amb-relay.edufeed.org']);
  assertEquals(still.socks.length, 3, 'alle drei Relays gefragt');
  assertEquals(still.gesendet.length, 0); assertEquals(still.fragen.length, 0); assertEquals(still.meldungen, ['Nicht alle Relays haben geantwortet; nichts gesendet.']);
  const ohneListe = await lauf(['wss://relay-rpi.edufeed.org']);   // gerade das Relay mit der Liste schweigt
  assertEquals(ohneListe.gesendet.length, 0); assertEquals(ohneListe.fragen.length, 0, 'kein „noch keine Liste“, wenn ein Relay fehlt');
  const voll = await lauf([]);
  assertEquals(voll.fragen.length, 0); assertEquals(voll.gesendet[0].tags, [['d', 'communities'], ['p', B], ['p', C]], 'alle antworten: alte Liste ergänzt');
  assert(!('created_at' in voll.gesendet[0]), 'alte Fassung liegt zurück: Zeit setzt erst das Signieren');
  // kind 30004 ohne vorhandene Liste fragt (Meine Sammlung und gespeicherte Sammlung), Nein sendet nichts
  const ls = bau('listeSchreiben', fn('listeErgaenzen')), ihr = (evs: any[], ja: boolean) => {
    const r = { gesendet: [] as any[], fragen: [] as string[] };
    return { r, dep: { ich, sitzung: null, holen: () => Promise.resolve({ evs, alle: true }), senden: (v: any) => { r.gesendet.push(v); return Promise.resolve(true); }, fragen: (q: string) => { r.fragen.push(q); return ja; }, melden: () => {}, merken: () => {} } };
  };
  const a = fn('aktion');
  assert(/d: 'sammlung', tags: \[\['a', ziel\]\], basis: [^\n]*?frage: '[^']+'/.test(a) && /kind: 30004, d, tags: neueA, basis: [^\n]*?frage: '[^']+'/.test(a), 'beide 30004-Aufrufe tragen eine Frage');
  const zur = { filter: {}, kind: 30004, d: 'sammlung', tags: [['a', '30142:' + B + ':y']], basis: { kind: 30004, content: '', tags: [['title', 'Meine Sammlung']] }, schon: 'schon', erfolg: 'ok' };
  for (const fall of [{ ...zur, frage: 'Sammlung neu?' }, zur]) {
    const nein = ihr([gesund], false); await ls(fall, nein.dep);
    assertEquals(nein.r.fragen.length, 1, 'fehlende 30004-Liste fragt, auch ohne eigene Frage'); assertEquals(nein.r.gesendet.length, 0);
  }
  // created_at = max(jetzt, alt + 1)
  const zukunft = Math.floor(Date.now() / 1000) + 3600, neuer = { ...alt, created_at: zukunft };
  const z = ihr([gesund, neuer], true); await ls(beitreten, z.dep);
  assertEquals(z.r.gesendet[0].created_at, zukunft + 1, 'liegt die alte Fassung in der Zukunft, kommt die neue eine Sekunde danach');
  const su = new Function('ICH', 'window', 'hubSenden', 'toast', 'akAufnehmen', 'istHex64', fn('signierenUndSenden') + '; return signierenUndSenden;');
  const signiert: any[] = [], sende = su({ kann: true, hex: ich }, { nostr: { signEvent: (e: any) => { signiert.push(e); return Promise.resolve({ ...e, id: '33'.repeat(32), sig: 'x' }); } } }, () => Promise.resolve(3), () => {}, () => {}, istHex64);
  const jetzt = Math.floor(Date.now() / 1000);
  await sende({ kind: 30000, tags: [], created_at: zukunft + 1 }, 'ok'); await sende({ kind: 30000, tags: [] }, 'ok'); await sende({ kind: 30000, tags: [], created_at: 5 }, 'ok');
  assertEquals(signiert[0].created_at, zukunft + 1); assert(signiert[1].created_at >= jetzt && signiert[2].created_at >= jetzt, 'sonst jetzt');
});

Deno.test('aktion: Reaktion und Zusage nur mit 64-Hex-Event-Kennung', () => {
  const a = fn('aktion');
  assert(/!istHex64\(ev\.id\)/.test(a) && /fehlt die Event-Kennung/.test(a), 'ohne e-Tag kein kind 7 und kein kind 31925');
  assert(!/\.\.\.\(istHex64\(ev\.id\) \? \[\['e'/.test(a), 'e-Tag nicht mehr optional');
});

Deno.test('ADR-0009 und README nennen die Etappe', async () => {
  const adr = await Deno.readTextFile(new URL('../docs/adr/0009-beziehungsgefuege-mitmachen-anmeldung.md', import.meta.url));
  assert(/^# ADR-0009/.test(adr) && /## Status/.test(adr) && /## Entscheidung/.test(adr) && /e6875f0b/.test(adr) && /bfa727b9/.test(adr) && /NIP-07/.test(adr) && /\?c=/.test(adr) && /ohne Rollenprüfung|Mitgliederrollen/.test(adr) && /purplepag/.test(adr));
  assert(!/Arbeitspaket|Meilenstein|Förderkennzeichen|Projektträger|Zwischenbericht/.test(adr), 'Projektsprache');
  const r = await Deno.readTextFile(new URL('../README.md', import.meta.url));
  assert(/0009-beziehungsgefuege-mitmachen-anmeldung/.test(r) && /Ökosystem/.test(r) && /Mitmachen/.test(r) && /Anmeldung|anmelden/.test(r), 'README');
});
