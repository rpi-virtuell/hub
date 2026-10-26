<script>
  // Einstiegs-Überblendfenster der Startseite: erklärt die Zweigleisigkeit (Klick-Prototyp und App)
  // und verlinkt deutlich den neuesten Prototyp, seine Konstruktionsbeschreibung und alle Versionen.
  // Einmal pro Browser-Sitzung (sessionStorage), danach nur noch der Werkstatt-Abschnitt unten.
  import { ladeGenese, prototypLinks, GENESE_ORDNER } from './genese.js';

  const SCHLUESSEL = 'hub.werkstatt.gesehen';
  /** @returns {boolean} */
  function schonGesehen() {
    try {
      return sessionStorage.getItem(SCHLUESSEL) === '1';
    } catch {
      return false;
    }
  }

  let offen = $state(!schonGesehen());
  let genese = $state(/** @type {import('./genese.js').Genese | null} */ (null));
  let geladen = $state(false);

  const neuester = $derived(
    genese && genese.prototypen.length
      ? [...genese.prototypen].sort((a, b) => b.nummer - a.nummer)[0]
      : null
  );
  const links = $derived(genese && neuester ? prototypLinks(genese.basis, neuester) : null);

  $effect(() => {
    if (!offen) return;
    let aktiv = true;
    ladeGenese().then((g) => {
      if (!aktiv) return;
      genese = g;
      geladen = true;
    });
    return () => {
      aktiv = false;
    };
  });

  function schliessen() {
    offen = false;
    try {
      sessionStorage.setItem(SCHLUESSEL, '1');
    } catch {
      /* Speicher nicht verfügbar: das Fenster kommt beim nächsten Laden wieder */
    }
  }
</script>

{#if offen}
  <div class="hub-overlay" role="presentation">
    <div
      class="hub-overlay-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hub-overlay-titel"
    >
      <p class="fn">Werkstatt</p>
      <h2 id="hub-overlay-titel">Der reli_hub entsteht gerade – zweigleisig</h2>
      <p>
        Als <strong>Klick-Prototyp</strong>, in dem Ideen zuerst ausprobiert werden, und als
        <strong>diese App</strong>, die umsetzt, was sich bewährt. Was hier noch fehlt, ist im
        Prototyp oft schon zu sehen. Beide Gleise sind versioniert und öffentlich.
      </p>
      <div class="acts">
        {#if links && neuester}
          <a class="hub-btn hub-btn-primär" href={links.html} target="_blank" rel="noopener"
            >Prototyp {neuester.nummer} öffnen ›</a
          >
          {#if links.beschreibung}
            <a
              class="hub-btn hub-btn-ghost"
              href={links.beschreibung}
              target="_blank"
              rel="noopener">Konstruktionsbeschreibung lesen ›</a
            >
          {/if}
        {:else if geladen}
          <a class="hub-btn hub-btn-ghost" href={GENESE_ORDNER} target="_blank" rel="noopener"
            >Ordner der Prototypen ›</a
          >
        {:else}
          <span class="hint">Prototypen werden geladen …</span>
        {/if}
        <a class="hub-btn hub-btn-ghost" href="#werkstatt" onclick={schliessen}>Alle Versionen ›</a>
      </div>
      <div class="acts" style="margin-top: 14px">
        <button type="button" class="hub-btn hub-btn-start" onclick={schliessen}
          >Zur Startseite</button
        >
      </div>
    </div>
  </div>
{/if}
