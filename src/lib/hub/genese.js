// Werkstatt: Verzeichnis der Klick-Prototypen aus dem FOERBICO-Repo (docs/relihub-prototypen.json,
// über GitHub Pages veröffentlicht). Der Hub liest es zur Laufzeit; ein neuer Prototyp erscheint ohne
// neuen Hub-Build (Spec, Abschnitt „Zwei Gleise“).
export const GENESE_ORDNER = 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/';
export const GENESE_URL = GENESE_ORDNER + 'relihub-prototypen.json';

/**
 * @typedef {{ nummer: number, datum?: string, titel?: string, autor?: string, html: string, beschreibung?: string, neu?: string }} PrototypEintrag
 * @typedef {{ basis: string, prototypen: PrototypEintrag[] }} Genese
 */

/**
 * @param {typeof fetch} [fetchFn]
 * @returns {Promise<Genese | null>}
 */
export async function ladeGenese(fetchFn = fetch) {
  try {
    const antwort = await fetchFn(GENESE_URL);
    if (!antwort.ok) return null;
    const daten = await antwort.json();
    if (!daten || !Array.isArray(daten.prototypen)) return null;
    return { basis: daten.basis || GENESE_ORDNER, prototypen: daten.prototypen };
  } catch {
    return null;
  }
}

/**
 * @param {string} basis
 * @param {PrototypEintrag} eintrag
 * @returns {{ html: string, beschreibung: string | null }}
 */
export function prototypLinks(basis, eintrag) {
  const b = basis.endsWith('/') ? basis : basis + '/';
  return {
    html: b + eintrag.html,
    beschreibung: eintrag.beschreibung ? b + eintrag.beschreibung : null
  };
}
