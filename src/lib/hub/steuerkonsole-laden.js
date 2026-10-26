// Lädt Jens' Steuerkonsole (static/steuerkonsole/relihub-steuerkonsole.js) genau einmal und liefert
// window.RelihubSteuerkonsole, sobald es existiert. Svelte-Komponenten rufen registerContext erst
// über diese Promise, nie direkt (docs/HUB.md).
/** @typedef {import('./steuerkonsole.d.ts').RelihubSteuerkonsoleApi} RelihubSteuerkonsoleApi */

const SKRIPT = '/steuerkonsole/relihub-steuerkonsole.js';

/** @type {Promise<RelihubSteuerkonsoleApi> | null} */
let bereit = null;

/**
 * @param {Document | null} [doc]
 * @returns {Promise<RelihubSteuerkonsoleApi>}
 */
export function steuerkonsoleBereit(doc = typeof document === 'undefined' ? null : document) {
  if (bereit) return bereit;
  if (!doc || typeof window === 'undefined') {
    bereit = new Promise(() => {}); // SSR: nie auflösen, nur der Browser registriert
    return bereit;
  }
  const vorhanden = window.RelihubSteuerkonsole;
  if (vorhanden) {
    bereit = Promise.resolve(vorhanden);
    return bereit;
  }
  bereit = new Promise((resolve, reject) => {
    /** @type {HTMLScriptElement | null} */
    let tag = doc.querySelector(`script[src="${SKRIPT}"]`);
    if (!tag) {
      tag = doc.createElement('script');
      tag.src = SKRIPT;
      tag.defer = true;
      doc.head.appendChild(tag);
    }
    tag.addEventListener('load', () => {
      const api = window.RelihubSteuerkonsole;
      if (api) resolve(api);
      else reject(new Error('Steuerkonsole geladen, aber window.RelihubSteuerkonsole fehlt'));
    });
    tag.addEventListener('error', () => reject(new Error(`Steuerkonsole nicht ladbar: ${SKRIPT}`)));
  });
  return bereit;
}
