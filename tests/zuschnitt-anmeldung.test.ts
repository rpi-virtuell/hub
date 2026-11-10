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
