// Kleine Supabase-client zonder extra bibliotheek: alleen fetch, dus nauwelijks JavaScript.
const URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.PUBLIC_SUPABASE_KEY as string | undefined;
const ACTIEF = ['Dakdekkers'];

const headers = () => ({ apikey: KEY ?? '', 'Content-Type': 'application/json' });

export type RegioStatus = 'vrij' | 'bezet' | 'niet';

export async function checkRegio(vak: string, plaats: string): Promise<RegioStatus> {
  if (URL && KEY) {
    try {
      const r = await fetch(`${URL}/rest/v1/rpc/check_regio`, { method: 'POST', headers: headers(), body: JSON.stringify({ p_vak: vak, p_plaats: plaats }) });
      if (r.ok) return (await r.json()) as RegioStatus;
    } catch { /* val terug op lokale check */ }
  }
  return ACTIEF.includes(vak) ? 'vrij' : 'niet';
}

export async function insert(table: string, row: Record<string, unknown>): Promise<boolean> {
  if (!URL || !KEY) { console.warn('Supabase niet ingesteld, aanvraag niet opgeslagen', table, row); return false; }
  try {
    const r = await fetch(`${URL}/rest/v1/${table}`, { method: 'POST', headers: { ...headers(), Prefer: 'return=minimal' }, body: JSON.stringify(row) });
    return r.ok;
  } catch { return false; }
}
