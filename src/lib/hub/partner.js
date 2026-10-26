// Die zwölf Partner des Ökosystems, Texte wörtlich aus Jens' Prototyp 5 (Liste PARTNERS).
// Adressen am 26.10.2026 per HTTP geprüft; InkRV hat keine erreichbare Seite.
import { MATERIALPOOL_URL, PROTOTYP_URL } from './konsole-ziele.js';

/**
 * @typedef {{ name: string, rolle: string, funktion: 'finden' | 'erstellen' | 'kooperieren' | 'hub', kuerzel: string, url: string | null, text: string, hinweis?: string }} Partner
 */

/** @type {Partner[]} */
export const PARTNER = [
  {
    name: 'rpi-virtuell Materialpool',
    rolle: 'Material finden',
    funktion: 'finden',
    kuerzel: 'MP',
    url: MATERIALPOOL_URL,
    text: 'Offener Materialpool für Schule, Kita, Gemeinde und Bildungsarbeit. Die Materialdaten kommen aus dem Nostr-Netz (edufeed).'
  },
  {
    name: 'rpi-virtuell Fortbildungs­kalender',
    rolle: 'Fortbildungen finden',
    funktion: 'finden',
    kuerzel: 'FK',
    url: '/calendar',
    text: 'Digitale Fortbildungen religionspädagogischer Institute und Communities aus ganz Deutschland in einem gemeinsamen Kalender.'
  },
  {
    name: 'relilab',
    rolle: 'gemeinsam Material entwickeln',
    funktion: 'erstellen',
    kuerzel: 'rl',
    url: 'https://relilab.org/',
    text: 'Netzwerk für religiöses Lehren und Lernen unter dem Vorzeichen der Digitalität: Lernbausteine gestalten, Live-Anlässe, kollegialer Austausch.'
  },
  {
    name: 'relidesk',
    rolle: 'Unterricht am Schreibtisch planen',
    funktion: 'erstellen',
    kuerzel: 'rd',
    url: PROTOTYP_URL + '#relidesk',
    text: 'Digitaler Schreibtisch: Materialien sammeln, ordnen, anpassen und daraus die nächste Unterrichtsstunde planen.',
    hinweis: 'im Prototyp'
  },
  {
    name: 'relimentar',
    rolle: 'Elementarpädagogik',
    funktion: 'kooperieren',
    kuerzel: 're',
    url: 'https://relimentar.de/',
    text: 'Religionspädagogisches Material für Kitas – Krippe, Kindergarten und Hort – mit Fortbildungen und regionalen Anbietern.'
  },
  {
    name: 'narrt',
    rolle: 'antisemitismus- und rassismuskritisch',
    funktion: 'kooperieren',
    kuerzel: 'na',
    url: 'https://narrt.de/',
    text: 'Netzwerk für antisemitismus- und rassismuskritische Religionspädagogik und Theologie: Austauschrunden, Tagungen, Materialkatalog.'
  },
  {
    name: 'reliGlobal',
    rolle: 'Globales Lernen im RU',
    funktion: 'kooperieren',
    kuerzel: 'rG',
    url: 'https://religlobal.org/',
    text: 'Gemeinsame Fachstelle der religionspädagogischen Institute für Globales Lernen: offene Materialien und Fortbildungen für den Religionsunterricht.'
  },
  {
    name: 'Konfi-Arbeit bundesweit',
    rolle: 'konfi-arbeit.de',
    funktion: 'kooperieren',
    kuerzel: 'KA',
    url: 'https://konfi-arbeit.de/',
    text: 'Fortbildungen, Materialien und Praxisimpulse zur evangelischen Konfi-Arbeit für Haupt- und Ehrenamtliche in den Gemeinden.'
  },
  {
    name: 'Friedensarbeit EKD',
    rolle: 'Evangelische Friedensarbeit',
    funktion: 'kooperieren',
    kuerzel: 'FA',
    url: 'https://www.evangelische-friedensarbeit.de/',
    text: 'Dachmarke der Friedensarbeit im Raum der EKD: Nachrichten, Termine, Projekte und Friedensbildung.'
  },
  {
    name: 'InkRV',
    rolle: 'Inklusive Religionspädagogik der Vielfalt',
    funktion: 'kooperieren',
    kuerzel: 'iV',
    url: null,
    text: 'Inklusive Religionspädagogik der Vielfalt. Die Plattform wird gerade überarbeitet und kommt bald wieder ins Ökosystem.',
    hinweis: 'in Überarbeitung'
  },
  {
    name: 'Comenius-Institut',
    rolle: 'Evangelische Bildungsforschung',
    funktion: 'hub',
    kuerzel: 'CI',
    url: 'https://comenius.de/',
    text: 'Evangelische Arbeitsstätte für Erziehungswissenschaft in Münster – Forschung, Netzwerke und Projekte wie FOERBICO, aus dem der reli_hub entsteht.'
  },
  {
    name: 'edufeed',
    rolle: 'offene Bildungsdaten im Nostr-Netz',
    funktion: 'hub',
    kuerzel: 'ef',
    url: 'https://edufeed.org/',
    text: 'Offene Infrastruktur für Bildungsdaten: Relays und Editoren, über die Materialien, Termine und Beiträge im ganzen Ökosystem geteilt werden.'
  }
];
