import { describe, it, expect } from 'vitest';
import { zielFuer } from '../konsole-ziele.js';

/** @param {ReturnType<typeof zielFuer>} z */
const url = (z) => ('url' in z ? z.url : undefined);

const ALLE = [
  'hub',
  'hub.profil',
  'hub.home',
  'finden',
  'finden.material',
  'finden.fortbildungen',
  'erstellen',
  'erstellen.schreibtisch',
  'erstellen.labor',
  'kooperieren',
  'kooperieren.communities',
  'kooperieren.personen',
  'veroeffentlichen',
  'veroeffentlichen.lerninhalte',
  'veroeffentlichen.termin',
  'veroeffentlichen.beitrag'
];

describe('zielFuer', () => {
  it('kennt jede Aktion', () => {
    for (const a of ALLE) expect(['intern', 'extern', 'hinweis']).toContain(zielFuer(a).art);
  });

  it('Gruppen navigieren nie', () => {
    for (const a of ['finden', 'erstellen', 'kooperieren', 'veroeffentlichen']) {
      expect(zielFuer(a).art).toBe('hinweis');
    }
  });

  it('kodiert das Thema für den Materialpool', () => {
    expect(url(zielFuer('finden.material', { thema: 'Schöpfung' }))).toBe(
      'https://material.rpi-virtuell.net/?frage=Sch%C3%B6pfung'
    );
    expect(url(zielFuer('finden.material'))).toBe('https://material.rpi-virtuell.net/');
  });

  it('Communities intern, relidesk als Hinweis auf den Prototyp', () => {
    expect(zielFuer('kooperieren.communities')).toEqual({ art: 'intern', pfad: '/communities' });
    expect(url(zielFuer('erstellen.schreibtisch'))).toMatch(/relihub-prototyp_5\.html#relidesk$/);
  });

  it('unbekannte Aktion ist ein Hinweis „folgt“', () => {
    expect(zielFuer('gibt.es.nicht')).toEqual({ art: 'hinweis', text: 'folgt' });
  });
});
