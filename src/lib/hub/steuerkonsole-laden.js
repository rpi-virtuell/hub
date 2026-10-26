// Lädt Jens' Steuerkonsole (static/steuerkonsole/relihub-steuerkonsole.js) genau einmal und liefert
// window.RelihubSteuerkonsole, sobald es existiert. Svelte-Komponenten rufen registerContext erst
// über diese Promise, nie direkt (docs/HUB.md).
const SKRIPT = '/steuerkonsole/relihub-steuerkonsole.js';
let bereit = null;

export function steuerkonsoleBereit(doc = typeof document === 'undefined' ? null : document) {
  if (bereit) return bereit;
  if (!doc || typeof window === 'undefined') {
    bereit = new Promise(() => {}); // SSR: nie auflösen, nur der Browser registriert
    return bereit;
  }
  if (window.RelihubSteuerkonsole) {
    bereit = Promise.resolve(window.RelihubSteuerkonsole);
    return bereit;
  }
  bereit = new Promise((resolve, reject) => {
    let tag = doc.querySelector(`script[src="${SKRIPT}"]`);
    if (!tag) {
      tag = doc.createElement('script');
      tag.src = SKRIPT;
      tag.defer = true;
      doc.head.appendChild(tag);
    }
    tag.addEventListener('load', () => {
      if (window.RelihubSteuerkonsole) resolve(window.RelihubSteuerkonsole);
      else reject(new Error('Steuerkonsole geladen, aber window.RelihubSteuerkonsole fehlt'));
    });
    tag.addEventListener('error', () => reject(new Error(`Steuerkonsole nicht ladbar: ${SKRIPT}`)));
  });
  return bereit;
}
