// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { steuerkonsoleBereit } from '../steuerkonsole-laden.js';

describe('steuerkonsoleBereit', () => {
  it('fügt das Skript einmal ein und löst auf, sobald das Objekt existiert', async () => {
    const p1 = steuerkonsoleBereit();
    const p2 = steuerkonsoleBereit();
    expect(p1).toBe(p2);
    const skripte = document.querySelectorAll(
      'script[src="/steuerkonsole/relihub-steuerkonsole.js"]'
    );
    expect(skripte.length).toBe(1);
    window.RelihubSteuerkonsole = { version: 'test' };
    skripte[0].dispatchEvent(new Event('load'));
    expect((await p1).version).toBe('test');
  });
});
