// Einzige Quelle der Zielzuordnung: Aktion der Steuerkonsole → Ziel im Hub (docs/HUB.md, Tabelle
// „Aktionen und Ziele“). HubKonsole.svelte (schwebende Konsole) und Erklaerbox.svelte (Startseite)
// lesen hier, niemand sonst entscheidet Ziele.

export const MATERIALPOOL_URL = 'https://material.rpi-virtuell.net/';
export const PROTOTYP_URL =
  'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.html';

/**
 * @typedef {{ art: 'intern', pfad: string }
 *   | { art: 'extern', url: string }
 *   | { art: 'hinweis', text: string, url?: string }} Ziel
 */

/** @type {Record<string, Ziel>} */
const ZIELE = {
  hub: { art: 'intern', pfad: '/' },
  'hub.home': { art: 'intern', pfad: '/' },
  'hub.profil': { art: 'intern', pfad: '/c/' },
  finden: { art: 'hinweis', text: 'Wähle eine der Knospen.' },
  'finden.material': { art: 'extern', url: MATERIALPOOL_URL },
  'finden.fortbildungen': { art: 'intern', pfad: '/calendar' },
  erstellen: { art: 'hinweis', text: 'Wähle eine der Knospen.' },
  'erstellen.schreibtisch': {
    art: 'hinweis',
    text: 'relidesk ist im Prototyp zu sehen.',
    url: PROTOTYP_URL + '#relidesk'
  },
  'erstellen.labor': { art: 'extern', url: 'https://relilab.org/' },
  kooperieren: { art: 'hinweis', text: 'Wähle eine der Knospen.' },
  'kooperieren.communities': { art: 'intern', pfad: '/communities' },
  'kooperieren.personen': { art: 'intern', pfad: '/discover?type=people' },
  veroeffentlichen: { art: 'hinweis', text: 'Wähle eine der Knospen.' },
  'veroeffentlichen.lerninhalte': { art: 'intern', pfad: '/create/resource' },
  'veroeffentlichen.termin': { art: 'intern', pfad: '/calendar/manage' },
  'veroeffentlichen.beitrag': { art: 'intern', pfad: '/create/article' }
};

/**
 * @param {string} action
 * @param {{ thema?: string }} [optionen]
 * @returns {Ziel}
 */
export function zielFuer(action, optionen = {}) {
  const ziel = ZIELE[action];
  if (!ziel) return { art: 'hinweis', text: 'folgt' };
  if (action === 'finden.material' && optionen.thema) {
    return {
      art: 'extern',
      url: `${MATERIALPOOL_URL}?frage=${encodeURIComponent(optionen.thema)}`
    };
  }
  return ziel;
}
