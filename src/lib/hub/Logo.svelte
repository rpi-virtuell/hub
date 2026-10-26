<script>
  // Die fünf Kreise als Marke (Prototyp: svg.mark / petals()). Optional ein Kreis hervorgehoben.
  const ORDER = ['hub', 'finden', 'erstellen', 'kooperieren', 'veroeffentlichen'];
  const FARBE = /** @type {Record<string, string>} */ ({
    hub: '#233E99',
    finden: '#008C86',
    erstellen: '#F39200',
    kooperieren: '#D6336C',
    veroeffentlichen: '#7B4FB8'
  });
  /** @type {{ klasse?: string, hervorheben?: string | null, groesse?: number }} */
  let { klasse = '', hervorheben = null, groesse = 0 } = $props();
  const kreise = ORDER.map((k, i) => {
    const a = ((-90 + 72 * i) * Math.PI) / 180;
    return {
      k,
      cx: (98 * Math.cos(a)).toFixed(1),
      cy: (98 * Math.sin(a)).toFixed(1),
      fill: FARBE[k]
    };
  });
</script>

<svg
  class={klasse}
  viewBox="-205 -205 410 410"
  aria-hidden="true"
  width={groesse || undefined}
  height={groesse || undefined}
>
  {#each kreise as c (c.k)}
    <circle
      cx={c.cx}
      cy={c.cy}
      r="100"
      fill={c.fill}
      opacity={hervorheben ? (c.k === hervorheben ? 0.95 : 0.13) : 0.66}
    />
  {/each}
</svg>
