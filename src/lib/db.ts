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

const post = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIJDSLIMIET)
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
