// Textbasierte Prüfungen über index.html (kein Build, kein DOM): Farbkontraste rechnerisch, Struktur per Regex.
import { assert } from 'jsr:@std/assert@1';

export const html = await Deno.readTextFile(new URL('../index.html', import.meta.url));

/** --name → #RRGGBB aus dem ersten :root-Block */
export function rootVars(): Record<string, string> {
  const block = html.match(/:root\s*\{([\s\S]*?)\}/)![1];
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2].toUpperCase();
  return out;
}

function lum(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
/** WCAG-Kontrastverhältnis zweier Hex-Farben */
export function contrast(a: string, b: string): number {
  if (!a || !b) return 0;
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
/** Text des ersten <script>-Blocks (Web Component relihub-steuerkonsole) */
export function consoleScript(): string { return scripts[0]; }
/** Text des letzten <script>-Blocks (Prototyp-Anwendung) */
export function appScript(): string { return scripts[scripts.length - 1]; }

Deno.test('Beide Inline-Skripte sind syntaktisch gültig', () => {
  // Function-Konstruktor parst, ohne auszuführen (kein DOM nötig)
  new Function(consoleScript());
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
  assert(/#203A8F/i.test(consoleScript()) || /#233E99/i.test(consoleScript()), 'Fallback-Farbe fehlt');
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
  assert(/<nav class="proto"[\s\S]*?href="#oercommunity"[^>]*>FOERBICO<\/a>/.test(html), 'Leisten-Eintrag fehlt');
  assert(/'OER-Community',\s*'Schaufenster des Projekts FOERBICO'/.test(s), 'Partner-Kachel fehlt');
  assert(/id:\s*'oercommunity'[\s\S]*?inst:\s*\['OER-Community',\s*'oercommunity'\]/.test(s), 'CY-Eintrag fehlt');
  assert(/registerContext\('oer-community'/.test(s), 'Kontext fehlt');
  assert(/'oercommunity'/.test(s.match(/function route\(\)[\s\S]*?includes\(view\)/)![0]), 'route kennt den View nicht');
  assert(/Roboto\+Condensed:wght@400/.test(html), 'Roboto Condensed 400 fehlt');
  assert((s.match(/const OC_TEAM[\s\S]*?\n  \];/)![0].match(/\bn:/g) || []).length === 10, 'OC_TEAM hat nicht 10 Personen');
  assert((s.match(/const OC_POSTS[\s\S]*?\n  \];/)![0].match(/\bt:/g) || []).length === 5, 'OC_POSTS hat nicht 5 Beiträge');
  assert(/onerror=/.test(s.match(/function ocRender[\s\S]*?\n  \}/)![0]), 'kein Bild-Fallback');
});
