import { describe, it, expect } from 'vitest';
import { ladeGenese, prototypLinks, GENESE_URL } from '../genese.js';

const daten = {
  basis: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/',
  prototypen: [
    { nummer: 5, html: 'relihub-prototyp_5.html', beschreibung: 'relihub-prototyp_5.md' }
  ]
};

describe('Genese-Verzeichnis', () => {
  it('lädt das Verzeichnis', async () => {
    const fetchFn = /** @type {any} */ (
      async (/** @type {string} */ url) => {
        expect(url).toBe(GENESE_URL);
        return { ok: true, json: async () => daten };
      }
    );
    const g = await ladeGenese(fetchFn);
    expect(g?.prototypen[0].nummer).toBe(5);
  });

  it('liefert null bei Fehler oder Nicht-200', async () => {
    expect(
      await ladeGenese(
        /** @type {any} */ (
          async () => {
            throw new Error('netz');
          }
        )
      )
    ).toBeNull();
    expect(
      await ladeGenese(/** @type {any} */ (async () => ({ ok: false, json: async () => ({}) })))
    ).toBeNull();
  });

  it('baut absolute Links', () => {
    expect(prototypLinks(daten.basis, daten.prototypen[0])).toEqual({
      html: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.html',
      beschreibung: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.md'
    });
  });
});
