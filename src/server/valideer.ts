// Invoercontrole aan de serverkant. De browser is nooit de enige controle.
// Teksten worden bijgesneden op spaties, tellen in tekens (zoals CHAR_LENGTH in MySQL) en mogen geen stuurtekens bevatten.
import { VAKKEN } from '../config';
import { DEMO_VAKKEN, MAX_KLANT_BERICHTEN, MAX_TEKENS_KLANT, type Beurt } from '../lib/samVakken';

export type Fouten = Record<string, string>;
export type Uitkomst<T> = { ok: true; waarde: T } | { ok: false; fouten: Fouten };

const STUURTEKENS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MOBIEL_TEKENS = /^\+?[0-9 ()./-]+$/;
const BRON = /^[A-Za-z0-9._ -]{1,60}$/;
const GEVAARLIJK_SCHEMA = /^\s*(javascript|data|vbscript|file):/i;

const lengte = (s: string) => Array.from(s).length;

type Opties = { min?: number; max: number; verplicht?: boolean };

/** Leest een tekstveld. Geeft null terug voor een leeg optioneel veld. Zet bij een fout een melding in `fouten`. */
function tekst(data: Record<string, unknown>, naam: string, o: Opties, fouten: Fouten): string | null {
  const ruw = data[naam];
  if (ruw === undefined || ruw === null || (typeof ruw === 'string' && ruw.trim() === '')) {
    if (o.verplicht) fouten[naam] = 'verplicht';
    return null;
  }
  if (typeof ruw !== 'string') { fouten[naam] = 'ongeldig'; return null; }
  const s = ruw.trim();
  if (STUURTEKENS.test(s)) { fouten[naam] = 'ongeldig'; return null; }
  const n = lengte(s);
  if (n < (o.min ?? 1) || n > o.max) { fouten[naam] = 'lengte'; return null; }
  return s;
}

function keuze<T extends string>(data: Record<string, unknown>, naam: string, toegestaan: readonly T[], verplicht: boolean, fouten: Fouten): T | null {
  const s = tekst(data, naam, { max: 40, verplicht }, fouten);
  if (s === null) return null;
  if (!(toegestaan as readonly string[]).includes(s)) { fouten[naam] = 'ongeldig'; return null; }
  return s as T;
}

function email(data: Record<string, unknown>, fouten: Fouten): string | null {
  const s = tekst(data, 'email', { max: 160, verplicht: true }, fouten);
  if (s !== null && !EMAIL.test(s)) { fouten.email = 'ongeldig'; return null; }
  return s;
}

function mobiel(data: Record<string, unknown>, fouten: Fouten): string | null {
  const s = tekst(data, 'mobiel', { min: 6, max: 30, verplicht: true }, fouten);
  if (s === null) return null;
  const cijfers = s.replace(/\D/g, '').length;
  if (!MOBIEL_TEKENS.test(s) || cijfers < 6 || cijfers > 16) { fouten.mobiel = 'ongeldig'; return null; }
  return s;
}

function vak(data: Record<string, unknown>, fouten: Fouten): string | null {
  return keuze(data, 'vak', VAKKEN, true, fouten);
}

function waar(data: Record<string, unknown>, naam: string, fouten: Fouten): boolean {
  const v = data[naam];
  if (v === undefined || v === null) return false;
  if (typeof v !== 'boolean') { fouten[naam] = 'ongeldig'; return false; }
  return v;
}

const klaar = <T>(fouten: Fouten, waarde: T): Uitkomst<T> => (Object.keys(fouten).length ? { ok: false, fouten } : { ok: true, waarde });

/** Honeypot: mensen zien het veld `bedrijfsnummer` niet, bots vullen het wel in. */
export function honeypotGevuld(data: Record<string, unknown>): boolean {
  const v = data.bedrijfsnummer;
  if (v === undefined || v === null || v === false) return false;
  return !(typeof v === 'string' && v.trim() === '');
}

export type Regiocheck = { vak: string; plaats: string };
export function valideerRegiocheck(data: Record<string, unknown>): Uitkomst<Regiocheck> {
  const fouten: Fouten = {};
  // Bij de regiocheck beslist de database of een vak bekend en actief is (onbekend geeft 'niet').
  const v = tekst(data, 'vak', { max: 80, verplicht: true }, fouten);
  const plaats = tekst(data, 'plaats', { max: 80, verplicht: true }, fouten);
  return klaar(fouten, { vak: v ?? '', plaats: plaats ?? '' });
}

export const OPVOLGING = ['ik bel na', 'soms', 'nooit'] as const;
export const OUD_KLANTEN = ['niets', 'soms iets', 'vast contact'] as const;

