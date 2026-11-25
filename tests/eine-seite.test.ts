// Eine Seite (ADR-0017): Suche oben, Umschalter über der Blume, vier Belegungen nach Sicht und Anmeldung, einstellbare Blume der Community (ADR-0016).
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { appScript, consoleScript, html } from './helfer.ts';
const c = consoleScript(), s = appScript();
const beleg = (name: string) => (s.match(new RegExp("registerBelegung\\('" + name + "', \\[[\\s\\S]*?\\n  \\]\\);")) || [''])[0];

Deno.test('Eine Seite: kein Entwurfsvergleich mehr, kein sichtbarer Claim', () => {
  assert(!/id="vz"|id="vLinks"|data-v="/.test(html) && !/\bVERSIONEN\b|versionSetzen|\bVERSION ===/.test(s), 'Reste des Entwurfsvergleichs');
  assert(!/Miteinander Bildung religionsbezogen machen<\/h1>/.test(html) && /\.stage h1\{position:absolute;width:1px;height:1px/.test(html), 'Claim kostet noch Platz');
  const stage = (html.match(/<section class="stage">[\s\S]*?<\/section>/) || [''])[0];
  const pos = ['id="stThemen"', 'id="stSicht"', 'id="startFlower"', 'id="vDrei"'].map((x) => stage.indexOf(x));
  assert(pos.every((p, i) => p > 0 && (i === 0 || p > pos[i - 1])), 'Reihenfolge: Suche, Umschalter, Blume, vier Antworten');
});

Deno.test('Suchschlitz: Beispiele als Platzhalter, beim Tippen geht das Ökosystem auf', () => {
  assert(/<input id="stThemenFeld" type="search"[^>]*placeholder="Advent, Frieden, relilab"/.test(html), 'Platzhalter fehlt');
  assert(/stFeld\.addEventListener\('input', \(\) => \{ clearTimeout\(ozPopT\); ozPopT = setTimeout\(\(\) => ozPopAuf\(stFeld\.value\), 220\); \}\)/.test(s), 'Tippen öffnet das Ökosystem nicht');
  assert(/if \(q\.length < 2\) \{ ozPopZu\(false\); return; \}/.test(s) && /document\.body\.classList\.add\('oz-pop'\);/.test(s), 'ohne Eingabe bleibt das Ökosystem nicht zu');
  assert(/body\.oz-pop #v-start\{display:block\}/.test(html) && /body\.oz-pop #v-oekosystem\{position:fixed;[^}]*top:var\(--oz-top,150px\)/.test(html), 'Ökosystem liegt nicht unter dem Suchschlitz');
  assert(/art: q\.length < 2 \? 'start' : 'treffer'/.test(s) && /Treffer zu „\$\{esc\(ozQ\)\}“/.test(s), 'Treffer erscheinen nicht in jedem Blatt');
  assert(/if \(v !== 'oekosystem' && document\.body\.classList\.contains\('oz-pop'\)\)/.test(s) && /data-oz-zu/.test(html) && /e\.key === 'Escape'/.test(s), 'Schließen fehlt');
});

Deno.test('Umschalter über der Blume: ein Schalter, keine zwei Knöpfe', () => {
  assert(/<button type="button" class="st-schalter" id="stSchalter" role="switch" aria-checked="false"/.test(html), 'Schalter fehlt');
  assertEquals((html.match(/<div class="st-sicht"[\s\S]*?<\/div>/) || [''])[0].match(/<button/g)!.length, 1);
  assert(/setAttribute\('aria-checked', String\(SICHT === 'formen'\)\)/.test(s), 'Schalter zeigt die Sicht nicht');
  assert(/const beleg = 'eins-' \+ \(SICHT === 'formen' \? 'tun' : 'dinge'\) \+ '-' \+ \(LOGGED \? 'ich' : 'gast'\);/.test(s), 'Belegung folgt nicht Sicht und Anmeldung');
});

Deno.test('Von den Dingen her direkt zum Ding, vom Tun her ausdifferenziert; grau ohne Anmeldung; fünftes Blatt Gespräche', () => {
  const d = (s.match(/registerBelegung\('eins-dinge-' \+ wer, \[[\s\S]*?\n    \]\);/) || [''])[0], t = (s.match(/registerBelegung\('eins-tun-' \+ wer, \[[\s\S]*?\n    \]\);/) || [''])[0];
  assertEquals([...d.matchAll(/blatt\('e-[a-z]+', '([^']+)', '([a-z]+)', \{ (aktion|subs)/g)].map((m) => [m[1], m[2], m[3]]), [['Material', 'material', 'aktion'], ['Termine', 'termine', 'aktion'], ['News', 'news', 'aktion'], ['Gespräche', 'gespraeche', 'aktion'], ['Menschen', 'menschen', 'subs']], 'von den Dingen her führt ein Blatt nicht direkt zum Ding');
  assertEquals([...t.matchAll(/(?:tun|blatt)\('t-[a-z]+', '([a-z]+)'/g)].map((m) => m[1]), ['finden', 'teilen', 'erstellen', 'mitreden', 'bearbeiten']);
  assert(/\[false, true\]\.forEach\(an => \{/.test(s) && /!an && NUR_ANGEMELDET\.includes\(id\) \? \{ stand: 'anmelden' \} : null/.test(s), 'ohne Anmeldung sind die Erweiterungen nicht ausgegraut');
  assert(/anmelden: \{ fill: '#C9CED6', text: '#2B2F36' \}/.test(c) && /anmelden: 'anmelden' \}/.test(c), 'graue Knospe sagt nicht, dass die Anmeldung fehlt');
  assert(/function standardAktion\(d, ctx\) \{\n    if \(brauchtAnmeldung\(d\)\) return false;/.test(s), 'graue Knospe führt nicht zuerst zur Anmeldung');
  for (const k of ['gespraeche.oeffentlich', 'gespraeche.communities', 'gespraeche.eigenes']) assert(s.includes(`if (d.action === '${k}')`), 'Ziel fehlt: ' + k);
  assert(/'gespraeche\.chat', 'Chat', \{ stand: 'offen' \}/.test(s) && !/groups\.edufeed\.org/.test(s), 'Chat ist nicht als „bald“ gezeichnet oder liest die Räume');
});

Deno.test('Tun auf der Seite des Dings: Knöpfe im Materialpool, im Kalender und bei den Gesprächen', () => {
  const tun = (s.match(/const TUN = \{[\s\S]*?\n  \};/) || [''])[0];
  assert(/materialpool: \['material'/.test(tun) && /fortbildungen: \['termine'/.test(tun) && /mitmachen: \['news'/.test(tun), 'Seite ohne Tun');
  assert(/'material\.teilen', 'veröffentlichen'/.test(tun) && /'material\.erstellen', 'erstellen'/.test(tun) && /'termine\.erstellen', 'veröffentlichen'/.test(tun), 'Tun fehlt');
  assert(/view\.prepend\(z\)/.test(s) && /const b = e\.target\.closest\('\[data-tun\]'\); if \(b\) standardAktion\(/.test(s), 'Knopf führt nicht in die Standardkette');
});

Deno.test('Farbnavigation: eine Farbe je Inhaltsart aus dem Erscheinungsbild des Instituts', () => {
  assert(/--n-ich:#2A3B8E;--n-material:#85992C;--n-termine:#DAB000;--n-menschen:#AF4112;--n-gespraeche:#DA8D00;--n-news:#7F89BB;/.test(html), 'Farbwerte fehlen');
  assert(/material: \['#85992C', '#1B2400'\], termine: \['#DAB000', '#2B1A00'\], news: \['#7F89BB', '#141A33'\], gespraeche: \['#DA8D00', '#2B1A00'\]/.test(c), 'Blume trägt die Farben nicht');
  assert(/\[data-typ="material"\]\{--tc:var\(--n-material\)/.test(html) && /\[data-typ="event"\]\{--tc:var\(--n-termine\)/.test(html) && /\[data-typ="person"\]\{--tc:var\(--n-menschen\)/.test(html), 'Ökosystem trägt andere Farben als die Blume');
  assert(/vHinweis\.style\.setProperty\('--hc', blattFarbe\(e\.detail\.action\)\)/.test(s) && /@media \(min-width:1100px\)\{\.v-hinweis\{position:absolute;left:calc\(50% \+ 268px\)/.test(html), 'Erläuterung steht nicht neben dem Blatt in dessen Farbe');
});

Deno.test('Blüten am linken Rand ersetzen Leiste und kleine Blume', () => {
  assert(/<nav class="sb" id="sb" aria-label="ReliHub-Navigation">/.test(html) && /#leiste,relihub-steuerkonsole\[floating\]\{display:none!important\}/.test(html), 'Blüten fehlen oder Leiste und kleine Blume stehen noch');
  assertEquals((html.match(/<button type="button" class="sb-griff"[\s\S]*?<\/button>/) || [''])[0].match(/<i /g)!.length, 6);
  assert(/const ORT_ART = \{ materialpool: 'Ort', 'rpi-virtuell': 'Ort', relilab: 'Community', relidesk: 'Werkzeug', oercommunity: 'Projekt' \};/.test(s), 'Ort, Community, Werkzeug und Projekt sind nicht unterschieden');
  assert(/if \(ort === 'relilab'\) rlAktion\(d\); else if \(ort === 'religlobal'\) rgAktion\(d\); else standardAktion\(d, 'hub'\);/.test(s), 'in einer Community führen die Blüten nicht an ihren Ort');
  assert(/ReliHub · Start<\/a>/.test(s) && /e\.key === 'Escape' && sbEl\.classList\.contains\('auf'\)/.test(s), 'Weg zum Start oder Schließen fehlt');
});

Deno.test('reliGLOBAL als zweites Beispiel neben relilab', () => {
  const b = (s.match(/religlobal: \{ name: 'reliGLOBAL', blaetter: \[[\s\S]*?\] \}/) || [''])[0];
  assertEquals([...b.matchAll(/ding: '([a-z]+)'/g)].map((m) => m[1]), ['menschen', 'material', 'material', 'termine', 'termine']);
  assert(/Werkstätten finden/.test(b) && /wahl\('data-rk-bsp', 'religlobal', rkBsp, 'reliGLOBAL'\)/.test(s), 'Beispiel fehlt in der Auswahl');
  for (const z of ["go('community?c=religlobal&zu=katalog')", "go('community?c=religlobal&tab=kal')", "go('community?c=religlobal&tab=mem')"]) assert(s.includes(z), 'Ziel fehlt: ' + z);
});

Deno.test('In Entwicklung liegt über Ansichten ohne eigene Entwicklung; Flowi sitzt unten rechts', () => {
  assert(/const IN_ENTW = \['materialpool', 'sammlung', 'relidesk', 'rpi-virtuell', 'eigene-instanz'\];/.test(s) && /<div class="entw-wort" aria-hidden="true">IN ENTWICKLUNG<\/div>/.test(html) && /class="entw-band" role="status"/.test(html), 'Hinweis fehlt');
  assert(/\.entw-wort\{[^}]*pointer-events:none/.test(html), 'Schriftzug fängt Klicks ab');
  assert(/<div class="fl" id="flowi">/.test(html) && /\.fl\{position:fixed;right:16px;bottom:16px/.test(html) && /Entwurf · feste Antworten/.test(html), 'Flowi fehlt oder sagt nicht, dass er ein Entwurf ist');
  assert(/const FLOWI = \[/.test(s) && !/fetch\([^)]*flowi/i.test(s), 'Flowi sendet etwas');
});

Deno.test('Mitte: ReliHub mit „anmelden“, angemeldet „Mein ReliHub“', () => {
  assert(/'ohne-mitte', 'mitte-unter', 'mitte-knopf', 'sicht', 'mitte', 'stiel'\]/.test(c), 'Attribut mitte-knopf wird nicht beobachtet');
  assert(/if \(unter \|\| this\.hasAttribute\('mitte-knopf'\)\) \{/.test(c) && /mitte\.addEventListener\('click', e => \{ e\.stopPropagation\(\); this\.fire\('ich'\); \}\)/.test(c), 'Mitte ist kein Knopf');
  assert(/setze\(k, 'mitte', LOGGED \? 'Mein ReliHub' : null\)/.test(s) && /setze\(k, 'mitte-unter', LOGGED \? \(start \? null : 'mein Profil'\) : 'anmelden'\)/.test(s), 'Mitte zeigt den Stand der Anmeldung nicht');
  assert(/if \(d\.action === 'ich'\) \{ if \(!LOGGED\) anDialogAuf\(\); else go\('profil'\); return false; \}/.test(s) && /kopfzeilen\(\); mitteStand\(\);/.test(s), 'Mitte führt nicht zur Anmeldung oder zum Profil');
  assert(/if \(LOGGED \|\| !NUR_ANGEMELDET\.includes\(d\.action\)\) return false;/.test(s), 'Teilen und Eintragen gehen ohne Anmeldung');
});

Deno.test('Steuerkonsole: Belegungen, direkte Blätter, dauerhafte Beschriftung', () => {
  assert(/registerBelegung\(name, liste\) \{/.test(c) && /get funcs\(\) \{ return this\.belegung \|\|/.test(c), 'Belegung lässt sich nicht anmelden oder wählen');
  assert(/const a = \(-90 \+ 360 \/ n \* i\) \* Math\.PI \/ 180/.test(c), 'Blätter verteilen sich nicht gleichmäßig');
  assert(/'data-action': f\.aktion \|\| f\.id/.test(c), 'Blatt ohne Knospen führt nicht direkt zur Aktion');
  assert(/if \(this\.hasAttribute\('beschriftet'\)\) this\.funcs\.forEach\(f => this\.wort\(base, f\.label/.test(c), 'Wort steht nicht dauerhaft auf dem Blatt');
});

Deno.test('relilab: gefilterte Ansichten mit Hinweis und Unternavigation, das Formular bleibt am Ort', () => {
  const rx = (s.match(/const RX_SUB = \[.*?\];\n/) || [''])[0];
  assertEquals([...rx.matchAll(/\['([a-z]+)', '([A-Za-z]+)', '#relilab\?[^']*von=konsole'\]/g)].map((m) => m[2]), ['Termine', 'Material', 'News', 'Personen', 'Communities']);
  for (const ziel of ["go('relilab?zu=materialien&von=konsole')", "go('relilab?room=relilab&rtab=art&von=konsole')", "go('relilab?tab=communities&von=konsole')", "go('relilab?zu=menschen&von=konsole')", "go('relilab?tab=termine&von=konsole')"]) assert(s.includes(ziel), 'Ziel fehlt: ' + ziel);
  assert(/rx\.hidden = !wk;/.test(s) && /<nav class="rx-sub" id="rxSub" aria-label="relilab-Unterseiten" hidden><\/nav>/.test(html), 'Unternavigation fehlt');
  assert(/gefiltert auf <b>relilab<\/b>/.test(s), 'Hinweis auf den Filter fehlt');
  assert(/if \(d\.action === 'material\.teilen'\) \{ if \(CUR\.split\('\?'\)\[0\] !== 'relilab'\) go\('relilab'\); openChooser\('relilab'\); return false; \}/.test(s), 'Formular verlässt den Ort');
});

Deno.test('Einstellbare Blume: Community wählt Blätter, Wortlaut und Ziel; Farbe und Platz bleiben', () => {
  const blumen = (s.match(/const BLUMEN = \{[\s\S]*?\n  \};/) || [''])[0];
  const von = (k: string) => [...(blumen.match(new RegExp(k + ": \\{ name: '[^']+', blaetter: \\[[\\s\\S]*?\\] \\}")) || [''])[0].matchAll(/ding: '([a-z]+)', wort: '([^']+)'/g)].map((m) => [m[1], m[2]]);
  assertEquals(von('relilab').map((x) => x[1]), ['Kontakt aufnehmen', 'Material finden', 'Material teilen', 'Termin eintragen', 'Fortbildungen suchen']);
  for (const k of ['relilab', 'wissenschaft', 'konfi']) {
    assertEquals(von(k).map((x) => x[0]), ['menschen', 'material', 'material', 'termine', 'termine'], `${k}: Dinge stehen nicht an ihrem festen Platz`);
  }
  assert(/color: D_FARBE\[ding\]\[0\]/.test(s), 'Farbe kommt nicht vom Ding');
  assert(/'ort-' \+ k \+ '-geteilt'/.test(s) && /rkArt === 'geteilt' \? 'scheibe' : 'knospen'/.test(s), 'Spielart mit geteilten Blättern fehlt');
  assert(/<div class="rl-konfig" id="rlKonfig" hidden><\/div>/.test(html) && /<th>Ding<\/th><th>Wortlaut<\/th><th>Ziel<\/th>/.test(s), 'Einstellung wird im relilab nicht gezeigt');
  assert(/entscheidet ihre Redaktion/.test(s) && /Wer nicht dazugehört, teilt in den Materialpool von rpi-virtuell/.test(s), 'Hinweis zur Redaktion der Community fehlt');
});

Deno.test('Vier Antworten der Startseite stehen unter der Blume', () => {
  const drei = (html.match(/<ul class="v-drei" id="vDrei">[\s\S]*?<\/ul>/) || [''])[0];
  assert(/an deine Lerngruppe anpassen/.test(drei), 'Warum spricht Lehrkräfte nicht an');
  assertEquals([...drei.matchAll(/<li><b>([^<]+)<\/b>/g)].map((m) => m[1]), ['Was du hier findest', 'Was du hier tun kannst', 'Warum offen', 'Was wir dir bieten']);
});

Deno.test('ADR-0017 und README nennen die eine Seite', async () => {
  const adr = await Deno.readTextFile(new URL('../docs/adr/0017-eine-seite-suche-umschalter-blume.md', import.meta.url));
  const alt = await Deno.readTextFile(new URL('../docs/adr/0016-entwurfsvergleich-und-einstellbare-blume.md', import.meta.url));
  const readme = await Deno.readTextFile(new URL('../docs/adr/README.md', import.meta.url));
  assert(/## Status\nEntwurf/.test(adr) && /Suchschlitz/.test(adr) && /Mein ReliHub/.test(adr), 'ADR-0017 unvollständig');
  assert(/ADR-0017/.test(alt), 'ADR-0016 verweist nicht auf die Nachfolge');
  assert(/\[0017\]\(0017-eine-seite-suche-umschalter-blume\.md\)/.test(readme) && /\[0016\]\(0016-entwurfsvergleich-und-einstellbare-blume\.md\)/.test(readme), 'README nennt ADR-0016 oder ADR-0017 nicht');
});
