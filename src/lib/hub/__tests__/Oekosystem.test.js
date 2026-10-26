// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Oekosystem from '../Oekosystem.svelte';

describe('Oekosystem', () => {
  it('rendert zwölf Kacheln, InkRV ohne Link', () => {
    const { container } = render(Oekosystem);
    expect(container.querySelectorAll('.hub-pcard').length).toBe(12);
    expect(container.querySelector('.hub-pcard[data-name="InkRV"] a')).toBeNull();
    expect(container.querySelector('a.hub-pcard[data-name="relilab"]')?.getAttribute('href')).toBe(
      'https://relilab.org/'
    );
  });
});
