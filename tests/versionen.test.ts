// Entwurfsvergleich (ADR-0016): fünf Versionen der Navigation, einstellbare Blume, Blütenreihe.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, consoleScript, html, leisteScript } from './helfer.ts';
const c = consoleScript(), l = leisteScript(), s = appScript();

Deno.test('Reiterzeile: fünf Versionen mit eigener Adresse', () => {
  const reiter = [...html.matchAll(/<button type="button" data-v="([a-z]+)" aria-pressed="(true|false)">/g)].map((m) => m[1]);
  assertEquals(reiter, ['heute', 'reinraus', 'light', 'suche', 'links']);
  assert(/<nav class="vz" id="vz" aria-label="Entwurfsvergleich">/.test(html), 'Reiterzeile fehlt oder ist nicht als Entwurfsvergleich benannt');
  assert(/const VERSIONEN = \{\s*heute:[\s\S]*?reinraus:[\s\S]*?light:[\s\S]*?suche:[\s\S]*?links:/.test(s), 'Beschreibung je Version fehlt');
  assert(/new URLSearchParams\(location\.search\)\.get\('v'\) \|\| speicher\('relihub-version'\)/.test(s), 'Version kommt nicht aus der Adresse oder dem Speicher');
  assert(/VERSION = VERSIONEN\[v\] \? v : 'heute'/.test(s), 'unbekannte Version fällt nicht auf den Stand heute zurück');
});

Deno.test('Steuerkonsole: weitere Belegungen, direkte Blätter, dauerhafte Beschriftung', () => {
  assert(/registerBelegung\(name, liste\) \{/.test(c) && /get funcs\(\) \{ return this\.belegung \|\|/.test(c), 'Belegung lässt sich nicht anmelden oder wählen');
  assert(/const a = \(-90 \+ 360 \/ n \* i\) \* Math\.PI \/ 180/.test(c), 'Blätter verteilen sich nicht gleichmäßig');
  assert(/'data-action': f\.aktion \|\| f\.id/.test(c), 'Blatt ohne Knospen führt nicht direkt zur Aktion');
  assert(/if \(this\.hasAttribute\('beschriftet'\)\) this\.funcs\.forEach\(f => this\.wort\(base, f\.label/.test(c), 'Wort steht nicht dauerhaft auf dem Blatt');
  assert(/'belegung', 'beschriftet', 'oben', 'sicht', 'mitte', 'stiel'\]/.test(c), 'neue Attribute werden nicht beobachtet');
  assert(/:host\(\[floating\]\[oben\]\)\{top:/.test(c), 'schwebende Blume lässt sich nicht nach oben setzen');
});

Deno.test('Version 2, rein und raus: vier Dinge, je zwei Wege', () => {
  const b = (s.match(/registerBelegung\('reinraus', \[[\s\S]*?\n  \]\);/) || [''])[0];
  assertEquals([...b.matchAll(/blatt\('rr-([a-z]+)'/g)].map((m) => m[1]), ['menschen', 'material', 'termine', 'news']);
  assertEquals((b.match(/label: 'finden', form: 'suchen'/g) || []).length, 3);
  assertEquals((b.match(/label: 'veröffentlichen', form: 'teilen'/g) || []).length, 3);
  assert(/id: 'menschen\.personen', label: 'Personen'/.test(b) && /id: 'menschen\.communities', label: 'Communities'/.test(b), 'Menschen: Personen und Communities');
  assert(!/farbe: 'ich'/.test(b), 'Sonderfarbe für Eigenes in der Version rein und raus');
  assert(/body\[data-v="reinraus"\] #leiste,body\[data-v="links"\] #leiste\{display:none\}/.test(html), 'Leiste bleibt in Version 2 stehen');
});

Deno.test('Version 3, Light: fünf Blätter mit Verb, direkt, Hilfe unten rechts', () => {
  const hub = (s.match(/hub: \{ name: 'ReliHub', blaetter: \[[\s\S]*?\] \}/) || [''])[0];
  assertEquals([...hub.matchAll(/wort: '([^']+)'/g)].map((m) => m[1]), ['Kontakt aufnehmen', 'Material finden', 'Material teilen', 'Termin eintragen', 'Termine finden']);
  assert(/if \(VERSION !== 'heute'\) return d\.action\.includes\('\.'\) \? standardAktion\(d, 'hub'\) : false;/.test(s), 'Klick führt nicht direkt hin');
  assert(/body:not\(\[data-v="heute"\]\) #stSicht,body:not\(\[data-v="heute"\]\) #explain\{display:none\}/.test(html), 'Umschalter und Erklärkarte bleiben stehen');
  assert(/setze\(k, 'oben', VERSION === 'light' \? '' : null\)/.test(s), 'schwebende Blume sitzt nicht oben');
  assert(/<button type="button" class="v-hilfe" id="hilfeKnopf" aria-expanded="false" aria-controls="hilfeFeld"/.test(html) && /body\[data-v="light"\] \.v-hilfe\{display:grid\}/.test(html), 'Hilfeknopf fehlt');
});

Deno.test('Einstellbare Blume: Community wählt Blätter, Wortlaut und Ziel; Farbe und Platz bleiben', () => {
  const blumen = (s.match(/const BLUMEN = \{[\s\S]*?\n  \};/) || [''])[0];
  const von = (k: string) => [...(blumen.match(new RegExp(k + ": \\{ name: '[^']+', blaetter: \\[[\\s\\S]*?\\] \\}")) || [''])[0].matchAll(/ding: '([a-z]+)', wort: '([^']+)'/g)].map((m) => [m[1], m[2]]);
  assertEquals(von('relilab').map((x) => x[1]), ['Kontakt aufnehmen', 'Material finden', 'Material teilen', 'Termin eintragen', 'Fortbildungen suchen']);
  for (const k of ['hub', 'relilab', 'wissenschaft', 'konfi']) {
    assertEquals(von(k).map((x) => x[0]), ['menschen', 'material', 'material', 'termine', 'termine'], `${k}: Dinge stehen nicht an ihrem festen Platz`);
    assert(von(k).length <= 5, `${k}: mehr als fünf Blätter`);
  }
  assert(/color: D_FARBE\[ding\]\[0\]/.test(s), 'Farbe kommt nicht vom Ding');
  assert(/'ort-' \+ k \+ '-geteilt'/.test(s) && /rkArt === 'geteilt' \? 'scheibe' : 'knospen'/.test(s), 'Spielart mit geteilten Blättern fehlt');
  assert(/<div class="rl-konfig" id="rlKonfig" hidden><\/div>/.test(html) && /<th>Ding<\/th><th>Wortlaut<\/th><th>Ziel<\/th>/.test(s), 'Einstellung wird im relilab nicht gezeigt');
  assert(/if \(d\.action === 'material\.teilen'\) \{ if \(CUR\.split\('\?'\)\[0\] !== 'relilab'\) go\('relilab'\); openChooser\('relilab'\); return false; \}/.test(s), 'Formular verlässt den Ort');
});

Deno.test('Version 4, Suche zuerst: Suchfeld führt ins Ökosystem, Orte als Blütenreihe', () => {
  assert(/if \(VERSION === 'suche'\) \{ sucheStarten\(stFeld\.value\); return; \}/.test(s) && /function sucheStarten\(text\) \{[\s\S]*?go\('oekosystem'\);/.test(s), 'Suche führt nicht ins Ökosystem');
  assert(/setze\(leisteEl, 'form', VERSION === 'suche' \? 'blueten' : null\)/.test(s), 'Blütenreihe wird nicht geschaltet');
  assert(/:host\(\[form="blueten"\]\) a\{[^}]*margin-left:-13px/.test(l) && /:host\(\[form="blueten"\]\) a\.on\{[^}]*z-index:2/.test(l), 'Blätter greifen nicht ineinander oder der aktuelle Ort liegt nicht obenauf');
  assert(/observedAttributes\(\) \{ return \['current', 'label', 'form'\]; \}/.test(l), 'Leiste beobachtet die Form nicht');
  assertEquals((s.match(/kind: 'instanz', color: /g) || []).length, 6, 'nicht jeder Ort der Leiste hat eine Farbe');
});

Deno.test('Version 5, Leiste links, und die drei Sätze der Startseite', () => {
  assert(/<nav class="vl" id="vLinks" aria-label="ReliHub">/.test(html) && /body\[data-v="links"\] \.vl\{display:flex\}/.test(html), 'Navigation links fehlt');
  assert(/body\[data-v="links"\] relihub-steuerkonsole\[floating\],body\[data-v="links"\] \.flower-wrap\{display:none\}/.test(html), 'Blume bleibt in Version 5 Steuerung');
  const drei = (html.match(/<ul class="v-drei" id="vDrei">[\s\S]*?<\/ul>/) || [''])[0];
  assertEquals([...drei.matchAll(/<li><b>([^<]+)<\/b>/g)].map((m) => m[1]), ['Was du hier findest', 'Was du hier tun kannst', 'Warum']);
});

Deno.test('ADR-0016 und README nennen den Entwurfsvergleich', async () => {
  const adr = await Deno.readTextFile(new URL('../docs/adr/0016-entwurfsvergleich-und-einstellbare-blume.md', import.meta.url));
  const readme = await Deno.readTextFile(new URL('../docs/adr/README.md', import.meta.url));
  assert(/## Status\nEntwurf/.test(adr) && /registerBelegung/.test(adr) && /einstellbare Blume/i.test(adr), 'ADR-0016 unvollständig');
  assert(/\[0016\]\(0016-entwurfsvergleich-und-einstellbare-blume\.md\)/.test(readme), 'README nennt ADR-0016 nicht');
});