export type Scan = {
  vak: string; plaats: string; bedrijf: string | null; website: string | null; voornaam: string; mobiel: string; email: string;
  offertes_per_jaar: string | null; offerte_opvolging: string | null; oud_klanten: string | null;
  toestemming_proefaanvraag: boolean; toestemming_whatsapp: boolean; bron: string | null;
};
export function valideerScan(data: Record<string, unknown>): Uitkomst<Scan> {
  const fouten: Fouten = {};
  const v = vak(data, fouten);
  const plaats = tekst(data, 'plaats', { max: 80, verplicht: true }, fouten);
  const bedrijf = tekst(data, 'bedrijf', { max: 120 }, fouten);
  let website = tekst(data, 'website', { max: 200 }, fouten);
  if (website !== null && (/\s/.test(website) || GEVAARLIJK_SCHEMA.test(website))) { fouten.website = 'ongeldig'; website = null; }
  const voornaam = tekst(data, 'voornaam', { max: 80, verplicht: true }, fouten);
  const m = mobiel(data, fouten);
  const mail = email(data, fouten);
  const offertes = tekst(data, 'offertes_per_jaar', { max: 20 }, fouten);
  const opvolging = keuze(data, 'offerte_opvolging', OPVOLGING, false, fouten);
  const oud = keuze(data, 'oud_klanten', OUD_KLANTEN, false, fouten);
  const proef = waar(data, 'toestemming_proefaanvraag', fouten);
  const wa = waar(data, 'toestemming_whatsapp', fouten);
  // `bron` komt uit de adresbalk (?bron=...) en is dus vrij invulbaar. Ongeldige waarden worden genegeerd in plaats van geweigerd.
  const bronRuw = typeof data.bron === 'string' ? data.bron.trim() : '';
  const bron = BRON.test(bronRuw) ? bronRuw : null;
  return klaar(fouten, {
    vak: v ?? '', plaats: plaats ?? '', bedrijf, website, voornaam: voornaam ?? '', mobiel: m ?? '', email: mail ?? '',
    offertes_per_jaar: offertes, offerte_opvolging: opvolging, oud_klanten: oud, toestemming_proefaanvraag: proef, toestemming_whatsapp: wa, bron
  });
}

export type Wachtlijst = { vak: string; plaats: string; email: string; soort: 'bezet' | 'niet_actief' };
export function valideerWachtlijst(data: Record<string, unknown>): Uitkomst<Wachtlijst> {
  const fouten: Fouten = {};
  const v = vak(data, fouten);
  const plaats = tekst(data, 'plaats', { max: 80, verplicht: true }, fouten);
  const mail = email(data, fouten);
  const soort = keuze(data, 'soort', ['bezet', 'niet_actief'] as const, true, fouten);
  return klaar(fouten, { vak: v ?? '', plaats: plaats ?? '', email: mail ?? '', soort: soort ?? 'bezet' });
}

export type Demo = { vak: string; mobiel: string };
export function valideerDemo(data: Record<string, unknown>): Uitkomst<Demo> {
  const fouten: Fouten = {};
  const v = vak(data, fouten);
  const m = mobiel(data, fouten);
  if (data.toestemming !== true) fouten.toestemming = 'verplicht';
  return klaar(fouten, { vak: v ?? '', mobiel: m ?? '' });
}

export type SamVerzoek = { vak: string; beurten: Beurt[] };
/**
 * Het gesprek met Sam zoals de browser het stuurt, zonder de vaste begroeting. Moet beginnen en eindigen met een bericht van de klant,
 * en elkaar afwisselen. Spaties en regeleinden worden samengevoegd, stuurtekens zijn niet toegestaan.
 */
export function valideerSam(data: Record<string, unknown>): Uitkomst<SamVerzoek> {
  const fouten: Fouten = {};
  const v = keuze(data, 'vak', Object.keys(DEMO_VAKKEN), true, fouten);
  const ruw = data.beurten;
  const beurten: Beurt[] = [];
  if (!Array.isArray(ruw) || ruw.length < 1 || ruw.length > 2 * MAX_KLANT_BERICHTEN - 1 || ruw.length % 2 === 0) {
    fouten.beurten = 'lengte';
  } else {
    for (let i = 0; i < ruw.length; i++) {
      const b = ruw[i] as { van?: unknown; tekst?: unknown } | null;
      const verwacht = i % 2 === 0 ? 'klant' : 'sam';
      if (b === null || typeof b !== 'object' || b.van !== verwacht || typeof b.tekst !== 'string') { fouten.beurten = 'ongeldig'; break; }
      const t = b.tekst.replace(/\s+/g, ' ').trim();
      const max = verwacht === 'klant' ? MAX_TEKENS_KLANT : 600;
      if (t === '' || STUURTEKENS.test(t) || lengte(t) > max) { fouten.beurten = 'ongeldig'; break; }
      beurten.push({ van: verwacht, tekst: t });
    }
  }
  return klaar(fouten, { vak: v ?? '', beurten });
}
