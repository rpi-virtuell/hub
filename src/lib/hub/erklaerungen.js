// Erklärtexte der Steuerkonsole, wörtlich aus Jens' Prototyp 5 (Objekt EX). Ziele der
// „Weiter“-Knöpfe kommen aus konsole-ziele.js, hier steht nur die Beschriftung.
/**
 * @typedef {{ fn: string, titel: string, text: string, knospen?: string[], weiter?: string, mitProfil?: boolean }} Erklaerung
 */

/** @type {Erklaerung} */
export const ERKLAERUNG_START = {
  fn: 'So funktioniert’s',
  titel: 'Wähle einen Bereich der Steuerkonsole',
  text: 'Tippe einen Kreis an oder fahre an seinen äußeren Rand – er springt heraus. Klicke ihn oder eine seiner Knospen an, und hier erfährst du, worum es geht.'
};

/** @type {Record<string, Erklaerung>} */
export const ERKLAERUNGEN = {
  hub: {
    fn: 'reli_hub',
    titel: 'Deine Steuerkonsole',
    text: 'Der reli_hub ist deine Steuerkonsole in der vernetzten Welt der digitalen Religionspädagogik. Überall, wo du dieses Symbol findest, bist du im Netzwerk unterwegs. Dein Profil nimmst du überall hin mit.',
    knospen: ['hub.profil', 'hub.home']
  },
  'hub.profil': {
    fn: 'reli_hub › mein Profil',
    titel: 'Mein Profil',
    text: 'Mit deinem Profil wird der reli_hub zu deinem persönlichen Startplatz: deine Communities, neue Materialien zu deinen Themen und passende Veranstaltungen. Ein Schlüssel öffnet alle angeschlossenen Seiten.',
    weiter: 'Mit Nostr-Schlüssel anmelden'
  },
  'hub.home': {
    fn: 'reli_hub › Home',
    titel: 'Home',
    text: 'Die Startseite des reli_hub – ohne Anmeldung. Hier erfährst du, was der Hub ist und welche Seiten zu ihm gehören.',
    weiter: 'Zum Ökosystem'
  },
  finden: {
    fn: 'finden',
    titel: 'Material und Fortbildungen',
    text: 'Geprüftes, offen lizenziertes Material und digitale Fortbildungen aus ganz Deutschland – an einem Ort auffindbar.',
    knospen: ['finden.material', 'finden.fortbildungen']
  },
  'finden.material': {
    fn: 'finden › Material',
    titel: 'Material',
    text: 'Finde aktuelles, redaktionell geprüftes Material zu deinen Themen und deiner Zielgruppe.',
    weiter: 'Zum Materialpool'
  },
  'finden.fortbildungen': {
    fn: 'finden › Fortbildungen',
    titel: 'Fortbildungen',
    text: 'Entdecke digitale Fortbildungen religionspädagogischer Institute und Communities – deutschlandweit, meist online, in einem gemeinsamen Kalender.',
    weiter: 'Zum Fortbildungskalender'
  },
  erstellen: {
    fn: 'erstellen',
    titel: 'Unterricht vorbereiten, Material entwickeln',
    text: 'Allein am eigenen Schreibtisch oder gemeinsam im Labor: Hier wird aus Material Unterricht – und aus Ideen neues Material.',
    knospen: ['erstellen.schreibtisch', 'erstellen.labor'],
    mitProfil: true
  },
  'erstellen.schreibtisch': {
    fn: 'erstellen › Schreibtisch',
    titel: 'Mein Schreibtisch',
    text: 'Sammle Materialien auf deinem digitalen Schreibtisch, ordne sie, passe sie an und plane daraus deine nächste Lernsequenz.',
    weiter: 'Zum relidesk',
    mitProfil: true
  },
  'erstellen.labor': {
    fn: 'erstellen › Labor',
    titel: 'Unser Labor',
    text: 'Entwickle gemeinsam mit anderen Material weiter, erprobe Neues und hol dir Rückmeldung. Stelle Unfertiges vor und lade zum Mitmachen ein.',
    weiter: 'Ins relilab',
    mitProfil: true
  },
  kooperieren: {
    fn: 'kooperieren',
    titel: 'Mit anderen arbeiten',
    text: 'Finde Menschen und Communities, mit denen du arbeiten möchtest – zu deinen Themen oder für deine Zielgruppe.',
    knospen: ['kooperieren.communities', 'kooperieren.personen']
  },
  'kooperieren.communities': {
    fn: 'kooperieren › Communities',
    titel: 'Communities',
    text: 'Verschaffe dir einen Überblick über religionspädagogische Communities. Suche Verbündete, arbeite mit. Gründe deine eigene Community und suche Mitstreiter_innen.',
    weiter: 'Communities entdecken'
  },
  'kooperieren.personen': {
    fn: 'kooperieren › Personen',
    titel: 'Personen',
    text: 'Entdecke, wer zu deinen Themen arbeitet. Folge Profilen, nimm Kontakt auf – und werde selbst sichtbar.',
    weiter: 'Personen entdecken'
  },
  veroeffentlichen: {
    fn: 'veröffentlichen',
    titel: 'Zeigen, was du hast',
    text: 'Du möchtest einen Lerninhalt im Materialpool anzeigen, eine Veranstaltung bewerben, einen Blogbeitrag veröffentlichen? Hier findest du die Werkzeuge dazu.',
    knospen: [
      'veroeffentlichen.lerninhalte',
      'veroeffentlichen.termin',
      'veroeffentlichen.beitrag'
    ],
    mitProfil: true
  },
  'veroeffentlichen.lerninhalte': {
    fn: 'veröffentlichen › Lerninhalte',
    titel: 'Lerninhalte',
    text: 'Mach dein Material im Materialpool sichtbar: Verweise auf einen Lerninhalt, beschreibe ihn mit Zielgruppe, Thema und Lizenz – und er wird im ganzen Netzwerk gefunden.',
    weiter: 'Lerninhalt eintragen',
    mitProfil: true
  },
  'veroeffentlichen.termin': {
    fn: 'veröffentlichen › Termin',
    titel: 'Termin',
    text: 'Bewirb deine Fortbildung oder Veranstaltung: Einmal eingetragen, erscheint sie im gemeinsamen Kalender und auf allen angeschlossenen Seiten, zu denen sie passt.',
    weiter: 'Termin eintragen',
    mitProfil: true
  },
  'veroeffentlichen.beitrag': {
    fn: 'veröffentlichen › Beitrag',
    titel: 'Beitrag',
    text: 'Schreibe einen Blogbeitrag, berichte aus deiner Praxis oder stelle ein Projekt vor. Dein Beitrag erscheint in deinem Profil und in den Communities, denen du ihn zuordnest.',
    weiter: 'Beitrag schreiben',
    mitProfil: true
  }
};
