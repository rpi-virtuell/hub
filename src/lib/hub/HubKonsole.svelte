<script>
  // Schwebende reli_hub-Steuerkonsole auf allen edufeed-Seiten (docs/HUB.md). Auf der Startseite
  // steht die große Konsole, dort rendert diese Komponente nichts. Ziele kommen aus konsole-ziele.js.
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { showToast } from '$lib/helpers/toast.js';
  import { steuerkonsoleBereit } from './steuerkonsole-laden.js';
  import { zielFuer } from './konsole-ziele.js';

  const aufStartseite = $derived(page.url.pathname === '/');

  /** @param {{ action: string }} detail */
  function handler(detail) {
    const ziel = zielFuer(detail.action);
    if (ziel.art === 'intern') goto(resolve(/** @type {any} */ (ziel.pfad)));
    else if (ziel.art === 'extern') window.open(ziel.url, '_blank', 'noopener');
    else showToast(ziel.url ? `${ziel.text} ${ziel.url}` : ziel.text);
    return false; // das Skript navigiert nie selbst
  }

  $effect(() => {
    if (aufStartseite) return;
    let aktiv = true;
    steuerkonsoleBereit()
      .then((K) => {
        if (aktiv) K.registerContext('hub', { handler });
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  });
</script>

{#if !aufStartseite}
  <relihub-steuerkonsole
    floating
    context="hub"
    size="58"
    popover-size="210"
    base-url="https://hub.rpi-virtuell.net"
    style="--relihub-float-y: 88px"
  ></relihub-steuerkonsole>
{/if}
