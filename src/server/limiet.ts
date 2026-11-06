// Spamlimiet per IP, in het geheugen van de Node-app.
// Er wordt niets in de database of op schijf bewaard, dus ook geen IP-adressen. Bij een herstart begint de teller opnieuw.
// Gedeeld IP (bijvoorbeeld een kantoor) deelt ook de teller. De grenzen staan hieronder en zijn ruim voor echte bezoekers.
import { createHash } from 'node:crypto';

const MIN = 60_000;
const UUR = 60 * MIN;
export const LIMIETEN = {
  // per IP
  regiocheck: { max: 60, venster: 10 * MIN },
  scan: { max: 5, venster: UUR },
  wachtlijst: { max: 5, venster: UUR },
  demo: { max: 3, venster: UUR },
  // per mobiel nummer: voorkomt dat iemand een ander nummer steeds laat appen (alleen geslaagde aanvragen tellen)
  scanNummer: { max: 2, venster: 24 * UUR },
  demoNummer: { max: 1, venster: 24 * UUR }
} as const;

type Item = { tijden: number[]; tot: number };
const opslag = new Map<string, Item>();
const MAX_SLEUTELS = 10_000;

function opruimen(nu: number) {
  if (opslag.size <= MAX_SLEUTELS) return;
  for (const [k, v] of opslag) if (v.tot < nu) opslag.delete(k);
  // Nog te vol: gooi de oudste 10% weg.
  if (opslag.size > MAX_SLEUTELS) {
    let n = Math.ceil(MAX_SLEUTELS / 10);
    for (const k of opslag.keys()) { opslag.delete(k); if (--n <= 0) break; }
  }
}

function recent(key: string, venster: number, nu: number): number[] {
  const item = opslag.get(key);
  if (!item) return [];
  const tijden = item.tijden.filter((t) => nu - t < venster);
  if (tijden.length) item.tijden = tijden; else opslag.delete(key);
  return tijden;
}

/** Is er nog ruimte? Telt niet mee. */
export function ruimte(key: string, max: number, venster: number, nu = Date.now()): boolean {
  return recent(key, venster, nu).length < max;
}

/** Telt een gebeurtenis mee. */
export function tel(key: string, venster: number, nu = Date.now()): void {
  opruimen(nu);
  const tijden = recent(key, venster, nu);
  tijden.push(nu);
  opslag.set(key, { tijden, tot: nu + venster });
}

/** Controleert en telt in één keer. false = limiet bereikt. */
export function toestaan(key: string, max: number, venster: number, nu = Date.now()): boolean {
  if (!ruimte(key, max, venster, nu)) return false;
  tel(key, venster, nu);
  return true;
}

/** Versimpeld nummer om dubbele aanvragen te herkennen (06..., +316..., 00316... worden gelijk). Het nummer zelf wordt niet bewaard, alleen een korte hash. */
export function nummerSleutel(mobiel: string): string {
  let d = mobiel.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '31' + d.slice(1);
  return createHash('sha256').update(d).digest('hex').slice(0, 24);
}
