// POST /api/regiocheck/  { vak, plaats }  ->  { ok: true, status: 'vrij' | 'bezet' | 'niet' }
import { antwoord, endpoint, nietToegestaan } from '../../server/http';
import { LIMIETEN } from '../../server/limiet';
import { regioStatus } from '../../server/regio';
import { valideerRegiocheck } from '../../server/valideer';

export const prerender = false;

export const POST = endpoint({
  naam: 'regiocheck',
  limiet: LIMIETEN.regiocheck,
  // Een bot die het honeypotveld vult krijgt 'vrij' en niets wordt opgeslagen.
  honeypotAntwoord: { ok: true, status: 'vrij' },
  async verwerk(data) {
    const v = valideerRegiocheck(data);
    if (!v.ok) return antwoord(400, { ok: false, fout: 'ongeldige_invoer', velden: v.fouten });
    return antwoord(200, { ok: true, status: await regioStatus(v.waarde.vak, v.waarde.plaats) });
  }
});
export const ALL = nietToegestaan;
