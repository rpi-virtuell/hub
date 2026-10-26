// Typen für Jens' Steuerkonsole (static/steuerkonsole/relihub-steuerkonsole.js), damit die
// Hub-Dateien unter `checkJs`/`strict` sauber sind. Spiegelt die eingebaute Dokumentation des Skripts.
export interface RelihubAktionDetail {
  action: string;
  label: string;
  url: string;
  context: string;
}

export interface RelihubKontextprofil {
  target?: '_self' | '_blank';
  baseUrl?: string;
  params?: Record<string, string | string[]>;
  actions?: Record<
    string,
    {
      href?: string;
      params?: Record<string, string | string[]>;
      target?: string;
      handler?: (d: RelihubAktionDetail) => boolean | void;
    }
  >;
  handler?: (d: RelihubAktionDetail) => boolean | void;
}

export interface RelihubFunktion {
  id: string;
  label: string;
  color: string;
  subs: { id: string; label: string }[];
}

export interface RelihubSteuerkonsoleApi {
  version: string;
  routes: Record<string, string>;
  contexts: Record<string, RelihubKontextprofil>;
  functions: RelihubFunktion[];
  registerContext(name: string, profil: RelihubKontextprofil): void;
  resolve(action: string, context?: string): string;
}

declare global {
  interface Window {
    RelihubSteuerkonsole?: RelihubSteuerkonsoleApi;
  }
}
