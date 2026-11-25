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
  assertEquals([...d.matchAll(/blatt\('e-[a-z]+', '([^']+)', '([a-z]+)', \{ (aktion|subs)/g)].map((m) => [m[1], m[2], m[3]]), [['Material', 'material', 'aktion'], ['Termine', 'termine', 'aktion'], ['News', 'news', 'aktion'], ['Aktivitäten', 'gespraeche', 'aktion'], ['Menschen', 'menschen', 'subs']], 'von den Dingen her führt ein Blatt nicht direkt zum Ding');
  assertEquals([...t.matchAll(/(?:tun|blatt)\('t-[a-z]+', '([a-z]+)'/g)].map((m) => m[1]), ['finden', 'teilen', 'erstellen', 'mitreden', 'bearbeiten']);
  assert(/\[false, true\]\.forEach\(an => \{/.test(s) && /!an && NUR_ANGEMELDET\.includes\(id\) \? \{ stand: 'anmelden' \} : null/.test(s), 'ohne Anmeldung sind die Erweiterungen nicht ausgegraut');
  assert(/anmelden: \{ fill: '#C9CED6', text: '#2B2F36' \}/.test(c) && /anmelden: 'anmelden' \}/.test(c), 'graue Knospe sagt nicht, dass die Anmeldung fehlt');
  assert(/function standardAktion\(d, ctx\) \{\n    if \(brauchtAnmeldung\(d\)\) return false;/.test(s), 'graue Knospe führt nicht zuerst zur Anmeldung');
  for (const k of ['gespraeche.oeffentlich', 'gespraeche.communities', 'gespraeche.eigenes']) assert(s.includes(`if (d.action === '${k}')`), 'Ziel fehlt: ' + k);
  assert(/'gespraeche\.chat', 'Chat', \{ stand: 'offen' \}/.test(s) && !/groups\.edufeed\.org/.test(s), 'Chat ist nicht als „bald“ gezeichnet oder liest die Räume');
});

Deno.test('Tun auf der Seite des Dings: Knöpfe im Materialpool, im Kalender und bei den Gesprächen', () => {
  const tun = (s.match(/const TUN = \{[\s\S]*?\n  \};/) || [''])[0];
  assert(/materialpool: \['material'/.test(tun) && /fortbildungen: \['termine'/.test(tun) && /mitmachen: \['gespraeche'/.test(tun), 'Seite ohne Tun');
  assert(/'material\.teilen', 'veröffentlichen'/.test(tun) && /'material\.erstellen', 'erstellen'/.test(tun) && /'termine\.erstellen', 'veröffentlichen'/.test(tun), 'Tun fehlt');
  assert(/view\.prepend\(z\)/.test(s) && /const b = e\.target\.closest\('\[data-tun\]'\); if \(b\) standardAktion\(/.test(s), 'Knopf führt nicht in die Standardkette');
});

Deno.test('Farbnavigation: eine Farbe je Inhaltsart aus dem Erscheinungsbild des Instituts', () => {
  assert(/--n-ich:#2A3B8E;--n-material:#85992C;--n-termine:#DAB000;--n-menschen:#AF4112;--n-gespraeche:#B549F0;--n-news:#F1693E;/.test(html), 'Farbwerte fehlen');
  assert(/material: \['#85992C', '#1B2400'\], termine: \['#DAB000', '#2B1A00'\], news: \['#F1693E', '#2B1000'\], gespraeche: \['#B549F0', '#1B0A2A'\]/.test(c), 'Blume trägt die Farben nicht');
  assert(/\[data-typ="material"\]\{--tc:var\(--n-material\)/.test(html) && /\[data-typ="event"\]\{--tc:var\(--n-termine\)/.test(html) && /\[data-typ="person"\]\{--tc:var\(--n-menschen\)/.test(html), 'Ökosystem trägt andere Farben als die Blume');
  assert(/vInfo\.style\.setProperty\('--hc', blattFarbe\(e\.detail\.action\)\)/.test(s) && /@media \(min-width:1100px\)\{\.v-info\{position:absolute;left:calc\(50% \+ 268px\)/.test(html), 'Erläuterung steht nicht neben dem Blatt in dessen Farbe');
});

Deno.test('Vorschau um die Erläuterung: echte Einträge als Kreise mit Ring in der Farbe des Dings', () => {
  assert(/const VOR_TYP = \{ material: 'material', termine: 'event', menschen: 'person', communities: 'community' \};/.test(s) && /stVorschau\(VOR_TYP\[k\], 24\)/.test(s) && /gesehen\.has\(n\)/.test(s) && /stLaden\(\);/.test(s), 'Vorschau nutzt nicht die echten Einträge des Gefüges');
  assert(/OC_RAW\.filter\(e => e\.kind === 30023/.test(s), 'News ohne Vorschau');
  assert(/\.vk-ring\{[^}]*border-radius:50%[^}]*background:linear-gradient\([^;]*var\(--hc\)/.test(html) && /onerror="this\.remove\(\)"/.test(s), 'Kreis ohne Ring in der Farbe des Dings oder ohne Rückfall bei fehlendem Bild');
  assert(/<div class="vk-reihe" id="vVor"><\/div>/.test(html), 'Platz für die Vorschau fehlt');
});

Deno.test('Blüten am linken Rand ersetzen Leiste und kleine Blume', () => {
  assert(/<nav class="sb" id="sb" aria-label="ReliHub-Navigation">/.test(html) && /#leiste,relihub-steuerkonsole\[floating\]\{display:none!important\}/.test(html), 'Blüten fehlen oder Leiste und kleine Blume stehen noch');
  assertEquals((html.match(/<button type="button" class="sb-griff"[\s\S]*?<\/button>/) || [''])[0].match(/<i /g)!.length, 6);
  assert(/const ORT_ART = \{ materialpool: 'Ort', 'rpi-virtuell': 'Ort', relilab: 'Community · Labor', relidesk: 'Werkzeug', oercommunity: 'Projekt' \};/.test(s), 'Ort, Community, Werkzeug und Projekt sind nicht unterschieden');
  assert(/if \(ort === 'relilab'\) rlAktion\(d\); else if \(ort === 'raum'\) rgAktion\(d\); else standardAktion\(d, 'hub'\);/.test(s), 'in einer Community führen die Blüten nicht an ihren Ort');
  assert(/ReliHub · Start<\/a>/.test(s) && /e\.key === 'Escape' && sbEl\.classList\.contains\('auf'\)/.test(s), 'Weg zum Start oder Schließen fehlt');
});

Deno.test('Orte tragen keine Inhaltsfarbe: Art in Worten, Beiträge als Punkte; Wendekarten ohne durchscheinendes Logo', () => {
  assert(/'relilab': \[\['Community', 'Labor'\], \['termine', 'material', 'menschen'\]\]/.test(s), 'ein Ort kann nicht mehreres zugleich sein');
  assert(/<span class="art">\$\{ORT_INFO\[n\]\[0\]\.join\(' · '\)\}<\/span>/.test(s) && /<i style="--c:var\(--n-\$\{x\}\)"><\/i>/.test(s), 'Art oder Beiträge fehlen auf der Kachel');
  assert(!/class="cc\$\{logo \? ' cc-logo' : ''\}" style="background/.test(s), 'Kreis des Orts trägt noch eine Bereichsfarbe');
  assert(/\.cy-f \*,\.cy-av::before,\.cy-av::after\{backface-visibility:hidden/.test(html), 'Logo scheint durch die gedrehte Karte');
});

Deno.test('Anmelden ohne Fachwörter; Wege vom Tun her als Blau-Treppe; Randblüten führen zur Seite', () => {
  const d = (html.match(/<dialog class="an-dialog" id="anmelden"[\s\S]*?<\/dialog>/) || [''])[0], vor = d.split('<details')[0];
  assert(!/Nostr|npub|NIP-07|nos2x|Alby|Schlüssel/.test(vor), 'Fachwörter stehen vor dem Aufklappen');
  assert(/Ich habe schon ein Konto/.test(vor) && /Ich bin neu hier/.test(vor) && /Konto anlegen/.test(vor) && /data-an-schluessel/.test(vor), 'zwei Wege fehlen');
  assert(/<summary>Wie funktioniert das genau\?<\/summary>/.test(d) && /id="anNpub"/.test(d.split('<details')[1] || ''), 'Einzelheiten und Nur-Ansehen sind nicht mehr erreichbar');
  assert(/color: '#1F2F7A'/.test(c) && /color: '#2F74C0'/.test(c) && /color: '#63AEDD'/.test(c) && /color: '#B5D3EE'/.test(c) && /const FORM_T = \{ anlegen: '#10233A', bearbeiten: '#10233A' \}/.test(s), 'Wege sind nicht gestaffelt');
  assert(/function aktionVon\(action, label\) \{ let url = 'https:\/\/relihub\.example\/'; try \{ url = RelihubSteuerkonsole\.resolve\(action, 'hub-start'\)/.test(s) && !/url: '#' \}/.test(s), 'Randblüte ohne gültige Adresse');
});

Deno.test('Aktivitäten: ein Name, eine Liste; Zusagen nur auf Wunsch, Gefolgte nach Anmeldung', () => {
  assert(/<h1>Aktivitäten<\/h1>/.test(s) && /<section class="pk-eins" aria-label="Aktivitäten">\$\{gespr\}\$\{prot\}<\/section>/.test(s), 'Ansicht ist nicht eine Liste unter einem Namen');
  assert(!/<h2>Protokoll<\/h2>|<h2>Feed<\/h2>|Was sonst passiert|<h1>Mitmachen<\/h1>|<h1>Gespräche<\/h1>/.test(s), 'alte Namen oder Zwischenüberschriften stehen noch');
  assert(/blatt\('e-gespraeche', 'Aktivitäten', 'gespraeche'/.test(s) && /b\('gespraeche\.oeffentlich', 'Aktivitäten', 'gespraeche'\)/.test(s), 'Blatt und Randblüte heißen anders als die Seite');
  assert(/const rest = liste\.filter\(e => e\.ev\.kind !== 1111 && e\.ev\.kind !== 1\);/.test(s), 'Kommentare stehen doppelt');
  assert(/pkMitLeisem \? alle : alle\.filter\(e => e\.ev\.kind !== 31925 && e\.ev\.kind !== 7\)/.test(s), 'Zusagen und Reaktionen stehen ungefragt in der Liste');
  assert(/new Set\(tagWerte\(ichDaten\.kontakte, 'p'\)\)/.test(s) && /!pkNurFolge \|\| folge\.has\(e\.ev\.pubkey\)/.test(s) && /w\.dataset\.pkwer === 'folge' && !LOGGED\) \{ anDialogAuf\(\);/.test(s), 'Eingrenzen auf Gefolgte fehlt oder geht ohne Anmeldung');
  assert(!/Schreiben mit Schlüssel in der edufeed-App/.test(s) && /const kopf = view\.querySelector\(':scope > header'\); if \(kopf\) kopf\.after\(z\)/.test(s), 'Fachwort im Vorspann oder Knopfzeile über dem Kopf');
});

Deno.test('News: längere Beiträge als Kacheln mit Bild und Auszug, lesbar im Hub; Aktivitäten sind etwas anderes', () => {
  assert(/<div class="view" id="v-news"/.test(html) && /'news\.finden': 'news',/.test(s) && /if \(v === 'news'\) nwOpen\(qs\);/.test(s), 'News führen nicht auf eine eigene Ansicht');
  assert(/class="nw-karte"/.test(s) && /class="nw-bild"/.test(s) && /tagWert\(ev, 'summary'\)/.test(s) && /\.nw-raster\{display:grid/.test(html), 'Kachel ohne Bild, Auszug oder Raster');
  assert(/ocDaten\.beitraege/.test(s) && /e\.ev\.kind === 30023/.test(s) && /tagWerte\(ev, 'l'\)\.includes\('seite'\)\) return;/.test(s), 'Quellen: nur längere Beiträge, keine Seiten');
  assert(/'#news\?b=' \+ encodeURIComponent\(ev\.pubkey \+ ':' \+ tagWert\(ev, 'd'\)\)/.test(s) && /mdSeite\(x\.ev\.content\)/.test(s), 'Beitrag öffnet sich nicht im Hub');
  assert(/news: \['news', 'News', \[\['news\.veroeffentlichen', 'Beitrag schreiben'\]\]\]/.test(s), 'Tun auf der Seite fehlt');
});

Deno.test('Beispielprofil: ohne Anmeldung ein echtes Profil mit Einwilligung, im Code nur der öffentliche Schlüssel', () => {
  assert(/const BEISPIEL_NPUB = 'npub1[0-9a-z]{58}';/.test(s) && /if \(CUR\.split\('\?'\)\[0\] === 'profil' && !LOGGED\) CUR = 'person\?p=' \+ BEISPIEL_NPUB \+ '&beispiel=1';/.test(s), 'ohne Anmeldung zeigt Mein Profil noch die erfundene Person');
  const b = (html.match(/<section class="bsp" id="prBeispiel" hidden>[\s\S]*?<\/section>/) || [''])[0];
  assert(/mit Einwilligung der Person/.test(b) && /data-anmelden/.test(b) && /Konto anlegen/.test(b), 'Hinweis auf Einwilligung oder Wege zum eigenen Profil fehlen');
  assert(/document\.getElementById\('prBeispiel'\)\.hidden = !\(v === 'person' && new URLSearchParams\(qs \|\| ''\)\.get\('beispiel'\)\);/.test(s), 'Hinweis steht auch an anderen Profilen');
  assert(/data-an-beispiel/.test(html), 'Anmeldedialog führt nicht zum Beispielprofil');
});

Deno.test('Personenseite: Über mit Bereich, Fächern, Interessen und Orten, alle Communities; Kopf mit ReliHub links', () => {
  assert(/kinds: \[0, 10015\], authors: \[hex\]/.test(s) && /c0\.edufeed/.test(s) && /ef\.educationalLevels/.test(s) && /ef\.subjects/.test(s) && /ef\.locations/.test(s), 'Angaben aus dem Profil werden nicht gelesen');
  assert(/zeile\('Bildungsbereich', m\.bereiche/.test(s) && /zeile\('Fächer', m\.faecher/.test(s) && /zeile\('Interessen', m\.interessen/.test(s) && /zeile\('Orte', m\.orte/.test(s), 'Über zeigt die Angaben nicht');
  assert(/<h2>Communities<\/h2>/.test(s) && /hubFetch\('person:communities:' \+ hex/.test(s), 'Communities der Person fehlen oder bleiben ohne Namen');
  const kopf = (html.match(/<div class="view" id="v-person"[\s\S]*?<\/header>/) || [''])[0];
  assert(/class="hub-top"/.test(kopf) && /<a class="brand" href="#start">/.test(kopf) && !/mp-head/.test(kopf), 'Kopfzeile der Personenseite bricht mit dem Hub');
  const start = (html.match(/<div class="view" id="v-start">[\s\S]*?<\/header>/) || [''])[0];
  assert(/<a href="#profil">Mein Profil<\/a>\s*<a class="btn btn-profil" href="#profil">Anmelden<\/a>/.test(start) && !/#oekosystem/.test(start), 'Startseite: Mein Profil fehlt oder Ökosystem steht noch im Menü');
});

Deno.test('Material und Termine: Hub-Seiten mit allem aus dem Ökosystem, Kopf des Hubs, „Termine“ statt „Fortbildungen“', () => {
  assert(/<div class="view" id="v-material"/.test(html) && /'material\.finden': 'material',/.test(s) && /if \(v === 'material'\) mtOpen\(qs\);/.test(s), 'Material führt nicht auf die Hub-Seite');
  assert(/e\.typ === 'material' && e\.ev && e\.ev\.kind === 30142 && ozSichtbar\(e\)/.test(s) && /data-mt-mehr/.test(s), 'Material zeigt nicht alles aus dem Gefüge');
  assert(/mpLaden\(\)\.then\(ms => \{ if \(lauf !== mtStart \|\| mtVoll \|\| !ms\.length\) return; mtSetzen\(ms, false\); mtRender\(\); \}/.test(s), 'Material wartet auf das ganze Gefüge, statt erst die schnelle Abfrage zu zeigen');
  const k = (s.match(/function mtKarte\(m\) \{[\s\S]*?\n  \}/) || [''])[0];
  assert(/class="mt-bild"/.test(k) && /mtBild\(m\.bild\)/.test(k) && /class="stufe"/.test(k) && /m\.art/.test(k) && /m\.fach/.test(k), 'Karte ohne Vorschaubild oder ohne Bildungsstufe');
  assert(/class="mt-lic lic-\$\{m\.stand\} amp-\$\{m\.ampel\}/.test(k) && /cc \? CC_ZEICHEN : ''/.test(k) && /\.mt-lic\{position:absolute/.test(html), 'Lizenzpille liegt nicht auf dem Bild oder trägt kein CC-Zeichen');
  assert(/<b>Materialfeed<\/b>/.test(html) && /Materialpool mit Redaktion und Filtern nach Alter und Thema ist noch in Entwicklung/.test(html), 'Seite sagt nicht, dass sie ein Feed ist und der Pool noch aussteht');
  assert(/#v-fortbildungen\{--c-finden:var\(--n-termine\)/.test(html), 'Terminseite trägt noch Grün');
  for (const v of ['v-material', 'v-fortbildungen', 'v-personen', 'v-person', 'v-news']) {
    const kopf = (html.match(new RegExp('<div class="view" id="' + v + '"[\\s\\S]*?</header>')) || [''])[0];
    assert(/class="hub-top"/.test(kopf) && /<a class="brand" href="#start">/.test(kopf), v + ': Kopf ohne ReliHub links');
  }
  const termine = (html.match(/<div class="view" id="v-fortbildungen"[\s\S]*?<\/main>/) || [''])[0];
  assert(/<h1>Termine<\/h1>/.test(termine) && !/Fortbildungskalender|<h1>Fortbildungen<\/h1>/.test(termine) && /fortbildungen: 'ReliHub · Termine'/.test(s), 'Terminseite heißt noch Fortbildungen');
});

Deno.test('OER-Ampel an den Lizenzpillen; Termine ohne „nostr:“', () => {
  const f = (s.match(/function lizenzAmpel\(url\) \{[\s\S]*?\n  \}/) || [''])[0];
  const ampel = new Function(f + '; return lizenzAmpel;')();
  assertEquals(['https://creativecommons.org/publicdomain/zero/1.0/', 'https://creativecommons.org/licenses/by/4.0/', 'https://creativecommons.org/licenses/by-sa/4.0/'].map(ampel), ['gruen', 'gruen', 'gruen']);
  assertEquals(['https://creativecommons.org/licenses/by-nc/4.0/', 'https://creativecommons.org/licenses/by-nd/4.0/', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'https://creativecommons.org/licenses/by-nc-nd/4.0/'].map(ampel), ['orange', 'orange', 'orange', 'orange']);
  assertEquals(['https://de.wikipedia.org/wiki/Urheberrecht', '', 'https://example.org/lizenz'].map(ampel), ['rot', '', '']);
  assert(/\.amp-gruen\{background:#1F6B2B!important/.test(html) && /\.amp-orange\{/.test(html) && /\.amp-rot\{background:#B3261E!important/.test(html), 'Farben der Ampel fehlen');
  assertEquals((s.match(/class="lic lic-\$\{m\.stand\} amp-\$\{m\.ampel\}"/g) || []).length, 5, 'nicht jede Lizenzpille trägt die Ampel');
  assert(!/>nostr:<\/button><\/div><\/div><\/article>/.test(s) && !/data-kan="\$\{i\}"/.test(s), 'Terminliste zeigt noch den Knopf nostr:');
});

Deno.test('reliGLOBAL als zweites Beispiel neben relilab', () => {
  const b = (s.match(/religlobal: \{ name: 'reliGLOBAL', blaetter: \[[\s\S]*?\] \}/) || [''])[0];
  assertEquals([...b.matchAll(/ding: '([a-z]+)'/g)].map((m) => m[1]), ['menschen', 'material', 'material', 'termine', 'termine']);
  assert(/Werkstätten finden/.test(b) && /wahl\('data-rk-bsp', 'religlobal', rkBsp, 'reliGLOBAL'\)/.test(s), 'Beispiel fehlt in der Auswahl');
  const rg = (s.match(/function rgAktion\(d\) \{[\s\S]*?\n  \}/) || [''])[0];
  for (const z of ["if (d.action === 'material.finden') return zu('katalog');", "if (d.action === 'termine.finden') return zu('kal');", "if (d.action === 'menschen.personen') return zu('mem');", "if (d.action === 'news.finden') return zu('art');", "if (d.action === 'gespraeche.oeffentlich') return zu('chat');"]) assert(rg.includes(z), 'Ziel fehlt: ' + z);
  assert(/\.cr \.cr-side\{display:none\}/.test(html) && /b\('raum\.home', 'Übersicht', 'ich'\)/.test(s) && /BLUMEN\[crId\] \? BLUMEN\[crId\]\.blaetter : BLUETEN_STANDARD/.test(s), 'Raum hat noch eine zweite linke Leiste oder die Blüten tragen seine Wege nicht');
  assert(/#rlBlume,\.rl-hubband\{display:none!important\}/.test(html) && /const an = false, box = document\.getElementById\('rlKonfig'\)/.test(s) && /BLUMEN\[rkBsp\]\.blaetter/.test(s), 'relilab zeigt noch Blume oder Kasten in der Mitte');
  assert(/frieden: \{ name: 'Friedensarbeit', blaetter: \[/.test(s) && !/RAUM_BLAUPAUSE/.test(s) && !/v === 'community' &&/.test((s.match(/function entwStand\(v\) \{.*/) || [''])[0]), 'Räume tragen noch den Hinweis In Entwicklung');
  assert(/<section class="cr-mat"><h2 class="cr-h">Materialien<\/h2><div id="crMat"><\/div><\/section>/.test(s) && /e\.pk === hx \|\| \(g\.kanten\.get\(e\.id\) \|\| new Set\(\)\)\.has\(k\)/.test(s) && /ms\.slice\(0, 6\)/.test(s) && /sicht\.map\(mtKarte\)/.test(s), 'Raum zeigt keine echten Materialien');
});
Deno.test('Räume und relilab zeigen nur, was unter echten Schlüsseln im Netz steht', () => {
  const fn = (n: string) => (s.match(new RegExp('function ' + n + '\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}')) || [''])[0];
  assert(!/Anna Krüger|Willkommen im Kanal|Kürzliche Aktivität|Digitales Community-Treffen/.test(s), 'erfundene Inhalte in den Räumen');
  assert(/const CR = \{\};/.test(s) && /function crHex\(id\)/.test(s), 'Sitzungsspeicher und Schlüsselsuche');
  const m = fn('crMain');
  assert(/if \(!hx\) return/.test(m) && /Noch kein Schlüssel im Datenraum/.test(m) && /id="crBeitr"/.test(m) && /id="crTerm"/.test(m) && /id="crPers"/.test(m) && /edufeed\.org\/c\//.test(m), 'Raum ohne Schlüssel bleibt leer, mit Schlüssel füllt das Netz');
  const l = fn('crLaden');
  assert(/coLaden\(hx\)/.test(l) && /kinds: \[30023, 31923\], authors: \[hx\]/.test(l) && /eintraegeAufloesen\(es\)/.test(l) && /nwExtra\.set\(/.test(l), 'Beiträge und Termine: eigene und geteilte');
  const f = fn('crFuellen');
  assert(/ls\.map\(nwKarte\)/.test(f) && /class="cr-ev" href="\$\{esc\(sichereUrl\(x\.u\)\)\}"/.test(f) && /lauf !== crFuellLauf \|\| crId !== c\.id/.test(f), 'Kacheln, Termine, Schutz gegen späte Antworten');
  assert(/nwExtra\.forEach\(ev => auf\(ev, ev\.pubkey !== FO_HEX\)\)/.test(fn('nwListe')), 'Beiträge aus den Räumen öffnen sich unter News');
  // relilab: Überschrift, echte Communities, Beiträge als Kacheln
  const h = fn('rlHome');
  assert(/<h2>Communities im relilab<\/h2>/.test(h) && /CY\.filter\(c => c\.rl && crHex\(c\.id\)\)/.test(h) && /news\.map\(nwKarte\)/.test(h) && /daten\.beitraege/.test(h), 'relilab: Überschrift, Schlüssel, News aus dem Netz');
  const rl = [...s.matchAll(/\{ id: '([a-z-]+)', n: [^\n]*\n/g)].filter((x) => / rl: 1[, ]/.test(x[0])).map((x) => x[1]);
  assertEquals(rl.sort(), ['alpika-gs', 'relilab', 'relilab-impuls']);
  assert(/npub1lde034983zllh2nhe48lt60q6p3a6lsxn0g90uemhg0906jsnzesh5vz8y'\), 'relilab-impuls'\]/.test(s), 'Schlüssel von relilab-impuls');
});
Deno.test('Lizenzpille nennt den Urheber', () => {
  assert(/urheber: \[\.\.\.new Set\(tagWerte\(ev, 'creator:name'\)/.test(s), 'Urheber aus creator:name');
  const k = (s.match(/function mtKarte\(m\) \{[\s\S]*?\n  \}/) || [''])[0];
  assert(/!\/\^\(CC0\|Public Domain\)\/\.test\(m\.licLabel\)/.test(k) && /m\.urheber \? esc\(m\.urheber\) : m\.quelle \? esc\(m\.quelle\)/.test(k) && /<span class="mt-urh">· \$\{wer\}<\/span>/.test(k) && /title="\$\{esc\(voll\)\}"/.test(k), 'Kürzel · Urheber, volle Angabe im title');
  assert(/\.mt-urh\{[^}]*text-overflow:ellipsis/.test(html), 'lange Namen werden gekürzt');
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
