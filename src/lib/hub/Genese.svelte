<script>
  // Werkstatt: die Klick-Prototypen aus dem FOERBICO-Repo, zur Laufzeit geladen (genese.js).
  // Fällt das Laden aus, bleibt der Link auf den Ordner.
  import { ladeGenese, prototypLinks, GENESE_ORDNER } from './genese.js';

  /** @type {import('./genese.js').Genese | null} */
  let genese = $state(null);
  let geladen = $state(false);

  $effect(() => {
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
</script>

<section class="hub-werkstatt" id="werkstatt">
  <h2>Werkstatt</h2>
  <p>
    Der reli_hub entsteht zweigleisig: als Klick-Prototyp, in dem Ideen zuerst ausprobiert werden,
    und als diese App, die davon umsetzt, was sich bewährt. Was hier noch fehlt, ist oft im Prototyp
    schon zu sehen.
  </p>
  {#if genese && genese.prototypen.length}
    <ul>
      {#each [...genese.prototypen].sort((a, b) => b.nummer - a.nummer) as p (p.nummer)}
        {@const links = prototypLinks(genese.basis, p)}
        <li>
          <a href={links.html} target="_blank" rel="noopener">{p.titel ?? `Prototyp ${p.nummer}`}</a
          >
          {#if p.datum}<span> · {p.datum}</span>{/if}
          {#if p.autor}<span> · {p.autor}</span>{/if}
          {#if links.beschreibung}
            · <a href={links.beschreibung} target="_blank" rel="noopener"
              >Konstruktionsbeschreibung</a
            >
          {/if}
          {#if p.neu}<br /><small>Neu: {p.neu}</small>{/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p>
      {#if geladen}Das Verzeichnis der Prototypen ist gerade nicht erreichbar.{:else}Prototypen
        werden geladen …{/if}
      <a href={GENESE_ORDNER} target="_blank" rel="noopener">Zum Ordner der Prototypen ›</a>
    </p>
  {/if}
</section>
