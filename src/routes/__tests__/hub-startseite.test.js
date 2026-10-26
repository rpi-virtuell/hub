// Hub-Startseite (src/routes/+page.svelte): abgemeldet HubLanding, angemeldet Weiterleitung nach /c/.
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { goto } from '$app/navigation';
import { useActiveUser } from '$lib/stores/accounts.svelte';
import Page from '../+page.svelte';

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (/** @type {string} */ p) => p }));
vi.mock('$lib/stores/config.svelte.js', () => ({ runtimeConfig: { appName: 'reli_hub' } }));
vi.mock('$lib/stores/accounts.svelte', () => ({ useActiveUser: vi.fn() }));
vi.mock('$lib/hub/HubLanding.svelte', async () => ({
  default: (await import('$lib/hub/__tests__/fixtures/HubLandingStub.svelte')).default
}));

describe('Hub-Startseite', () => {
  beforeEach(() => vi.clearAllMocks());

  it('zeigt abgemeldet die Hub-Startseite', () => {
    vi.mocked(useActiveUser).mockReturnValue(/** @type {any} */ (() => null));
    const { getByTestId } = render(Page);
    expect(getByTestId('hub-landing')).toBeTruthy();
    expect(goto).not.toHaveBeenCalled();
  });

  it('leitet angemeldet nach /c/ weiter', async () => {
    vi.mocked(useActiveUser).mockReturnValue(/** @type {any} */ (() => ({ pubkey: 'x' })));
    const { queryByTestId } = render(Page);
    await new Promise((r) => setTimeout(r, 0));
    expect(goto).toHaveBeenCalledWith('/c/', { replaceState: true });
    expect(queryByTestId('hub-landing')).toBeNull();
  });
});
