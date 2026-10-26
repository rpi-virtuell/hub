<script>
  // Die zwölf Partner als Flip-Kacheln (Prototyp 5, #pgrid). Daten aus partner.js.
  import { PARTNER } from './partner.js';

  const FARBE = /** @type {Record<string, { c: string, t: string, bk: string, bt: string }>} */ ({
    finden: { c: '#008C86', t: '#fff', bk: '#DDF1F0', bt: '#004E4A' },
    erstellen: { c: '#F39200', t: '#2B1A00', bk: '#FEEFD9', bt: '#6B3F00' },
    kooperieren: { c: '#D6336C', t: '#fff', bk: '#FAE1EA', bt: '#7A1A3E' },
    hub: { c: '#233E99', t: '#fff', bk: '#E6EAF5', bt: '#1B2F73' }
  });

  /** @param {Event} e */
  function tipp(e) {
    // Touch: erstes Antippen dreht die Karte, zweites öffnet sie (Prototyp-Konvention)
    const karte = /** @type {HTMLElement} */ (e.currentTarget);
    if (!matchMedia('(hover: none)').matches || karte.classList.contains('flip')) return;
    document.querySelectorAll('.hub-pcard.flip').forEach((x) => x.classList.remove('flip'));
    karte.classList.add('flip');
    e.preventDefault();
  }
</script>

<section class="hub-partners" id="partner">
  <h2>Das Ökosystem des reli_hub</h2>
  <p>
    reli_hub ist keine weitere Plattform. Er verbindet bestehende Angebote: Wer die
    reli_hub-Steuerkonsole auf der eigenen Seite einbindet, wird Teil des Ökosystems. Auf jeder
    Seite hast du damit Tools und Abläufe, die du kennst. Von jeder Seite aus erreichst du alle
    anderen – und dein Profil nimmst du überall mit hin.
  </p>
  <h3>Wer zum Ökosystem des reli_hub dazugehört</h3>
  <div class="hub-pgrid">
    {#each PARTNER as p (p.name)}
      {@const f = FARBE[p.funktion]}
      {#if p.url}
        <a
          class="hub-pcard"
          data-name={p.name}
          href={p.url}
          target={p.url.startsWith('/') ? undefined : '_blank'}
          rel={p.url.startsWith('/') ? undefined : 'noopener'}
          style="--bk: {f.bk}; --bt: {f.bt}"
          aria-label="{p.name}: {p.text}"
          onclick={tipp}
        >
          <span class="pin">
            <span class="pface"
              ><span class="cc" style="background: {f.c}; color: {f.t}">{p.kuerzel}</span><span
                ><b>{p.name}</b><small>{p.rolle}</small>{#if p.hinweis}<span class="tag"
                    >{p.hinweis}</span
                  >{/if}</span
              ></span
            >
            <span class="pface pback"
              ><p>{p.text}</p>
              <em>Ansehen ›</em></span
            >
          </span>
        </a>
      {:else}
        <div
          class="hub-pcard"
          data-name={p.name}
          style="--bk: {f.bk}; --bt: {f.bt}"
          aria-label="{p.name}: {p.text}"
          role="note"
        >
          <span class="pin">
            <span class="pface"
              ><span class="cc" style="background: {f.c}; color: {f.t}">{p.kuerzel}</span><span
                ><b>{p.name}</b><small>{p.rolle}</small>{#if p.hinweis}<span class="tag"
                    >{p.hinweis}</span
                  >{/if}</span
              ></span
            >
            <span class="pface pback"
              ><p>{p.text}</p>
              <em>Mehr folgt</em></span
            >
          </span>
        </div>
      {/if}
    {/each}
  </div>
</section>
