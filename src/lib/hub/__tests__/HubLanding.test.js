// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import HubLanding from '../HubLanding.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (/** @type {string} */ p) => p }));
vi.mock('$lib/stores/modal.svelte.js', () => ({ modalStore: { openModal: vi.fn() } }));
vi.mock('../genese.js', async (orig) => ({
  .../** @type {any} */ (await orig()),
  ladeGenese: vi.fn().mockResolvedValue(null)
}));
const registerContext = vi.fn();
vi.mock('../steuerkonsole-laden.js', () => ({
  steuerkonsoleBereit: () => Promise.resolve({ registerContext })
}));

describe('HubLanding', () => {
  it('zeigt nach einer Konsolen-Aktion die passende Erklärung', async () => {
    const { getByText, queryByText } = render(HubLanding);
    expect(getByText(/Wähle einen Bereich der Steuerkonsole/)).toBeTruthy();
    await waitFor(() =>
      expect(registerContext).toHaveBeenCalledWith('hub-start', expect.anything())
    );
    const { handler } = registerContext.mock.calls[0][1];
    // Das Skript ruft den Handler VOR dem DOM-Ereignis und unterdrückt es bei false:
    // die Karte muss also aus dem Handler heraus wechseln.
    expect(
      handler({ action: 'finden.material', label: 'Material', url: '', context: 'hub-start' })
    ).toBe(false);
    await waitFor(() =>
      expect(queryByText(/Finde aktuelles, redaktionell geprüftes Material/)).toBeTruthy()
    );
  });
});
