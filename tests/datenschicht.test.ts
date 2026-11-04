// Verhaltensprüfung der Datenschicht: hubFetch und speicher aus dem Anwendungsskript,
// ausgeführt mit kleinen Attrappen für WebSocket, sessionStorage und localStorage (kein Netz).
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript } from './helfer.ts';

const s = appScript();
const datenschicht = s.slice(s.indexOf('  const RELAYS ='), s.indexOf('  /** Datenstand sichtbar'));
const speicherSrc = s.match(/  function speicher\(key, value\) \{[\s\S]*?\n  \}/)![0];
const pause = () => new Promise((r) => setTimeout(r, 0));

/** Frische Datenschicht mit eigener Socket-Attrappe; jede Instanz hat ihre eigene Warteschlange. */
function aufbau(opts: { ctorWirft?: boolean; speicher?: unknown } = {}) {
  const st = { offen: 0, max: 0, geoeffnet: [] as string[], socks: [] as any[] };
  class FakeWS {
    url: string; sent: any[] = []; zu = false;
    onopen: any; onmessage: any; onerror: any; onclose: any;
    constructor(u: string) {
      if (opts.ctorWirft) throw new Error('kein WebSocket');
      this.url = u; st.geoeffnet.push(u); st.offen++; st.max = Math.max(st.max, st.offen); st.socks.push(this);
      queueMicrotask(() => this.onopen && this.onopen());
    }
    send(x: string) { this.sent.push(JSON.parse(x)); }
    close() { if (this.zu) return; this.zu = true; st.offen--; }
    msg(d: unknown) { this.onmessage({ data: JSON.stringify(d) }); }
    eose() { this.msg(['EVENT', this.sent[0][1], { id: 'ev-' + this.url, kind: 1 }]); this.msg(['EOSE', this.sent[0][1]]); }
  }
  const ablage: Record<string, string> = {};
  const ss = opts.speicher ?? { getItem: (k: string) => ablage[k] ?? null, setItem: (k: string, v: string) => { ablage[k] = v; } };
  const hubFetch = new Function('WebSocket', 'sessionStorage', datenschicht + '; return hubFetch;')(FakeWS, ss);
  return { hubFetch, st, ablage };
}

Deno.test('hubFetch: ein Socket je Relay, alle Filter in einem REQ, Gruppen-Relay gefiltert', async () => {
  const { hubFetch, st, ablage } = aufbau();
  const p = hubFetch('a', [{ kinds: [1] }, { kinds: [30023] }], { relays: ['wss://relay.edufeed.org', 'wss://relay-rpi.edufeed.org', 'wss://groups.edufeed.org'] });
  await pause();
  assertEquals(st.geoeffnet, ['wss://relay.edufeed.org', 'wss://relay-rpi.edufeed.org'], 'groups.edufeed.org darf nicht geöffnet werden');
  for (const w of st.socks) {
    assertEquals(w.sent.length, 1, 'genau ein REQ je Relay');
    assertEquals(w.sent[0][0], 'REQ'); assertEquals(w.sent[0].slice(2), [{ kinds: [1] }, { kinds: [30023] }]);
  }
  st.socks.forEach((w) => w.eose());
  assertEquals((await p).length, 2);
  assert(ablage['relihub:a'], 'Ergebnis im Zwischenspeicher');
  assertEquals(st.offen, 0, 'alle Sockets geschlossen');
});

Deno.test('hubFetch: höchstens MAX_CONN Sockets zugleich, weitere warten', async () => {
  const { hubFetch, st } = aufbau();
  const p1 = hubFetch('b', [{}]);                                       // drei Relays
  const p2 = hubFetch('c', [{}], { relays: ['wss://relay.edufeed.org'] });   // vierter Socket muss warten
  await pause();
  assertEquals(st.offen, 3); assertEquals(st.geoeffnet.length, 3, 'vierter Socket wartet');
  st.socks[0].eose(); await pause();
  assertEquals(st.geoeffnet.length, 4, 'wartender Socket startet nach dem ersten Abschluss');
  st.socks.slice(1).forEach((w) => w.eose());
  await p1; await p2;
  assertEquals(st.max, 3, 'nie mehr als MAX_CONN offen');
});

Deno.test('hubFetch: zweite Abfrage innerhalb von 60 s ohne Netz', async () => {
  const { hubFetch, st } = aufbau();
  const p = hubFetch('d', [{}], { relays: ['wss://relay.edufeed.org'] }); await pause();
  st.socks[0].eose(); const erst = await p;
  const vorher = st.geoeffnet.length;
  const zweit = await hubFetch('d', [{}], { relays: ['wss://relay.edufeed.org'] });
  assertEquals(st.geoeffnet.length, vorher, 'kein neuer Socket'); assertEquals(zweit, erst);
});

Deno.test('hubFetch: löst immer auf (Fehler, NOTICE, Konstruktor wirft, Speicher gesperrt)', async () => {
  let a = aufbau(); let p = a.hubFetch('e', [{}], { relays: ['wss://relay.edufeed.org'] }); await pause();
  a.st.socks[0].onerror(); assertEquals(await p, [], 'Socketfehler');
  a = aufbau(); p = a.hubFetch('f', [{}], { relays: ['wss://relay.edufeed.org'] }); await pause();
  a.st.socks[0].msg(['NOTICE', 'rate limited']); assertEquals(await p, [], 'NOTICE');
  a = aufbau({ ctorWirft: true }); assertEquals(await a.hubFetch('g', [{}]), [], 'Konstruktor wirft');
  const gesperrt = { getItem: () => { throw new Error('gesperrt'); }, setItem: () => { throw new Error('gesperrt'); } };
  a = aufbau({ speicher: gesperrt }); p = a.hubFetch('h', [{}], { relays: ['wss://relay.edufeed.org'] }); await pause();
  a.st.socks[0].eose(); assertEquals((await p).length, 1, 'ohne sessionStorage');
});

Deno.test('speicher: ohne localStorage null beim Lesen, kein Fehler beim Schreiben', () => {
  const wirft = { getItem: () => { throw new Error('gesperrt'); }, setItem: () => { throw new Error('gesperrt'); } };
  const speicher = new Function('localStorage', speicherSrc + '; return speicher;')(wirft);
  assertEquals(speicher('relihub-modus'), null);
  assertEquals(speicher('relihub-modus', 'direkt'), null);   // wirft nicht
});
