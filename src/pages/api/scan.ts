// POST /api/scan/  (velden van het scanformulier)  ->  201 { ok: true }
import { randomUUID } from 'node:crypto';
import { db } from '../../server/db';
import { antwoord, endpoint, nietToegestaan } from '../../server/http';
import { LIMIETEN, nummerSleutel, ruimte, tel } from '../../server/limiet';
import { regioStatus } from '../../server/regio';
import { valideerScan } from '../../server/valideer';

export const prerender = false;

const SQL = `INSERT INTO scan_aanvragen
  (id, created_at, vak, plaats, regio_status, bedrijf, website, voornaam, mobiel, email,
   offertes_per_jaar, offerte_opvolging, oud_klanten, toestemming_proefaanvraag, toestemming_whatsapp, bron, status)
  VALUES (?, UTC_TIMESTAMP(3), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nieuw')`;

export const POST = endpoint({
  naam: 'scan',
  limiet: LIMIETEN.scan,
  honeypotAntwoord: { ok: true },
  async verwerk(data) {
    const v = valideerScan(data);
    if (!v.ok) return antwoord(400, { ok: false, fout: 'ongeldige_invoer', velden: v.fouten });
    const r = v.waarde;
    const nummer = `scanNummer:${nummerSleutel(r.mobiel)}`;
    if (!ruimte(nummer, LIMIETEN.scanNummer.max, LIMIETEN.scanNummer.venster)) {
      return antwoord(429, { ok: false, fout: 'nummer_al_aangevraagd' });
    }
    // De regiostatus bepaalt de server zelf. Een waarde uit de browser wordt genegeerd.
    const regio = await regioStatus(r.vak, r.plaats);
    await db().execute(SQL, [
      randomUUID(), r.vak, r.plaats, regio, r.bedrijf, r.website, r.voornaam, r.mobiel, r.email,
      r.offertes_per_jaar, r.offerte_opvolging, r.oud_klanten, r.toestemming_proefaanvraag ? 1 : 0, r.toestemming_whatsapp ? 1 : 0, r.bron
    ]);
    tel(nummer, LIMIETEN.scanNummer.venster);
    return antwoord(201, { ok: true });
  }
});
export const ALL = nietToegestaan;
