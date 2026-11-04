import { assert } from 'jsr:@std/assert@1';
import { html, appScript, consoleScript } from './helfer.ts';
const block = (re: RegExp) => (appScript().match(re) || [''])[0];   // Ausschnitt aus dem Anwendungsskript
const hblock = (re: RegExp) => (html.match(re) || [''])[0];         // Ausschnitt aus dem HTML

Deno.test('Datenschicht: Grenzen und Rückfall', () => {
  const s = appScript();
  assert(/const RELAYS = \[[^\]]*relay\.edufeed\.org[^\]]*relay-rpi\.edufeed\.org[^\]]*amb-relay\.edufeed\.org/.test(s), 'RELAYS');
  assert(!/groups\.edufeed\.org/.test(html), 'groups.edufeed.org darf nie gelesen werden');
  assert(/TIMEOUT_MS = 8000/.test(s) && /MAX_CONN = 3/.test(s) && /RETRY_MS = 60000/.test(s), 'Grenzen');
  const hf = block(/function hubFetch\(name, filters[\s\S]*?\n  \}/);
  assert(/sessionStorage/.test(hf) && /new WebSocket\(/.test(hf) && /'EOSE'/.test(hf) && /resolve\(/.test(hf) && !/reject\(/.test(hf), 'hubFetch löst immer auf');
  assert(/function datenstand\(viewId, zustand, info\)/.test(s) && /function npubToHex\(/.test(s) && /function evToTermin\(/.test(s), 'Signaturen');
  assert((html.match(/<div class="view"/g) || []).length - 1 === (html.match(/class="stand"/g) || []).length, 'jede Ansicht außer Start hat eine Stand-Zeile');
  assert(/schnappschuss:termine \*\/[\s\S]*let RT_RAW = \[[\s\S]*let RT_STAND = '\d\d\.\d\d\.\d{4}'[\s\S]*\/schnappschuss:termine/.test(s), 'Schnappschuss-Block');
  assert(/RT_EV = RT_RAW\.map\(evToTermin\)/.test(s), 'RT_EV aus RT_RAW');
  assert(/hubFetch\('relilab-termine'/.test(block(/function rtOpen[\s\S]*?\n  \}/)), 'relilab-Termine nutzen die Datenschicht');
  assert(/vom Relay · \$\{/.test(block(/function rtOpen[\s\S]*?\n  \}/)), 'Live-Kennzeichnung nennt die Zahl vom Relay');
  assert(!/Arbeitspaket|Meilenstein|Förderkennzeichen|Projektträger|Zwischenbericht/.test(html), 'Projektsprache in index.html');
});

Deno.test('Schnappschuss-Skript und Doku vorhanden', async () => {
  const t = await Deno.readTextFile(new URL('../tools/schnappschuss.ts', import.meta.url));
  assert(/schnappschuss:termine/.test(t) && /31923/.test(t) && !/groups\.edufeed\.org/.test(t));
  assert(t.includes('\\u003c'), 'Skript maskiert < nicht');
  assert(!/<\//.test(appScript().match(/let RT_RAW = .*/)![0]), 'RT_RAW enthält </');
  const d = await Deno.readTextFile(new URL('../docs/daten.md', import.meta.url));
  assert(/hubFetch/.test(d) && /Stand vom/.test(d) && /Nachbau/.test(d));
  const dj = JSON.parse(await Deno.readTextFile(new URL('../deno.json', import.meta.url)));
  assert(dj.tasks.schnappschuss, 'deno task schnappschuss fehlt');
});

Deno.test('Konsole: Aktivieren meldet sich sofort', () => {
  const c = consoleScript(), s = appScript();
  assert(/new CustomEvent\('relihub-activate'/.test(c), 'Ereignis fehlt');
  assert(/onActivate\(/.test(c), 'Profil-Haken onActivate fehlt');
  assert(/relihub-activate/.test((c.match(/\/\*!?[\s\S]*?\*\//) || [''])[0]), 'Doku-Kommentar nennt das Ereignis nicht');
  assert(/registerContext\('hub-start',\s*\{[\s\S]*?onActivate:/.test(s), 'hub-start nutzt onActivate nicht');
  assert(/_touchAct = true/.test(c), 'Touch-Regel verloren');
});

Deno.test('Konsole: ganze Knospe samt Wort ist Trefferfläche', () => {
  const c = consoleScript();
  assert(/\.out\{[^}]*pointer-events:auto[^}]*cursor:pointer/.test(c), '.out nicht klickbar');
  assert(/\.lbl\{[^}]*pointer-events:none/.test(c), '.lbl verändert');
  assert(/const HIT = 44/.test(c) && /el\('circle', \{ class: 'hit', r: HIT, fill: 'transparent' \}, bud\)/.test(c), 'Treffer-Kreis fehlt');
  assert(/\.bud circle:not\(\.hit\)\{transition/.test(c) && /\.bud:hover circle:not\(\.hit\),\.bud\.kbd circle:not\(\.hit\)\{fill/.test(c) && /\.kbd>circle:not\(\.hit\)/.test(c), 'Treffer-Kreis nicht von Füllung/Fokusring ausgenommen');
});
