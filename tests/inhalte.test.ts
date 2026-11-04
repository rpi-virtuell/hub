import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, html } from './helfer.ts';
const s = appScript();
const block = (re: RegExp) => (s.match(re) || [''])[0];
const esc = (t: string) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const sichereUrl = (u: string) => /^https?:\/\//.test(u || '') ? u : '';
const bau = (name: string) => new Function('esc', 'sichereUrl', block(new RegExp(`  function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}`)) + `; return ${name};`)(esc, sichereUrl);

Deno.test('Inhalte aus Events: Schlüssel, Signaturen, Doku', async () => {
  assert(/const FO_NPUB = 'npub1tgftg8kptdrxxg0g3sm3hckuglv3j0uu3way4vylc5qyt0f44m0s3gun6e'/.test(s) && /const FO_HEX = npubToHex\(FO_NPUB\)/.test(s), 'Schaufenster-Schlüssel');
  for (const f of ['tagWert(ev, name)', 'tagWerte(ev, name)', 'mdSeite(src)', 'lizenzLabel(url)', 'lizenzStand(url)', 'ocLaden()', 'beitragUrl(ev)', 'beitragBild(ev)']) assert(s.includes('function ' + f), f);
  assert(/function md\(src\)/.test(s), 'md() für den Editor bleibt');
  const d = await Deno.readTextFile(new URL('../docs/daten.md', import.meta.url));
  assert(/ocLaden/.test(d) && /mdSeite/.test(d) && /lizenzStand/.test(d), 'docs/daten.md');
});

Deno.test('mdSeite: maskiert und filtert', () => {
  const md = bau('mdSeite');
  const out = md('# Titel\n\n<script>alert(1)</script> **fett**\n\n- a\n- b\n\n1. eins\n\n> Zitat\n\n[ok](https://oer.community/x) [böse](javascript:alert(1)) ![Bild](bild.jpg) ![Foto](https://blossom.edufeed.org/a.jpg)');
  assert(out.startsWith('<h2>Titel</h2>'), 'Überschrift eine Stufe tiefer');
  assert(!/<script/.test(out) && /&lt;script&gt;/.test(out), 'HTML maskiert');
  assert(/<b>fett<\/b>/.test(out) && /<ul><li>a<\/li><li>b<\/li><\/ul>/.test(out) && /<ol><li>eins<\/li><\/ol>/.test(out) && /<blockquote>Zitat<\/blockquote>/.test(out), 'Auszeichnung');
  assert(/<a href="https:\/\/oer\.community\/x"[^>]*rel="noopener"/.test(out), 'sicherer Link');
  assert(!/javascript:/.test(out) && /böse/.test(out), 'unsicherer Link wird Text');
  assert(/img-fehlt">Bild: Bild</.test(out) && /<img[^>]*src="https:\/\/blossom\.edufeed\.org\/a\.jpg"/.test(out), 'Bilder');
  assertEquals(md(''), '');
});

Deno.test('lizenzLabel und lizenzStand', () => {
  const label = bau('lizenzLabel'), stand = bau('lizenzStand');
  assertEquals(label('http://creativecommons.org/licenses/by-sa/4.0/legalcode.de'), 'CC BY-SA 4.0');
  assertEquals(label('https://creativecommons.org/licenses/by/4.0/deed.de'), 'CC BY 4.0');
  assertEquals(label('https://creativecommons.org/publicdomain/zero/1.0/'), 'CC0 (Public Domain)');
  assertEquals(label('https://de.wikipedia.org/wiki/Urheberrecht_(Deutschland)'), 'Urheberrechtlich geschützt');
  assertEquals(label('https://example.org/eigene'), 'https://example.org/eigene');
  assertEquals(label(''), '');
  assertEquals(stand('https://creativecommons.org/licenses/by/4.0/'), 'offen');
  assertEquals(stand('https://creativecommons.org/publicdomain/zero/1.0/'), 'offen');
  assertEquals(stand('https://creativecommons.org/licenses/by-nc-sa/4.0/'), 'geschuetzt');
  assertEquals(stand('https://creativecommons.org/licenses/by-nd/4.0/'), 'geschuetzt');
  assertEquals(stand('https://de.wikipedia.org/wiki/Urheberrecht_(Deutschland)'), 'geschuetzt');
  assertEquals(stand(''), 'unbekannt');
  assertEquals(stand('https://example.org/eigene'), 'unbekannt');
});

Deno.test('ocLaden: ein REQ je Relay, Seiten und Beiträge getrennt', () => {
  const oc = block(/function ocLaden\(\)[\s\S]*?\n  \}/);
  assert(/hubFetch\('oercommunity', \[/.test(oc) && (oc.match(/kinds: \[30023\]/g) || []).length === 2 && /kinds: \[30004\]/.test(oc) && /kinds: \[31923\]/.test(oc), 'vier Filter in einem Aufruf');
  assert(/'#l': \['seite'\]/.test(oc) && /authors: \[FO_HEX\]/.test(oc), 'Seiten-Label und Absender');
  assert(/relay-rpi\.edufeed\.org/.test(oc) && /relay\.edufeed\.org/.test(oc) && !/amb-relay/.test(oc), 'Relays des Schaufensters');
  assert(/published_at/.test(oc), 'Beiträge nach published_at');
  assert(!/groups\.edufeed\.org/.test(html));
});
