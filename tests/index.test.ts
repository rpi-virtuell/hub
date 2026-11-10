// Textbasierte Prüfungen über index.html (kein Build, kein DOM): Farbkontraste rechnerisch, Struktur per Regex.
import { assert } from 'jsr:@std/assert@1';
import { html, rootVars, contrast, consoleScript, leisteScript, appScript } from './helfer.ts';

Deno.test('Alle Inline-Skripte sind syntaktisch gültig', () => {
  // Function-Konstruktor parst, ohne auszuführen (kein DOM nötig)
  new Function(consoleScript());
  new Function(leisteScript());
  new Function(appScript());
});

Deno.test('Textfarben je Bereich erreichen 4,5:1 auf paper, card und Tint', () => {
  const v = rootVars();
  for (const b of ['hub', 'finden', 'erstellen', 'koop', 'ver']) {
    for (const bg of [v['paper'], v['card'], v['t-' + b]]) {
      assert(contrast(v['x-' + b], bg) >= 4.5, `${b}: ${v['x-' + b]} auf ${bg} = ${contrast(v['x-' + b], bg).toFixed(2)}`);
    }
  }
});

Deno.test('Weiß bzw. Dunkel auf Bereichsflächen', () => {
  const v = rootVars();
  for (const b of ['hub', 'finden', 'koop', 'ver']) assert(contrast('#FFFFFF', v['c-' + b]) >= 4.5, `${b}: ${contrast('#FFFFFF', v['c-' + b]).toFixed(2)}`);
  assert(contrast('#2B1A00', v['c-erstellen']) >= 4.5, 'erstellen dunkel');
  assert(contrast(v['muted'], v['paper']) >= 4.5, 'muted auf paper');
});

