// Pipeline-Regeln (Spec „Build und Auslieferung“): der Deploy darf nicht hinter den langen
// Upstream-Prüfungen hängen, und der dauerhaft rote Upstream-Test LandingPage.test.js (erwartet die
// edufeed-Startseite) wird ausgeschlossen, damit das Signal der Prüfungen etwas wert bleibt.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const yaml = readFileSync(resolve(process.cwd(), '.woodpecker/build-deploy.yaml'), 'utf8');

describe('build-deploy.yaml', () => {
  it('deployt vor den Upstream-Prüfungen', () => {
    expect(yaml.indexOf('name: deploy')).toBeGreaterThan(yaml.indexOf('name: hub-tests'));
    expect(yaml.indexOf('name: deploy')).toBeLessThan(yaml.indexOf('name: upstream-checks'));
  });

  it('schließt den ersetzten Startseiten-Test aus den Upstream-Prüfungen aus', () => {
    expect(yaml).toMatch(/--exclude src\/lib\/components\/__tests__\/LandingPage\.test\.js/);
  });
});
