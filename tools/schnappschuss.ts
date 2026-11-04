// Erneuert den eingebetteten Schnappschuss der relilab-Termine in index.html (ADR-0006).
// Aufruf: deno task schnappschuss — eine Abfrage an relay.edufeed.org, ein REQ, bis EOSE oder 25 s.
// Schreibt den Block zwischen /* schnappschuss:termine */ und /* /schnappschuss:termine */ neu.
// Holt dazu mit einer zweiten Abfrage die sechs neuesten Beiträge des Schaufenster-Schlüssels und schreibt
// den Block zwischen /* schnappschuss:beitraege */ und /* /schnappschuss:beitraege */ neu.

const RELAY = 'wss://relay.edufeed.org';
const WARTEN_MS = 25000;
// Absender der Termine (NIP-52, kind 31923): relilab, relilab-impuls, relilab-Termine-Bot
const ABSENDER = [
  'npub1fpcxaz2wvjl90gjs60x37ny2pa5u4yqfx7fklz73rgfjnnfujl3sr2fxgk',
  'npub1lde034983zllh2nhe48lt60q6p3a6lsxn0g90uemhg0906jsnzesh5vz8y',
  'npub17mq54dad6ewkrnunzx5xs4t4c0edur99gz7ymhu3dam0pz034fpsxjqk3d',
];
// Schaufenster-Schlüssel oer.community (derselbe npub wie FO_NPUB in index.html)
const FO = 'npub1tgftg8kptdrxxg0g3sm3hckuglv3j0uu3way4vylc5qyt0f44m0s3gun6e';
const DATEI = new URL('../index.html', import.meta.url);
const ANFANG = '/* schnappschuss:termine */', ENDE = '/* /schnappschuss:termine */';
const B_ANFANG = '/* schnappschuss:beitraege */', B_ENDE = '/* /schnappschuss:beitraege */';

type Ev = { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string };

/** npub (Bech32, NIP-19) → 64 Hex-Zeichen */
function npubToHex(npub: string): string {
  const B32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  let acc = 0, bits = 0, hex = '';
  for (const c of npub.slice(npub.lastIndexOf('1') + 1, -6)) {
    acc = ((acc << 5) | B32.indexOf(c)) & 0xfff; bits += 5;
    if (bits >= 8) { bits -= 8; hex += ((acc >> bits) & 255).toString(16).padStart(2, '0'); }
  }
  return hex;
}

function holen(filter: Record<string, unknown>): Promise<Ev[]> {
  return new Promise((resolve) => {
    const gesammelt: Ev[] = [];
    const sub = 'schnappschuss-' + Math.random().toString(36).slice(2, 8);
    const ws = new WebSocket(RELAY);
    const fertig = () => { clearTimeout(timer); try { ws.close(); } catch { /* schon zu */ } resolve(gesammelt); };
    const timer = setTimeout(fertig, WARTEN_MS);
    ws.onopen = () => ws.send(JSON.stringify(['REQ', sub, filter]));
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d[0] === 'EVENT' && d[1] === sub) gesammelt.push(d[2]);
      else if (d[0] === 'EOSE' || d[0] === 'CLOSED' || d[0] === 'NOTICE') { if (d[0] !== 'EOSE') console.error(d.join(' ')); fertig(); }
    };
    ws.onerror = () => { console.error(`Keine Verbindung zu ${RELAY}`); fertig(); };
  });
}

const roh = await holen({ kinds: [31923], authors: ABSENDER.map(npubToHex) });
// Nur Termine, die noch laufen oder höchstens 30 Tage vorbei sind (das Relay liefert sonst Hunderte vergangene).
const ab = Date.now() / 1000 - 30 * 86400;
const tag = (e: Ev, k: string) => +((e.tags.find((t) => t[0] === k) || [])[1] || 0);
// gekürzt auf die Felder, die der Hub liest; nach created_at sortiert, nach id dedupliziert
const gesehen = new Set<string>();
const events = roh
  .filter((e) => (tag(e, 'end') || tag(e, 'start')) >= ab)
  // content nur, wenn kein summary-Tag da ist (der Hub liest dann summary; spart Platz)
  .map(({ id, pubkey, created_at, kind, tags, content }) => ({ id, pubkey, created_at, kind, tags, content: tags.some((t) => t[0] === 'summary' && t[1]) ? '' : content }))
  .sort((a, b) => a.created_at - b.created_at)
  .filter((e) => !gesehen.has(e.id) && gesehen.add(e.id));

const stand = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
let html = await Deno.readTextFile(DATEI);

/** Block zwischen zwei Markern ersetzen; fehlt ein Marker, bleibt die Datei unverändert */
function ersetzen(text: string, anfang: string, ende: string, inhalt: string): string {
  const a = text.indexOf(anfang), z = text.indexOf(ende);
  if (a < 0 || z < a) { console.error(`Marker ${anfang} nicht gefunden; dieser Block bleibt unverändert.`); return text; }
  return text.slice(0, a) + anfang + inhalt + text.slice(z);
}

let anzahlTermine = 0;
if (events.length) {
  html = ersetzen(html, ANFANG, ENDE, `\n  let RT_RAW = ${JSON.stringify(events).replace(/</g, '\\u003c')};\n  let RT_STAND = '${stand}';\n  `);
  anzahlTermine = events.length;
} else console.error('Das Relay hat keine Termine geliefert; dieser Block bleibt unverändert.');

// Beiträge des Schaufensters: Seiten (Label `seite`) ausschließen, sechs neueste nach published_at, content gekürzt auf ''
const datum = (e: Ev) => +((e.tags.find((t) => t[0] === 'published_at') || [])[1] || 0) || e.created_at;
const beitragRoh = await holen({ kinds: [30023], authors: [npubToHex(FO)], limit: 12 });
const beitraege = beitragRoh
  .filter((e) => !e.tags.some((t) => t[0] === 'l' && t[1] === 'seite'))
  .sort((a, b) => datum(b) - datum(a))
  .slice(0, 6)
  .map(({ id, pubkey, created_at, kind, tags }) => ({ id, pubkey, created_at, kind, tags, content: '' }));
if (beitraege.length) {
  html = ersetzen(html, B_ANFANG, B_ENDE, `\n  let OC_RAW = ${JSON.stringify(beitraege).replace(/</g, '\\u003c')};\n  let OC_STAND = '${stand}';\n  `);
} else console.error('Das Relay hat keine Beiträge geliefert; dieser Block bleibt unverändert.');

if (!anzahlTermine && !beitraege.length) Deno.exit(1);
await Deno.writeTextFile(DATEI, html);
console.log(`${anzahlTermine} Termine, ${beitraege.length} Beiträge, Stand ${stand}`);
if (roh.length >= 500) console.error(`Hinweis: ${roh.length} Events empfangen, das Relay kappt vermutlich bei 500; früher angelegte Termine fehlen dann.`);