Deno.test('Bereichsfarben nur in :root', () => {
  assert(!/#(203A8F|007A75|FFA500|D6336C|7B4FB8|233E99|008C86|F39200)\b/i.test(appScript()), 'Hex-Wert einer Bereichsfarbe im App-Skript');
  assert(/cssVar\(/.test(appScript()), 'cssVar() fehlt');
});

Deno.test('Konsole liest Custom Properties und behält Fallback', () => {
  assert(consoleScript().includes('--relihub-c-'), '--relihub-c- fehlt');
  assert(/#203A8F/i.test(consoleScript()) && /#007A75/i.test(consoleScript()) && /#FFA500/i.test(consoleScript()) && !/#233E99/i.test(consoleScript()), 'Fallback-Farben sind nicht die beschlossene Palette');
  // Pillen-Beschriftung (Bereichsname auf hellem Grund) nutzt eine Textfarbe, nicht die Flächenfarbe
  assert(consoleScript().includes('--relihub-x-'), '--relihub-x- fehlt');
  assert(/this\.text\(pill,[^;]*f\.ink/.test(consoleScript()), 'Pille nutzt f.ink nicht');
});

Deno.test('Generische Fokusregel vorhanden', () => {
  assert(/button:focus-visible[^{]*\[tabindex\]:focus-visible[^{]*\{[^}]*outline:\s*3px/.test(html), 'Fokusregel fehlt');
});

Deno.test('Schaufenster OER-Community ist verdrahtet', () => {
  const s = appScript();
  assert(html.includes('id="v-oercommunity"'), 'View fehlt');
  assert(/id:\s*'oercommunity',\s*label:\s*'FOERBICO'/.test(s), 'Leisten-Eintrag fehlt');
  assert(/'OER-Community',\s*'Schaufenster des Projekts FOERBICO'/.test(s), 'Partner-Kachel fehlt');
  assert(/id:\s*'oercommunity'[\s\S]*?inst:\s*\['OER-Community',\s*'oercommunity'\]/.test(s), 'CY-Eintrag fehlt');
  assert(/registerContext\('oer-community'/.test(s), 'Kontext fehlt');
  assert(/'oercommunity'/.test(s.match(/function route\(\)[\s\S]*?includes\(view\)/)![0]), 'route kennt den View nicht');
  assert(/Roboto\+Condensed:wght@400/.test(html), 'Roboto Condensed 400 fehlt');
  assert((s.match(/const OC_TEAM[\s\S]*?\n  \];/)![0].match(/\bn:/g) || []).length === 10, 'OC_TEAM hat nicht 10 Personen');
  assert(((s.match(/let OC_RAW = .*/) || [''])[0].match(/"kind":30023/g) || []).length === 6, 'OC_RAW hat nicht 6 Beiträge');
  assert(/const OC_POSTS = OC_RAW\.map\(/.test(s), 'OC_POSTS entsteht nicht aus dem Schnappschuss der Beiträge');
  assert(/onerror=/.test(s.match(/const ocKarte[^\n]*/)![0]), 'kein Bild-Fallback');
});

Deno.test('Teilen in Communities im Beitrags- und Termin-Editor', () => {
  const s = appScript();
  assert(s.includes('Mit Communities teilen (optional)') && s.includes('Communities auswählen'), 'Abschnitt fehlt');
  assert(s.includes('Alle auswählen') && s.includes('Alle abwählen') && s.includes('Nur Mitglieder'), 'Buttons/Sperre fehlen');
  assert((s.match(/communityPicker\(/g) || []).length >= 3, 'communityPicker nicht in beiden Editoren');
  assert(/function shareTo\(/.test(s) && /kind 16/.test(s) && /h-Tag/.test(s), 'shareTo oder Toast-Text fehlt');
  assert(/function isMember\(/.test(s), 'isMember fehlt');
});

Deno.test('Materialien haben die Knospe Beiträge und das Profil ein Artikel-Panel', () => {
  const c = consoleScript(), s = appScript();
  assert(/material\.beitraege/.test(c) && /'\/material\/beitraege'/.test(c + s), 'Knospe oder Route fehlt');
  assert(/id: 'material\.beitraege', label: 'Beiträge'/.test(c) && /'material\.beitraege': \{ t:'Beiträge'/.test(s), 'Beschriftung oder Karte fehlt');
  assert(html.includes('id="artikel"') && html.includes('Artikel aus deinen Communities'), 'Panel fehlt');
  assert(/function renderArtikel\(/.test(s) && s.includes('Folge Communities, um hier Artikel zu sehen.'), 'renderArtikel oder Leerzustand fehlt');
});

Deno.test('Newsletter je Community', () => {
  const s = appScript();
  assert((s.match(/\bnl:\s*\[\[/g) || []).length >= 2, 'weniger als zwei nl-Einträge');
  assert(/function nlBox\(/.test(s) && s.includes('Newsletter der Communities') && s.includes('39701'), 'nlBox fehlt');
  assert(/cy-nl/.test(s) && /Newsletter:/.test(s), 'Kachel-Pille oder Raum-Kopf fehlt');
});

const ADRS = ['0001-farbsystem', '0002-instanzen-als-nachbau', '0003-teilen-in-communities', '0004-newsletter-als-nip-b0', '0005-artikel-im-finden', '0006-live-daten-mit-rueckfall'];
Deno.test('ADRs und README-Abschnitt', async () => {
  const readme = await Deno.readTextFile(new URL('../README.md', import.meta.url));
  assert(readme.includes('## Grundentscheidungen'), 'README-Abschnitt fehlt');
  const alle: string[] = [];
  for (const f of ADRS) {
    const t = await Deno.readTextFile(new URL(`../docs/adr/${f}.md`, import.meta.url));
    for (const h of ['Status', 'Kontext', 'Entscheidung', 'Folgen']) assert(t.includes(`## ${h}`), `${f}: ${h} fehlt`);
    assert(readme.includes(f), `README verlinkt ${f} nicht`);
    alle.push(t);
  }
  assert(!/Arbeitspaket|Meilenstein|Förderkennzeichen|01PO23012/.test(alle.join('\n') + readme), 'Projektdoku-Begriffe in ADRs/README');
});

Deno.test('ADR-0002 verweist auf ADR-0006', async () => {
  const t = await Deno.readTextFile(new URL('../docs/adr/0002-instanzen-als-nachbau.md', import.meta.url));
  assert(/ersetzt durch ADR-0006/.test(t), 'ADR-0002 ohne Ersatzvermerk');
});

Deno.test('Review-Fixes: Picker-Bindung, Escaping, Raum-Kontext, Mitgliedschaft, Platzhalter', () => {
  const s = appScript();
  assert((s.match(/picker\.bind\(\)/g) || []).length >= 2, 'picker.bind() nicht in beiden Editoren');
  assert(/tags:\s*tags\.map\(esc\)/.test(s) && /tags:\s*st\.tags\.map\(esc\)/.test(s), 'Hashtags werden nicht escaped');
  assert(/openBlog\(c\.n,\s*\{\s*room:\s*true\s*\}\)/.test(s) && /opts\.room/.test(s), 'Raum-Kontext nicht explizit');
  assert(/function isMember\(c\)\s*\{[^}]*crMember\[c\.id\]/.test(s), 'isMember liest crMember nicht');
  assert(!/#8A8378/i.test(html), 'Platzhalterfarbe #8A8378 unter 4,5:1');
});
