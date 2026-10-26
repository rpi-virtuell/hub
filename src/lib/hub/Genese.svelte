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
    <ul class="hub-versionen">
      {#each [...genese.prototypen].sort((a, b) => b.nummer - a.nummer) as p (p.nummer)}
        {@const links = prototypLinks(genese.basis, p)}
        <li>
          <div class="kopf">
            <b>{p.titel ?? `Prototyp ${p.nummer}`}</b>
            {#if p.datum}<span> · {p.datum}</span>{/if}
            {#if p.autor}<span> · {p.autor}</span>{/if}
          </div>
          {#if p.neu}<p class="neu">Neu: {p.neu}</p>{/if}
          <div class="acts">
            <a class="hub-btn hub-btn-primär" href={links.html} target="_blank" rel="noopener"
              >Prototyp {p.nummer} öffnen ›</a
            >
            {#if links.beschreibung}
              <a
                class="hub-btn hub-btn-ghost"
                href={links.beschreibung}
                target="_blank"
                rel="noopener">Konstruktionsbeschreibung {p.nummer} ›</a
              >
            {/if}
          </div>
        </li>
      {/each}
    </ul>
    <p class="hint">
      Verzeichnis aller Versionen: <a href={GENESE_ORDNER} target="_blank" rel="noopener"
        >Ordner der Prototypen ›</a
      >
    </p>
  {:else}
    <p>
      {#if geladen}Das Verzeichnis der Prototypen ist gerade nicht erreichbar.{:else}Prototypen
        werden geladen …{/if}
      <a href={GENESE_ORDNER} target="_blank" rel="noopener">Zum Ordner der Prototypen ›</a>
    </p>
  {/if}
</section>
