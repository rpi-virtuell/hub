import { describe, it, expect } from 'vitest';
import { ERKLAERUNGEN, ERKLAERUNG_START } from '../erklaerungen.js';
import { PARTNER } from '../partner.js';

describe('Inhalte', () => {
  it('erklärt alle 16 Aktionen', () => {
    expect(Object.keys(ERKLAERUNGEN).length).toBe(16);
    expect(ERKLAERUNGEN['veroeffentlichen'].knospen).toEqual([
      'veroeffentlichen.lerninhalte',
      'veroeffentlichen.termin',
      'veroeffentlichen.beitrag'
    ]);
    expect(ERKLAERUNGEN['erstellen'].mitProfil).toBe(true);
    expect(ERKLAERUNGEN['finden.material'].weiter).toBe('Zum Materialpool');
    expect(ERKLAERUNG_START.titel).toMatch(/Wähle einen Bereich/);
  });

  it('listet zwölf Partner mit Funktion', () => {
    expect(PARTNER.length).toBe(12);
    for (const p of PARTNER)
      expect(['finden', 'erstellen', 'kooperieren', 'hub']).toContain(p.funktion);
    expect(PARTNER.find((p) => p.name === 'InkRV')?.url).toBeNull();
    expect(PARTNER.find((p) => p.name === 'relilab')?.url).toBe('https://relilab.org/');
  });
});
