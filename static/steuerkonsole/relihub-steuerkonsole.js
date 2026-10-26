/*!
 * relihub-steuerkonsole.js 0.7.0
 * Copyright (c) 2026 Jens Dechow, Comenius-Institut (FOERBICO)
 * Lizenz: MIT (https://opensource.org/license/mit)
 * Quelle: docs/relihub-prototyp_5.html im Repo Comenius-Institut/FOERBICO_und_rpi-virtuell
 */
/* eslint-disable no-unused-vars -- Fremdcode von Jens Dechow, unverändert übernommen; Regeln des Hub-Repos gelten hier nicht */
/*!
 * reli_hub-Steuerkonsole – Steuerelement (Prototyp)
 * FOERBICO · nach dem Projektlogo (fünf überlagerte Kreise)
 *
 * EINBINDEN
 *   <script src="https://hub.rpi-virtuell.net/steuerkonsole/relihub-steuerkonsole.js" defer><\/script>
 *   <relihub-steuerkonsole context="comenius-institut" variant="knospen" size="240"></relihub-steuerkonsole>
 *
 * ATTRIBUTE
 *   size        Kantenlänge der Steuerkonsole in px (Standard 240). Knospen und Beschriftungen
 *               ragen beim Aufklappen etwas über diesen Rahmen hinaus.
 *   variant     "knospen" (Unteroptionen wachsen als kleine Kreise heraus) oder
 *               "scheibe" (die herausgesprungene Scheibe teilt sich in zwei Hälften)
 *   context     Name eines Kontextprofils (siehe unten). Ohne Angabe: "standard"
 *   base-url    Adresse des reli_hub (Standard: Platzhalter https://relihub.example)
 *   target      "_self" (Standard) oder "_blank"
 *   config-src  URL einer JSON-Datei mit einem Kontextprofil (wird nachgeladen)
 *   demo        Nur Ereignis auslösen, nicht navigieren (für Tests und Vorführungen)
 *   compact     Kompaktform für Kopfzeilen: Es erscheint ein kleines Symbol in der Größe
 *               von "size"; beim Überfahren oder Antippen klappt die volle Steuerkonsole auf.
 *   floating    Schwebende Form: kleines Symbol fest unten rechts im Fenster, bleibt beim
 *               Scrollen sichtbar und klappt nach oben auf (schließt "compact" ein).
 *               Abstand über --relihub-float-x / --relihub-float-y (Standard 22px).
 *   popover-size  Größe der aufgeklappten Steuerkonsole in der Kompaktform (Standard 200)
 *   popover-align "right" (Standard, bündig am rechten Rand) oder "left"
 *
 * KONTEXTPROFILE – je nach Einbettungsort kann jeder Klick etwas anderes auslösen
 *   RelihubSteuerkonsole.registerContext("narrt", {
 *     target: "_blank",                       // für alle Aktionen
 *     params: { quelle: "narrt" },            // an alle Ziel-URLs angehängt
 *     actions: {
 *       "finden.material": { params: { thema: ["antisemitismuskritisch", "rassismuskritisch"] } },
 *       "hub.profil":      { href: "https://andere-adresse.example/login" },
 *       "erstellen.labor": { handler: (detail) => { meinDialog(detail); return false; } }
 *     }
 *   });
 *
 * AKTIONEN
 *   hub · hub.profil · hub.home · finden · finden.material · finden.fortbildungen ·
 *   erstellen · erstellen.schreibtisch · erstellen.labor · kooperieren ·
 *   kooperieren.communities · kooperieren.personen · veroeffentlichen ·
 *   veroeffentlichen.lerninhalte · veroeffentlichen.termin · veroeffentlichen.beitrag
 *   finden, erstellen, kooperieren und veroeffentlichen haben keine eigene Zielseite:
 *   Ihr Klick löst nur das Ereignis aus. "hub" navigiert (je nach Kontext zur Start-
 *   oder Profilseite).
 *
 * EREIGNIS
 *   Jeder Klick löst "relihub-action" aus (bubbles, composed, cancelable) mit
 *   detail = { action, label, url, context }. preventDefault() verhindert die Navigation.
 *
 * GESTALTUNG ÜBER CSS-VARIABLEN (auf dem Element oder einem Elternelement)
 *   --relihub-font, --relihub-label (Schriftfarbe außen), --relihub-halo (Hof um Schrift),
 *   --relihub-blend (z. B. multiply auf hellem Grund), --relihub-alpha (Deckkraft der Kreise)
 *
 * Es werden keine externen Schriften oder Dateien geladen.
 */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const R = 100;          // Kreisradius
  const D = 98;           // Abstand Kreismitte – Mitte der Steuerkonsole (wie im Logo: ~ R)
  const POP = 16;         // so weit springt ein Kreis heraus
  const SC = 1.05;        // und so stark wächst er dabei
  const VB = R + D + 6;   // halbe Kantenlänge der viewBox
  const CLOSE_DELAY = 280;

  const FUNCS = [
    { id: 'hub', label: 'reli_hub', color: '#233E99', text: '#FFFFFF', self: true,
      subs: [{ id: 'hub.profil', label: 'mein Profil' }, { id: 'hub.home', label: 'Home' }] },
    { id: 'finden', label: 'finden', color: '#008C86', text: '#FFFFFF',
      subs: [{ id: 'finden.material', label: 'Material' }, { id: 'finden.fortbildungen', label: 'Fortbildungen' }] },
    { id: 'erstellen', label: 'erstellen', color: '#F39200', text: '#2B1A00',
      subs: [{ id: 'erstellen.schreibtisch', label: 'Schreibtisch' }, { id: 'erstellen.labor', label: 'Labor' }] },
    { id: 'kooperieren', label: 'kooperieren', color: '#D6336C', text: '#FFFFFF',
      subs: [{ id: 'kooperieren.communities', label: 'Communities' }, { id: 'kooperieren.personen', label: 'Personen' }] },
    { id: 'veroeffentlichen', label: 'veröffentlichen', color: '#7B4FB8', text: '#FFFFFF',
      subs: [{ id: 'veroeffentlichen.lerninhalte', label: 'Lerninhalte' }, { id: 'veroeffentlichen.termin', label: 'Termin' }, { id: 'veroeffentlichen.beitrag', label: 'Beitrag' }] }
  ];
  FUNCS.forEach((f, i) => {
    const a = (-90 + 72 * i) * Math.PI / 180;
    f.ux = Math.cos(a); f.uy = Math.sin(a);
    f.cx = D * f.ux; f.cy = D * f.uy;
    f.light = mix(f.color, '#FFFFFF', 0.22);
  });

  const ROUTES = {
    'hub': '/',
    'hub.profil': '/profil',
    'hub.home': '/',
    'finden.material': '/finden/materialpool',
    'finden.fortbildungen': '/finden/fortbildungen',
    'erstellen.schreibtisch': '/erstellen/schreibtisch',
    'erstellen.labor': '/erstellen/labor',
    'kooperieren.communities': '/kooperieren/communities',
    'kooperieren.personen': '/kooperieren/personen',
    'veroeffentlichen.lerninhalte': '/veroeffentlichen/lerninhalte',
    'veroeffentlichen.termin': '/veroeffentlichen/termin',
    'veroeffentlichen.beitrag': '/veroeffentlichen/beitrag'
  };
  const LABELS = {};
  FUNCS.forEach(f => { LABELS[f.id] = f.label; (f.subs || []).forEach(s => { LABELS[s.id] = s.label; }); });
  const DEFAULT_BASE = 'https://relihub.example';
  const CONTEXTS = { standard: {} };

  function mix(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const x = p(a), y = p(b);
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function resolve(action, ctxName, host) {
    const prof = CONTEXTS[ctxName] || {};
    const a = (prof.actions || {})[action] || {};
    let base = prof.baseUrl || host.getAttribute('base-url') || DEFAULT_BASE;
    if (!base.endsWith('/')) base += '/';
    const url = a.href ? new URL(a.href, base) : new URL((ROUTES[action] || '/').replace(/^\//, ''), base);
    const params = Object.assign({}, prof.params || {}, a.params || {});
    Object.keys(params).forEach(k => [].concat(params[k]).forEach(v => url.searchParams.append(k, v)));
    return {
      url: url.toString(),
      target: a.target || prof.target || host.getAttribute('target') || '_self',
      handler: a.handler || prof.handler || null
    };
  }

  const CSS = `
:host{display:inline-block;position:relative;width:var(--rh-size);height:var(--rh-size);
  font-family:var(--relihub-font,inherit);-webkit-tap-highlight-color:transparent;vertical-align:middle}
svg{display:block;width:100%;height:100%;overflow:visible;touch-action:manipulation;user-select:none}
.base circle{opacity:var(--relihub-alpha,.62);mix-blend-mode:var(--relihub-blend,normal);transition:opacity .25s}
.base circle.dim{opacity:.28}
.pop{transition:transform .32s cubic-bezier(.3,1.45,.55,1)}
.act{cursor:pointer}
.lbl{pointer-events:none;font-weight:700}
.out{pointer-events:none;font-weight:600;fill:var(--relihub-label,#1D1D1B);
  stroke:var(--relihub-halo,#FFFFFF);stroke-width:7px;stroke-linejoin:round;paint-order:stroke}
.bud{transition:transform .34s cubic-bezier(.3,1.45,.55,1) .06s,opacity .2s .06s}
.bud circle{transition:fill .15s}
.bud:hover circle,.bud.kbd circle{fill:var(--hl)}
.half{transition:fill .15s}
.half:hover,.half.kbd{fill:var(--hl)}
.pill rect{fill:#FFFFFF;transition:fill .15s}
.pill:hover rect,.pill.kbd rect{fill:#EEF0F4}
.kbd>circle,.kbd>rect,path.kbd,circle.kbd{stroke:var(--relihub-focus,#111111);stroke-width:5px}
.sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.mini{all:unset;box-sizing:border-box;display:block;width:100%;height:100%;cursor:pointer;border-radius:50%}
.mini svg circle{opacity:.72}
.mini:focus-visible{outline:3px solid var(--relihub-focus,#111111);outline-offset:3px}
.popover{position:absolute;top:calc(100% + 12px);z-index:10000;padding:52px 112px;border-radius:28px;
  background:var(--relihub-pop-bg,#FFFFFF);box-shadow:0 18px 50px rgba(15,23,42,.22),0 3px 10px rgba(15,23,42,.10);
  opacity:0;visibility:hidden;transform:translateY(-8px) scale(.96);transform-origin:top right;
  transition:opacity .18s,transform .2s,visibility 0s .2s}
.popover[data-align="right"]{right:-14px}
.popover[data-align="left"]{left:-14px;transform-origin:top left}
:host([open]) .popover{opacity:1;visibility:visible;transform:none;transition:opacity .18s,transform .22s cubic-bezier(.3,1.3,.5,1)}
.fbox{position:relative;width:var(--rh-pop);height:var(--rh-pop)}
.fbox svg{width:100%;height:100%}
@media (max-width:560px){.popover{position:fixed;top:72px;left:50%;right:auto!important;padding:46px 76px;
  transform:translate(-50%,-8px) scale(.96);transform-origin:top center}
  :host([open]) .popover{transform:translate(-50%,0)}}
:host([floating]){position:fixed;right:var(--relihub-float-x,22px);bottom:var(--relihub-float-y,22px);z-index:9999}
:host([floating]) .mini{background:#FFFFFF;padding:8px;box-shadow:0 8px 26px rgba(15,23,42,.24),0 2px 6px rgba(15,23,42,.12);transition:transform .2s}
:host([floating]) .mini:hover,:host([floating][open]) .mini{transform:scale(1.07)}
:host([floating]) .popover{top:auto;bottom:calc(100% + 16px);right:-6px;left:auto;transform-origin:bottom right;transform:translateY(10px) scale(.96)}
:host([floating][open]) .popover{transform:none}
@media (max-width:560px){:host([floating]) .popover{position:fixed;top:auto;bottom:96px;left:50%;right:auto!important;transform:translate(-50%,10px) scale(.96)}
  :host([floating][open]) .popover{transform:translate(-50%,0)}}
@media (prefers-reduced-motion:reduce){.pop,.bud,.popover{transition:none}}
`;

  class RelihubSteuerkonsoleElement extends HTMLElement {
    static get observedAttributes() { return ['size', 'variant', 'context', 'base-url', 'target', 'compact', 'floating', 'popover-size', 'popover-align']; }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.active = null;
      this.kbdAction = null;
      this._closeT = null;
      this._touchAct = false;
    }
    connectedCallback() {
      this.render();
      this._outside = e => { if (this.hasAttribute('open') && !e.composedPath().includes(this)) this.closePop(0); };
      this._esc = e => { if (e.key === 'Escape' && this.hasAttribute('open')) { this.closePop(0); if (this.miniBtn) this.miniBtn.focus(); } };
      document.addEventListener('pointerdown', this._outside);
      document.addEventListener('keydown', this._esc);
      this.addEventListener('mouseenter', () => this.openPop());
      this.addEventListener('mouseleave', () => this.closePop(380));
      const src = this.getAttribute('config-src');
      if (src) {
        fetch(src).then(r => r.json()).then(j => {
          RelihubSteuerkonsole.registerContext(this.getAttribute('context') || j.name || 'extern', j);
          this.render();
        }).catch(() => {});
      }
    }
    disconnectedCallback() {
      document.removeEventListener('pointerdown', this._outside);
      document.removeEventListener('keydown', this._esc);
    }
    get compact() { return this.hasAttribute('compact') || this.hasAttribute('floating'); }
    openPop() {
      if (!this.compact) return;
      clearTimeout(this._popT);
      if (!this.hasAttribute('open')) { this.setAttribute('open', ''); this._openedAt = Date.now(); this.miniBtn.setAttribute('aria-expanded', 'true'); }
    }
    closePop(delay) {
      if (!this.compact) return;
      clearTimeout(this._popT);
      const shut = () => { this.removeAttribute('open'); this.miniBtn.setAttribute('aria-expanded', 'false'); this.deactivate(); };
      if (!delay) { shut(); return; }   // sofort schließen (z. B. nach einem Klick auf eine Knospe)
      this._popT = setTimeout(() => {
        const ae = this.shadowRoot.activeElement;
        if (ae && ae !== this.miniBtn) return;
        shut();
      }, delay);
    }
    attributeChangedCallback(name) {
      if (name === 'open') return; if (this.shadowRoot.firstChild) this.render(); }
    get ctx() { return this.getAttribute('context') || 'standard'; }
    get variant() { return this.getAttribute('variant') === 'scheibe' ? 'scheibe' : 'knospen'; }

    render() {
      const size = parseInt(this.getAttribute('size'), 10) || 240;
      this.style.setProperty('--rh-size', size + 'px');
      const root = this.shadowRoot;
      root.innerHTML = '';
      const st = document.createElement('style'); st.textContent = CSS; root.appendChild(st);

      let holder = root;
      this.miniBtn = null;
      if (this.compact) {
        const pz = parseInt(this.getAttribute('popover-size'), 10) || 200;
        this.style.setProperty('--rh-pop', pz + 'px');
        const btn = document.createElement('button');
        btn.className = 'mini'; btn.type = 'button';
        btn.setAttribute('aria-label', 'reli_hub-Steuerkonsole öffnen'); btn.setAttribute('aria-expanded', 'false');
        const mini = el('svg', { viewBox: `${-VB} ${-VB} ${2 * VB} ${2 * VB}`, 'aria-hidden': 'true' }, btn);
        FUNCS.forEach(f => el('circle', { cx: f.cx, cy: f.cy, r: R, fill: f.color }, mini));
        btn.addEventListener('click', () => {
          // Ein Klick direkt nach dem Öffnen per Überfahren (oder Antippen) soll nicht gleich wieder schließen
          if (this.hasAttribute('open') && Date.now() - (this._openedAt || 0) > 600) this.closePop(0); else this.openPop();
        });
        root.appendChild(btn);
        this.miniBtn = btn;
        const popEl = document.createElement('div');
        popEl.className = 'popover';
        popEl.setAttribute('data-align', this.getAttribute('popover-align') === 'left' ? 'left' : 'right');
        const box = document.createElement('div'); box.className = 'fbox';
        popEl.appendChild(box); root.appendChild(popEl);
        holder = box;
      }
      const svg = el('svg', { viewBox: `${-VB} ${-VB} ${2 * VB} ${2 * VB}`, role: 'img', 'aria-label': 'reli_hub-Steuerkonsole' }, holder);
      this.svg = svg;
      const base = el('g', { class: 'base' }, svg);
      this.baseEls = new Map();
      FUNCS.forEach(f => { this.baseEls.set(f.id, el('circle', { cx: f.cx, cy: f.cy, r: R, fill: f.color }, base)); });
      this.ov = el('g', { class: 'ov' }, svg);

      // Zugängliche Links (für Tastatur und Screenreader) – steuern dieselbe Grafik
      const nav = document.createElement('nav');
      nav.className = 'sr'; nav.setAttribute('aria-label', 'reli_hub');
      FUNCS.forEach(f => {
        [f.id].concat((f.subs || []).map(s => s.id)).forEach(act => {
          const a = document.createElement('a');
          a.href = resolve(act, this.ctx, this).url;
          a.textContent = act.includes('.') ? `${f.label}: ${LABELS[act]}` : f.label;
          a.addEventListener('focus', () => { this.cancelClose(); this.openPop(); this.kbdAction = act; this.activate(f, true); });
          a.addEventListener('blur', () => { this.kbdAction = null; this.scheduleClose(); this.closePop(300); });
          a.addEventListener('click', e => { e.preventDefault(); this.fire(act); });
          nav.appendChild(a);
        });
      });
      root.appendChild(nav);

      svg.addEventListener('pointermove', e => this.onMove(e));
      // Nur die Maus schließt beim Verlassen; ein Finger "verlässt" die Fläche nach jedem Antippen
      svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') this.scheduleClose(); });
      svg.addEventListener('pointerdown', e => this.onDown(e));
      svg.addEventListener('click', e => this.onClick(e));
      this.active = null;
    }

    pt(e) {
      const p = this.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(this.svg.getScreenCTM().inverse());
    }
    exclusive(p) {
      const inside = FUNCS.filter(f => Math.hypot(p.x - f.cx, p.y - f.cy) <= R);
      return inside.length === 1 ? inside[0] : null;
    }
    onMove(e) {
      if (e.pointerType === 'touch') return;
      if (this.ov.contains(e.target)) { this.cancelClose(); return; }
      const hit = this.exclusive(this.pt(e));
      this.svg.style.cursor = hit ? 'pointer' : 'default';
      if (hit) { this.cancelClose(); if (hit !== this.active) this.activate(hit); }
      else this.scheduleClose();
    }
    onDown(e) {
      this._touchAct = false;
      if (e.pointerType === 'mouse' || this.ov.contains(e.target)) return;
      const hit = this.exclusive(this.pt(e));
      if (hit && hit !== this.active) { this.activate(hit); this._touchAct = true; }
      else if (!hit) this.deactivate();
    }
    onClick(e) {
      if (this._touchAct) { this._touchAct = false; return; }
      const t = e.target.closest && e.target.closest('[data-action]');
      if (t && this.ov.contains(t)) this.fire(t.getAttribute('data-action'));
    }
    cancelClose() { clearTimeout(this._closeT); }
    scheduleClose() {
      this.cancelClose();
      this._closeT = setTimeout(() => {
        if (this.shadowRoot.activeElement) return;
        this.deactivate();
      }, CLOSE_DELAY);
    }

    activate(f, fromKbd) {
      if (this.active === f) { this.markKbd(); return; }
      this.active = f;
      FUNCS.forEach(g => this.baseEls.get(g.id).classList.toggle('dim', g === f));
      const ov = this.ov; ov.innerHTML = '';
      const pop = el('g', { class: 'pop' }, ov);
      pop.style.transform = `translate(${f.cx}px,${f.cy}px) scale(1)`;
      const split = f.subs && this.variant === 'scheibe';

      if (split) {
        const [s0, s1] = f.subs;
        el('path', { class: 'half act', 'data-action': s0.id, d: `M${-R} 0 A${R} ${R} 0 0 1 ${R} 0 Z`, fill: f.color, style: `--hl:${f.light}` }, pop);
        el('path', { class: 'half act', 'data-action': s1.id, d: `M${R} 0 A${R} ${R} 0 0 1 ${-R} 0 Z`, fill: f.color, style: `--hl:${f.light}` }, pop);
        el('line', { x1: -R, y1: 0, x2: R, y2: 0, stroke: '#FFFFFF', 'stroke-width': 3, 'pointer-events': 'none' }, pop);
        this.text(pop, s0.label + ' ›', 0, -R * 0.5, 20, f.text, 'lbl');
        this.text(pop, s1.label + ' ›', 0, R * 0.52, 20, f.text, 'lbl');
        const pill = el('g', { class: 'pill act', 'data-action': f.id }, pop);
        const w = Math.max(96, f.label.length * 12 + 34);
        el('rect', { x: -w / 2, y: -18, width: w, height: 36, rx: 18 }, pill);
        this.text(pill, f.label, 0, 1, 21, f.color, 'lbl');
      } else {
        el('circle', { class: 'act main', 'data-action': f.id, r: R, fill: f.color, 'fill-opacity': 0.96 }, pop);
        this.text(pop, f.label, 0, 2, f.label.length > 12 ? 22 : f.label.length > 9 ? 26 : 30, f.text, 'lbl');
      }

      requestAnimationFrame(() => requestAnimationFrame(() => {
        pop.style.transform = `translate(${f.cx + POP * f.ux}px,${f.cy + POP * f.uy}px) scale(${SC})`;
      }));

      if (f.subs && !split) {
        const ang = Math.atan2(f.uy, f.ux);
        const n = f.subs.length, spread = n > 2 ? 0.8 : 0.62;
        f.subs.forEach((s, k) => {
          const a = ang + (n === 1 ? 0 : (k - (n - 1) / 2) * (2 * spread / (n - 1)));
          const dist = R + 26, bx = dist * Math.cos(a), by = dist * Math.sin(a);
          const bud = el('g', { class: 'bud act', 'data-action': s.id, style: `--hl:${f.light}` }, pop);
          bud.style.transform = 'translate(0px,0px) scale(.2)';
          bud.style.opacity = '0';
          el('circle', { r: 31, fill: f.color, stroke: '#FFFFFF', 'stroke-width': 3 }, bud);
          el('path', { d: 'M-6 -10 L5 0 L-6 10', fill: 'none', stroke: f.text, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, bud);
          const lx = 44 * Math.cos(a), ly = 44 * Math.sin(a);
          const anchor = Math.cos(a) > 0.35 ? 'start' : Math.cos(a) < -0.35 ? 'end' : 'middle';
          const t = this.text(bud, s.label, lx, ly + (Math.abs(Math.cos(a)) <= 0.35 ? Math.sign(Math.sin(a)) * 10 : 0), 25, null, 'out');
          t.setAttribute('text-anchor', anchor);
          this.fitLabel(t, f, bx + lx, a, anchor, lx);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            bud.style.transform = `translate(${bx}px,${by}px) scale(1)`;
            bud.style.opacity = '1';
          }));
        });
      }
      this.markKbd();
    }
    // Ragt eine Knospen-Beschriftung über den Bildschirmrand (v. a. mobil), rückt sie
    // unter bzw. über die Knospe und so weit nach innen, dass sie vollständig lesbar bleibt.
    fitLabel(t, f, ux, a, anchor, lx) {
      try {
        const m = this.svg.getScreenCTM(); if (!m) return;
        const k = m.a * SC;
        const px = m.a * (f.cx + POP * f.ux + SC * ux) + m.e;
        const w = t.getComputedTextLength() * k;
        const left = anchor === 'start' ? px : anchor === 'end' ? px - w : px - w / 2;
        const vw = document.documentElement.clientWidth, pad = 8;
        let shift = 0;
        if (left + w > vw - pad) shift = (vw - pad) - (left + w);
        else if (left < pad) shift = pad - left;
        if (!shift) return;
        t.setAttribute('x', lx + shift / k);
        t.setAttribute('y', (Math.sin(a) >= -0.2 ? 1 : -1) * 54);
      } catch (e) { /* Messung nicht möglich – Beschriftung bleibt, wo sie ist */ }
    }
    text(parent, str, x, y, size, fill, cls) {
      const t = el('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, class: cls }, parent);
      if (fill) t.setAttribute('fill', fill);
      t.textContent = str;
      return t;
    }
    markKbd() {
      this.ov.querySelectorAll('.kbd').forEach(n => n.classList.remove('kbd'));
      if (!this.kbdAction) return;
      const n = this.ov.querySelector(`[data-action="${this.kbdAction}"]`);
      if (n) n.classList.add('kbd');
    }
    deactivate() {
      if (!this.active) return;
      this.active = null;
      this.baseEls.forEach(c => c.classList.remove('dim'));
      this.ov.innerHTML = '';
      this.svg.style.cursor = 'default';
    }

    fire(action) {
      const r = resolve(action, this.ctx, this);
      const detail = { action, label: LABELS[action], url: r.url, context: this.ctx };
      this.closePop(0);
      if (r.handler && r.handler(detail) === false) return;
      const ok = this.dispatchEvent(new CustomEvent('relihub-action', { detail, bubbles: true, composed: true, cancelable: true }));
      if (!ok || this.hasAttribute('demo')) return;
      // Bereiche mit Knospen (finden, erstellen, kooperieren) haben keine eigene Zielseite:
      // Ihr Klick löst nur das Ereignis aus (z. B. für eine Erläuterung), navigiert aber nicht.
      if (FUNCS.some(f => f.id === action && f.subs && !f.self)) return;
      if (r.target === '_self') window.location.href = r.url;
      else window.open(r.url, r.target, 'noopener');
    }
  }

  const RelihubSteuerkonsole = {
    version: '0.7.0',
    routes: ROUTES,
    contexts: CONTEXTS,
    functions: FUNCS.map(f => ({ id: f.id, label: f.label, color: f.color, subs: (f.subs || []).map(s => ({ ...s })) })),
    registerContext(name, profile) {
      CONTEXTS[name] = profile || {};
      document.querySelectorAll('relihub-steuerkonsole').forEach(n => { if (n.getAttribute('context') === name) n.render(); });
    },
    resolve(action, context) {
      const dummy = document.createElement('div');
      return resolve(action, context || 'standard', dummy).url;
    }
  };
  window.RelihubSteuerkonsole = RelihubSteuerkonsole;
  if (!customElements.get('relihub-steuerkonsole')) customElements.define('relihub-steuerkonsole', RelihubSteuerkonsoleElement);
})();

