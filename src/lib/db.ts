// Koppeling tussen de pagina's en de server. Draait in de browser en praat alleen met de eigen endpoints in /api/.
// De database zelf is nooit rechtstreeks bereikbaar. De serverkant staat in src/pages/api/ en src/server/.
const ACTIEF = ['Dakdekkers'];
const TIJDSLIMIET = 10_000;

export type RegioStatus = 'vrij' | 'bezet' | 'niet';

// Tabelnaam (zoals de pagina's die gebruiken) naar endpoint.
const ENDPOINTS: Record<string, string> = {
  scan_aanvragen: '/api/scan/',
  wachtlijst: '/api/wachtlijst/',
  demo_aanvragen: '/api/demo/'
};

const post = (url: string, body: unknown, tijdslimiet = TIJDSLIMIET) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(tijdslimiet)
  });

export async function checkRegio(vak: string, plaats: string): Promise<RegioStatus> {
  try {
    const r = await post('/api/regiocheck/', { vak, plaats });
    if (r.ok) {
      const { status } = await r.json();
      if (status === 'vrij' || status === 'bezet' || status === 'niet') return status;
    }
  } catch { /* val terug op lokale check */ }
  return ACTIEF.includes(vak) ? 'vrij' : 'niet';
}

export async function insert(table: string, row: Record<string, unknown>): Promise<boolean> {
  const url = ENDPOINTS[table];
  if (!url) { console.warn('Onbekende tabel, aanvraag niet opgeslagen', table); return false; }
  try {
    const r = await post(url, row);
    return r.ok;
  } catch { return false; }
}

export type SamBeurt = { van: 'klant' | 'sam'; tekst: string };
export type SamAntwoord =
  | { ok: true; bericht: string; afgerond: boolean; samenvatting: string[] }
  | { ok: false; fout: 'te_veel' | 'druk' | 'niet_beschikbaar' };

/** Vraagt Sam (een AI-model op de server) om het volgende bericht in het gesprek. */
export async function samAntwoord(vak: string, beurten: SamBeurt[]): Promise<SamAntwoord> {
  try {
    const r = await post('/api/sam/', { vak, beurten }, 30_000);
    const j = await r.json().catch(() => null);
    if (r.ok && j?.ok && typeof j.bericht === 'string') {
      return { ok: true, bericht: j.bericht, afgerond: j.afgerond === true, samenvatting: Array.isArray(j.samenvatting) ? j.samenvatting.filter((s: unknown) => typeof s === 'string') : [] };
    }
    if (r.status === 429) return { ok: false, fout: 'te_veel' };
    if (j?.fout === 'druk') return { ok: false, fout: 'druk' };
  } catch { /* netwerkfout of tijdslimiet */ }
  return { ok: false, fout: 'niet_beschikbaar' };
}
