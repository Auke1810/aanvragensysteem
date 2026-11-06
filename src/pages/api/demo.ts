// POST /api/demo/  { vak, mobiel, toestemming: true }  ->  201 { ok: true }
import { db } from '../../server/db';
import { antwoord, endpoint, nietToegestaan } from '../../server/http';
import { LIMIETEN, nummerSleutel, ruimte, tel } from '../../server/limiet';
import { valideerDemo } from '../../server/valideer';

export const prerender = false;

const SQL = `INSERT INTO demo_aanvragen (created_at, vak, mobiel, toestemming) VALUES (UTC_TIMESTAMP(3), ?, ?, 1)`;

export const POST = endpoint({
  naam: 'demo',
  limiet: LIMIETEN.demo,
  honeypotAntwoord: { ok: true },
  async verwerk(data) {
    const v = valideerDemo(data);
    if (!v.ok) return antwoord(400, { ok: false, fout: 'ongeldige_invoer', velden: v.fouten });
    const r = v.waarde;
    const nummer = `demoNummer:${nummerSleutel(r.mobiel)}`;
    if (!ruimte(nummer, LIMIETEN.demoNummer.max, LIMIETEN.demoNummer.venster)) {
      return antwoord(429, { ok: false, fout: 'nummer_al_aangevraagd' });
    }
    await db().execute(SQL, [r.vak, r.mobiel]);
    tel(nummer, LIMIETEN.demoNummer.venster);
    return antwoord(201, { ok: true });
  }
});
export const ALL = nietToegestaan;
