// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import { ladeGenese, GENESE_ORDNER } from '../genese.js';
import Genese from '../Genese.svelte';

vi.mock('../genese.js', async (orig) => ({
  .../** @type {any} */ (await orig()),
  ladeGenese: vi.fn()
}));

const daten = {
  basis: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/',
  prototypen: [
    {
      nummer: 5,
      datum: '2026-10-26',
      titel: 'reli_hub-Prototyp 5',
      autor: 'Jens Dechow',
      html: 'relihub-prototyp_5.html',
      beschreibung: 'relihub-prototyp_5.md',
      neu: 'relilab-Termine'
    }
  ]
};

describe('Genese', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listet Prototypen aus dem Verzeichnis', async () => {
    vi.mocked(ladeGenese).mockResolvedValue(daten);
    const { findAllByText, container } = render(Genese);
    expect((await findAllByText(/Prototyp 5/)).length).toBeGreaterThan(0);
    expect(container.querySelector('a[href$="relihub-prototyp_5.html"]')).not.toBeNull();
  });

  it('zeigt bei Fehler nur den Ordner-Link', async () => {
    vi.mocked(ladeGenese).mockResolvedValue(null);
    const { container, queryByText } = render(Genese);
    await waitFor(() =>
      expect(container.querySelector(`a[href="${GENESE_ORDNER}"]`)).not.toBeNull()
    );
    expect(queryByText(/Prototyp 5/)).toBeNull();
  });

  it('bietet je Version deutliche Knöpfe für Prototyp und Konstruktionsbeschreibung', async () => {
    vi.mocked(ladeGenese).mockResolvedValue(daten);
    const { findByRole, getByRole } = render(Genese);
    const proto = await findByRole('link', { name: /Prototyp 5 öffnen/ });
    expect(proto.getAttribute('href')).toMatch(/relihub-prototyp_5\.html$/);
    expect(getByRole('link', { name: /Konstruktionsbeschreibung 5/ }).getAttribute('href')).toMatch(
      /relihub-prototyp_5\.md$/
    );
  });
});
