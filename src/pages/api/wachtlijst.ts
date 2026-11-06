// POST /api/wachtlijst/  { vak, plaats, email, soort: 'bezet' | 'niet_actief' }  ->  201 { ok: true }
import { db } from '../../server/db';
import { antwoord, endpoint, nietToegestaan } from '../../server/http';
import { LIMIETEN } from '../../server/limiet';
import { valideerWachtlijst } from '../../server/valideer';

export const prerender = false;

const SQL = `INSERT INTO wachtlijst (created_at, vak, plaats, email, soort) VALUES (UTC_TIMESTAMP(3), ?, ?, ?, ?)`;

export const POST = endpoint({
  naam: 'wachtlijst',
  limiet: LIMIETEN.wachtlijst,
  honeypotAntwoord: { ok: true },
  async verwerk(data) {
    const v = valideerWachtlijst(data);
    if (!v.ok) return antwoord(400, { ok: false, fout: 'ongeldige_invoer', velden: v.fouten });
    const r = v.waarde;
    await db().execute(SQL, [r.vak, r.plaats, r.email, r.soort]);
    return antwoord(201, { ok: true });
  }
});
export const ALL = nietToegestaan;
