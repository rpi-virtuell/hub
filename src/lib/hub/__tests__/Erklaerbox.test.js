// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { modalStore } from '$lib/stores/modal.svelte.js';
import { goto } from '$app/navigation';
import Erklaerbox from '../Erklaerbox.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (/** @type {string} */ p) => p }));
vi.mock('$lib/stores/modal.svelte.js', () => ({ modalStore: { openModal: vi.fn() } }));

describe('Erklaerbox', () => {
  beforeEach(() => vi.clearAllMocks());

  it('zeigt die Startkarte ohne Aktion', () => {
    const { getByText } = render(Erklaerbox, { props: { aktion: null } });
    expect(getByText(/Wähle einen Bereich der Steuerkonsole/)).toBeTruthy();
  });

  it('zeigt Knospen einer Gruppe und meldet die Wahl', async () => {
    const onwahl = vi.fn();
    const { getByRole } = render(Erklaerbox, { props: { aktion: 'finden', onwahl } });
    await fireEvent.click(getByRole('button', { name: /Fortbildungen/ }));
    expect(onwahl).toHaveBeenCalledWith('finden.fortbildungen');
  });

  it('öffnet bei hub.profil den Login statt zu navigieren', async () => {
    const { getByText } = render(Erklaerbox, { props: { aktion: 'hub.profil' } });
    await fireEvent.click(getByText(/Mit Nostr-Schlüssel anmelden/));
    expect(modalStore.openModal).toHaveBeenCalledWith('login');
    expect(goto).not.toHaveBeenCalled();
  });

  it('navigiert bei internem Ziel per goto und zeigt „mit Profil“', async () => {
    const { getByText } = render(Erklaerbox, { props: { aktion: 'veroeffentlichen.termin' } });
    expect(getByText(/mit Profil/)).toBeTruthy();
    await fireEvent.click(getByText(/Termin eintragen/));
    expect(goto).toHaveBeenCalledWith('/calendar/manage');
  });

  it('führt bei hub.home zum Ökosystem-Abschnitt statt nach /', () => {
    const { getByText } = render(Erklaerbox, { props: { aktion: 'hub.home' } });
    const link = getByText(/Zum Ökosystem/).closest('a');
    expect(link?.getAttribute('href')).toBe('#partner');
  });
});
