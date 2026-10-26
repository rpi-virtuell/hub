<script>
  // Hub-Fassung der Startseite (Comenius-Institut/hub): abgemeldet die reli_hub-Startseite,
  // angemeldet Weiterleitung nach /c/ wie upstream. Einzige ersetzte Upstream-Datei (docs/HUB.md).
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { runtimeConfig } from '$lib/stores/config.svelte.js';
  import { useActiveUser } from '$lib/stores/accounts.svelte';
  import HubLanding from '$lib/hub/HubLanding.svelte';

  const activeUser = useActiveUser();

  $effect(() => {
    if (browser && activeUser()) {
      goto(resolve('/c/'), { replaceState: true });
    }
  });
</script>

<svelte:head>
  <title
    >{runtimeConfig.appName} · Dein Startplatz in die digitale Welt der Religionspädagogik</title
  >
  <meta
    name="description"
    content="reli_hub verbindet bestehende Angebote der Religionspädagogik: finden, erstellen, kooperieren, veröffentlichen – mit einem Profil überall."
  />
</svelte:head>

{#if !activeUser()}
  <HubLanding />
{/if}
