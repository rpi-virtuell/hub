// Prüft Jens' Steuerkonsole (static/steuerkonsole/relihub-steuerkonsole.js) so, wie der Hub sie
// nutzt: fünf Funktionen, elf Unteraktionen, Routen gegen die Basis-URL, Trefferlogik.
// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(async () => {
  await import('../../../../static/steuerkonsole/relihub-steuerkonsole.js');
});

describe('relihub-steuerkonsole', () => {
  it('registriert fünf Funktionen mit elf Unteraktionen', () => {
    const f = window.RelihubSteuerkonsole.functions;
    expect(f.map((x) => x.id)).toEqual([
      'hub',
      'finden',
      'erstellen',
      'kooperieren',
      'veroeffentlichen'
    ]);
    expect(f.flatMap((x) => x.subs).length).toBe(11);
  });

  it('löst Routen gegen die Basis-URL auf', () => {
    expect(window.RelihubSteuerkonsole.resolve('finden.material', 'standard')).toBe(
      'https://relihub.example/finden/materialpool'
    );
  });

  it('trifft nur Punkte in genau einem Kreis', () => {
    const el = document.createElement('relihub-steuerkonsole');
    expect(el.exclusive({ x: 0, y: 0 })).toBeNull(); // Mitte: alle fünf Kreise
    expect(el.exclusive({ x: 0, y: -190 }).id).toBe('hub'); // oberes Blütenblatt
    expect(el.exclusive({ x: 0, y: -60 })).toBeNull(); // Linse hub/finden/veroeffentlichen
  });
});
