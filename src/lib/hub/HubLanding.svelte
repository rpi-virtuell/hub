<script>
  // Hub-Startseite (abgemeldet) nach Jens' Prototyp 5, Ansicht #v-start, ohne dessen Kopfzeile:
  // die edufeed-Navbar bleibt. Große Steuerkonsole, Erklärkarte, Ökosystem, Werkstatt, Fußzeile.
  import { steuerkonsoleBereit } from './steuerkonsole-laden.js';
  import Erklaerbox from './Erklaerbox.svelte';
  import Oekosystem from './Oekosystem.svelte';
  import Genese from './Genese.svelte';
  import Logo from './Logo.svelte';
  import './hub.css';

  /** @type {string | null} */
  let aktion = $state(null);
  let groesse = $state(320);

  $effect(() => {
    const passe = () => {
      groesse = window.innerWidth < 640 ? 240 : 320;
    };
    passe();
    window.addEventListener('resize', passe);
    return () => window.removeEventListener('resize', passe);
  });

  // Das Skript ruft den Kontext-Handler vor dem DOM-Ereignis und unterdrückt das Ereignis bei
  // false. Die Erklärkarte wechselt deshalb aus dem Handler heraus (wie im Prototyp: explain()).
  $effect(() => {
    let aktiv = true;
    steuerkonsoleBereit()
      .then((K) => {
        if (!aktiv) return;
        K.registerContext('hub-start', {
          handler: (d) => {
            aktion = d.action;
            return false;
          }
        });
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  });
</script>

<div class="hub">
  <section class="hub-stage">
    <span
      class="hub-deco"
      style="width:520px;height:520px;background:var(--c-finden);right:-220px;top:-120px"
    ></span>
    <span
      class="hub-deco"
      style="width:420px;height:420px;background:var(--c-koop);left:-200px;top:260px"
    ></span>
    <span
      class="hub-deco"
      style="width:300px;height:300px;background:var(--c-erstellen);right:-60px;bottom:-140px"
    ></span>
    <p class="hub-eyebrow"><b>offen</b> · <i>vernetzt</i> · <u>digital</u></p>
    <h1>Dein Startplatz in die digitale Welt der Religionspädagogik</h1>
    <div class="hub-flower">
      <relihub-steuerkonsole
        size={groesse}
        context="hub-start"
        variant="knospen"
        base-url="https://hub.rpi-virtuell.net"
      ></relihub-steuerkonsole>
    </div>
    <Erklaerbox {aktion} onwahl={(id) => (aktion = id)} />
  </section>

  <Oekosystem />
  <Genese />

  <footer class="hub-foot">
    <Logo groesse={22} /> reli_hub · ein Vorhaben von FOERBICO · Comenius-Institut
  </footer>
</div>
