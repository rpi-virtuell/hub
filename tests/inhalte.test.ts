import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, html, rootVars, contrast } from './helfer.ts';
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
  // Verhalten: leere Antwort wird nicht gehalten, nichtleere schon
  const bauOc = (antworten: unknown[][]) => {
    let n = 0;
    const hubFetch = () => Promise.resolve(antworten[Math.min(n++, antworten.length - 1)]);
    const code = 'let ocDaten = null, ocLauf = null;\n' + block(/  function tagWert\([^)]*\) \{[\s\S]*?\n  \}/) + block(/  function tagWerte\([^)]*\) \{[\s\S]*?\n  \}/) + oc + '; return ocLaden;';
    return { ocLaden: new Function('hubFetch', 'FO_HEX', code)(hubFetch, 'ab'), aufrufe: () => n };
  };
  const leer = bauOc([[], [{ kind: 30023, pubkey: 'ab', created_at: 1, tags: [['d', 'x'], ['l', 'seite']] }]]);
  return leer.ocLaden().then((r1: any) => {
    assertEquals(r1.seiten.size, 0);
    return leer.ocLaden().then((r2: any) => {
      assertEquals(leer.aufrufe(), 2, 'leere Antwort: erneuter Versuch');
      assertEquals(r2.seiten.size, 1);
      return leer.ocLaden().then(() => assertEquals(leer.aufrufe(), 2, 'nichtleere Antwort wird gehalten'));
    });
  });
});

Deno.test('Schaufenster live: Routen, Menü, Abschnitte, Schnappschuss', async () => {
  const route = block(/function route\(\)[\s\S]*?window\.scrollTo/);
  assert(/split\('\/'\)/.test(route) && /ocOpen\(/.test(route), 'Unterroute #oercommunity/<d>');
  const oc = block(/function ocRender\(daten\)[\s\S]*?\n  \}/);
  assert(/navigation/.test(oc) && /#oercommunity\/spielregeln/.test(oc) && /id="oc-termine"/.test(oc) && /FOERBICO_und_rpi-virtuell\/issues/.test(oc), 'Menü, Spielregeln-Eintrag, Termine-Archiv, Logbuch');
  assert(/mdSeite\(/.test(oc) && /beitragBild\(/.test(oc) && /beitragUrl\(/.test(oc), 'Seiten und Beiträge aus Events');
  assert(/OC_TEAM/.test(oc) && /ocInit\(/.test(oc), 'Team bleibt Schnappschuss mit Initialen');
  assert(/noch keine Termine/.test(oc), 'ehrlicher Satz bei leerem Archiv');
  assert(/in Vorbereitung/.test(block(/function ocOpen\(sub\)[\s\S]*?\n  \}/) + block(/function ocSchau\([^)]*\)[\s\S]*?\n  \}/) + oc), 'fehlende Seite');
  assert(/schnappschuss:beitraege \*\/[\s\S]*let OC_RAW = \[[\s\S]*let OC_STAND = '\d\d\.\d\d\.\d{4}'[\s\S]*\/schnappschuss:beitraege/.test(s), 'Schnappschuss-Block Beiträge');
  assert(/const OC_POSTS = OC_RAW\.map\(/.test(s), 'OC_POSTS aus OC_RAW');
  assert(!/<\//.test(s.match(/let OC_RAW = .*/)![0]), 'OC_RAW enthält </');
  const t = await Deno.readTextFile(new URL('../tools/schnappschuss.ts', import.meta.url));
  assert(/schnappschuss:beitraege/.test(t) && /30023/.test(t) && /'seite'/.test(t), 'Skript kennt den zweiten Block');
  const seite = block(/function ocSeite\(ev\)[\s\S]*?\n  \}/);
  assert(seite.includes("'Lizenz: siehe oer.community'") && seite.includes("=== 'CC BY 4.0'") && !seite.includes('/^CC BY \\d/'), 'Lizenzzeile behauptet nichts, was das Event nicht trägt');
  assert((html.match(/<div class="view"/g) || []).length - 1 === (html.match(/class="stand"/g) || []).length, 'Stand-Zeilen vollständig');
});

Deno.test('Spielregeln: vier Seiten mit Vorbereitungs-Rückfall', async () => {
  const sr = block(/const SPIELREGELN = \[[\s\S]*?\n  \];/);
  for (const d of ['spielregeln-qualitaetskriterien', 'spielregeln-metadatenprofil', 'spielregeln-redaktion', 'spielregeln-ablaeufe']) assert(sr.includes(`d: '${d}'`), d);
  assert((sr.match(/heute: 'https:\/\//g) || []).length === 4, 'jede Kachel hat einen Verweis für heute');
  assert(/in Vorbereitung/.test(s) && /oc-vorbereitung/.test(s) && /von 4 Seiten/.test(s), 'Rückfall sichtbar');
  assert(/function spielregelLink\(d\)/.test(s), 'spielregelLink');
  assert(/'spielregeln'/.test(block(/function ocOpen\(sub\)[\s\S]*?\n  \}/)), 'ocOpen kennt den Bereich');
  const bereich = block(/function ocSpielregeln[\s\S]*?\n  \}/);
  for (const k of ['data-oc-tutorial', 'Lesen ›', 'in Vorbereitung']) assert(bereich.includes(k), 'Bereich: ' + k);
  assert(s.includes("setModus('tutorial')"), 'Klick-Handler schaltet den Tutorial-Modus');
  assert((s.match(/#oercommunity\/spielregeln/g) || []).length >= 2, 'Menü mit und ohne Relay-Liste führt zum Bereich');
  const n = await Deno.readTextFile(new URL('../docs/navigation.md', import.meta.url));
  assert(/Spielregeln/.test(n), 'docs/navigation.md');
});

Deno.test('Materialpool live: Karten ohne unsichere Adressen, Zähler, Rückfall', () => {
  const mp = block(/function mpLaden\(\)[\s\S]*?\n  \}/);
  assert(/hubFetch\('materialpool', \[\{ kinds: \[30142\], limit: 200 \}\]/.test(mp), 'ein Filter, alle Relays');
  const m = block(/function mpMaterial\(ev\)[\s\S]*?\n  \}/);
  assert(/sichereUrl\(/.test(m) && /lizenzStand\(/.test(m) && /lizenzLabel\(/.test(m) && /vollstaendig/.test(m), 'Felder');
  const r = block(/function mpRender\(\)[\s\S]*?\n  \}/);
  assert(/#materialpool\?d=/.test(r) && /encodeURIComponent/.test(r) && /Lizenz nicht angegeben/.test(r) && /vollständigen Metadaten/.test(r), 'Karten, Pille, Zähler');
  assert(/MP\.map\(/.test(r) || /MP\.map\(/.test(s), 'Rückfall auf den Schnappschuss');
  assert(/function mpOpen\(qs\)/.test(s) && /mpOpen\(qs\)/.test(block(/function route\(\)[\s\S]*?window\.scrollTo/)), 'route ruft mpOpen');
  assert(/lic-offen/.test(html) && /lic-geschuetzt/.test(html) && /lic-unbekannt/.test(html), 'drei Pillen im CSS');
  const v = rootVars();
  for (const k of ['offen', 'geschuetzt', 'unbekannt']) for (const bg of [v['lic-' + k], v['paper'], v['card']]) {
    assert(contrast(v['lic-' + k + '-x'], bg) >= 4.5, `Pille ${k}: ${v['lic-' + k + '-x']} auf ${bg}`);
  }
});
