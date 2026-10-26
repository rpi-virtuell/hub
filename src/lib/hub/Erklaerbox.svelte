<script>
  // Erklärkarte unter der großen Steuerkonsole (Prototyp 5, #explain). Texte aus erklaerungen.js,
  // Ziele aus konsole-ziele.js. hub.profil öffnet den edufeed-Login statt zu navigieren.
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { modalStore } from '$lib/stores/modal.svelte.js';
  import { ERKLAERUNGEN, ERKLAERUNG_START } from './erklaerungen.js';
  import { zielFuer } from './konsole-ziele.js';
  import Logo from './Logo.svelte';

  /** @type {{ aktion: string | null, onwahl?: (id: string) => void }} */
  let { aktion = null, onwahl = () => {} } = $props();

  const FARBE = /** @type {Record<string, string>} */ ({
    hub: 'var(--c-hub)',
    finden: 'var(--c-finden)',
    erstellen: 'var(--c-erstellen)',
    kooperieren: 'var(--c-koop)',
    veroeffentlichen: 'var(--c-ver)'
  });
  const KNOSPE = /** @type {Record<string, string>} */ ({
    'hub.profil': 'mein Profil',
    'hub.home': 'Home',
    'finden.material': 'Material',
    'finden.fortbildungen': 'Fortbildungen',
    'erstellen.schreibtisch': 'Schreibtisch',
    'erstellen.labor': 'Labor',
    'kooperieren.communities': 'Communities',
    'kooperieren.personen': 'Personen',
    'veroeffentlichen.lerninhalte': 'Lerninhalte',
    'veroeffentlichen.termin': 'Termin',
    'veroeffentlichen.beitrag': 'Beitrag'
  });

  const eintrag = $derived(
    aktion && ERKLAERUNGEN[aktion] ? ERKLAERUNGEN[aktion] : ERKLAERUNG_START
  );
  const gruppe = $derived(aktion ? aktion.split('.')[0] : null);
  const farbe = $derived(gruppe && FARBE[gruppe] ? FARBE[gruppe] : 'var(--hub-muted)');
  const ziel = $derived(aktion ? zielFuer(aktion) : null);

  function weiter() {
    if (!aktion || !ziel) return;
    if (aktion === 'hub.profil') {
      modalStore.openModal('login');
      return;
    }
    if (ziel.art === 'intern') goto(resolve(/** @type {any} */ (ziel.pfad)));
  }
</script>

{#key aktion}
  <div class="hub-explain anim" aria-live="polite" style="border-color: {aktion ? farbe : ''}">
    <Logo klasse="ic" hervorheben={gruppe} />
    <div>
      <p class="fn" style="color: {farbe}">{eintrag.fn}</p>
      <h2>{eintrag.titel}</h2>
      <p>{eintrag.text}</p>
      <div class="acts">
        {#if eintrag.knospen}
          <span class="hint">Weiter zu:</span>
          {#each eintrag.knospen as id (id)}
            <button
              type="button"
              class="hub-btn hub-btn-ghost"
              style="border-color: {farbe}; color: {farbe}"
              onclick={() => onwahl(id)}>{KNOSPE[id] ?? id} ›</button
            >
          {/each}
        {:else if eintrag.weiter && ziel}
          {#if aktion === 'hub.profil' || ziel.art === 'intern'}
            <button
              type="button"
              class="hub-btn"
              style="background: {farbe}; color: #fff"
              onclick={weiter}>{eintrag.weiter} ›</button
            >
          {:else if ziel.art === 'extern'}
            <a
              class="hub-btn"
              style="background: {farbe}; color: #fff"
              href={ziel.url}
              target="_blank"
              rel="noopener">{eintrag.weiter} ›</a
            >
          {:else if ziel.url}
            <a class="hub-btn hub-btn-ghost" href={ziel.url} target="_blank" rel="noopener"
              >{ziel.text} ›</a
            >
          {:else}
            <span class="hint">{ziel.text}</span>
          {/if}
        {:else if !aktion}
          <span class="hint">Schon dabei?</span>
          <button
            type="button"
            class="hub-btn hub-btn-ghost"
            onclick={() => modalStore.openModal('login')}>Anmelden</button
          >
        {/if}
        {#if eintrag.mitProfil}
          <span class="hub-badge-lock">● mit Profil</span>
        {/if}
      </div>
    </div>
  </div>
{/key}
