// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { ladeGenese } from '../genese.js';
import WerkstattOverlay from '../WerkstattOverlay.svelte';

vi.mock('../genese.js', async (orig) => ({
  .../** @type {any} */ (await orig()),
  ladeGenese: vi.fn()
}));

const daten = {
  basis: 'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/',
  prototypen: [
    {
      nummer: 4,
      datum: '2026-10-20',
      html: 'relihub-prototyp_4.html',
      beschreibung: 'relihub-prototyp_4.md'
    },
    {
      nummer: 5,
      datum: '2026-10-26',
      html: 'relihub-prototyp_5.html',
      beschreibung: 'relihub-prototyp_5.md'
    }
  ]
};

describe('WerkstattOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(ladeGenese).mockResolvedValue(daten);
  });

  it('zeigt beim ersten Besuch ein Überblendfenster mit Links auf neuesten Prototyp und Beschreibung', async () => {
    const { getByRole, findByRole } = render(WerkstattOverlay);
    expect(getByRole('dialog')).toBeTruthy();
    const proto = await findByRole('link', { name: /Prototyp 5 öffnen/ });
    expect(proto.getAttribute('href')).toBe(
      'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.html'
    );
    expect(getByRole('link', { name: /Konstruktionsbeschreibung/ }).getAttribute('href')).toBe(
      'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/relihub-prototyp_5.md'
    );
    expect(getByRole('link', { name: /Alle Versionen/ }).getAttribute('href')).toBe('#werkstatt');
  });

  it('lässt sich wegklicken und bleibt in dieser Sitzung weg', async () => {
    const { getByRole, queryByRole } = render(WerkstattOverlay);
    await fireEvent.click(getByRole('button', { name: /Zur Startseite/ }));
    await waitFor(() => expect(queryByRole('dialog')).toBeNull());
    expect(sessionStorage.getItem('hub.werkstatt.gesehen')).toBe('1');
    const zweite = render(WerkstattOverlay);
    expect(zweite.queryByRole('dialog')).toBeNull();
  });

  it('kommt ohne Verzeichnis aus und verlinkt dann den Ordner', async () => {
    vi.mocked(ladeGenese).mockResolvedValue(null);
    const { findByRole } = render(WerkstattOverlay);
    const ordner = await findByRole('link', { name: /Ordner der Prototypen/ });
    expect(ordner.getAttribute('href')).toBe(
      'https://rpi-virtuell.github.io/FOERBICO_und_rpi-virtuell/'
    );
  });
});
