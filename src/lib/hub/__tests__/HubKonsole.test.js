// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { goto } from '$app/navigation';
import { showToast } from '$lib/helpers/toast.js';
import HubKonsole from '../HubKonsole.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (/** @type {string} */ p) => p }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/communities') } }));
vi.mock('$lib/helpers/toast.js', () => ({ showToast: vi.fn() }));
const registerContext = vi.fn();
vi.mock('../steuerkonsole-laden.js', () => ({
  steuerkonsoleBereit: () => Promise.resolve({ registerContext })
}));

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('HubKonsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
  });

  it('rendert die schwebende Konsole mit Kontext hub und registriert den Handler', async () => {
    const { container } = render(HubKonsole);
    await tick();
    const el = container.querySelector('relihub-steuerkonsole');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('floating')).not.toBeNull();
    expect(el?.getAttribute('context')).toBe('hub');
    expect(registerContext).toHaveBeenCalledWith(
      'hub',
      expect.objectContaining({ handler: expect.any(Function) })
    );
  });

  it('Handler: intern per goto, extern per window.open, Gruppen nur Hinweis', async () => {
    render(HubKonsole);
    await tick();
    const { handler } = registerContext.mock.calls[0][1];
    expect(handler({ action: 'kooperieren.communities' })).toBe(false);
    expect(goto).toHaveBeenCalledWith('/communities');
    handler({ action: 'erstellen.labor' });
    expect(window.open).toHaveBeenCalledWith('https://relilab.org/', '_blank', 'noopener');
    handler({ action: 'finden' });
    expect(goto).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledTimes(1);
  });
});
