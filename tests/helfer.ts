// Gemeinsame Helfer der textbasierten Prüfungen über index.html (kein Build, kein DOM).

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
/** Text des zweiten <script>-Blocks (Web Component relihub-leiste) */
export function leisteScript(): string { return scripts[1]; }
/** Text des letzten <script>-Blocks (Prototyp-Anwendung) */
export function appScript(): string { return scripts[scripts.length - 1]; }
