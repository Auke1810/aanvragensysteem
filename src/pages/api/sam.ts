// POST /api/sam/  { vak, beurten: [{ van: 'klant' | 'sam', tekst }] }  ->  200 { ok: true, bericht, afgerond, samenvatting }
// De bezoeker speelt de klant, een echt AI-model (Claude) antwoordt als Sam. De server bewaart het gesprek niet.
import { antwoord, endpoint, nietToegestaan } from '../../server/http';
import { LIMIETEN, ruimte, tel } from '../../server/limiet';
import { SamNietBeschikbaar, vraagSam } from '../../server/sam';
import { valideerSam } from '../../server/valideer';

export const prerender = false;

export const POST = endpoint({
  naam: 'sam',
  limiet: LIMIETEN.sam,
  honeypotAntwoord: { ok: false, fout: 'niet_beschikbaar' },
  async verwerk(data) {
    const v = valideerSam(data);
    if (!v.ok) return antwoord(400, { ok: false, fout: 'ongeldige_invoer', velden: v.fouten });
    // Dagplafond voor alle bezoekers samen, zodat de kosten van het AI-model begrensd blijven.
    if (!ruimte('samDag', LIMIETEN.samDag.max, LIMIETEN.samDag.venster)) return antwoord(503, { ok: false, fout: 'druk' });
    tel('samDag', LIMIETEN.samDag.venster);
    try {
      const u = await vraagSam(v.waarde.vak, v.waarde.beurten);
      return antwoord(200, { ok: true, ...u });
    } catch (e) {
      const r = e instanceof SamNietBeschikbaar ? e.message : (e as Error).name;
      console.error(`[api/sam] fout: ${r}`);
      return antwoord(503, { ok: false, fout: 'niet_beschikbaar' });
    }
  }
});
export const ALL = nietToegestaan;
