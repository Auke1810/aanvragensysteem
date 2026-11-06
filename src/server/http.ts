// Gedeelde hulpjes voor de endpoints in src/pages/api/.
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { DbNietIngesteld } from './db';
import { toestaan } from './limiet';
import { honeypotGevuld } from './valideer';

const KOP = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};
const MAX_BYTES = 16 * 1024;
const VERBINDINGSFOUTEN = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_CON_COUNT_ERROR', 'ER_USER_LIMIT_REACHED']);

export const antwoord = (status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...KOP, ...extra } });

export const nietToegestaan = () => antwoord(405, { ok: false, fout: 'methode_niet_toegestaan' }, { Allow: 'POST' });

/** Een browser van een andere site mag hier niet posten. Verzoeken zonder Origin (curl, servers) laten we door, de limiet vangt misbruik op. */
function zelfdeHerkomst(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  let host: string;
  try { host = new URL(origin).host; } catch { return false; }
  const eigen = [request.headers.get('host'), ...(request.headers.get('x-forwarded-host') ?? '').split(',')]
    .map((h) => (h ?? '').trim()).filter(Boolean);
  return eigen.includes(host);
}

/**
 * IP van de bezoeker. Achter de proxy van Hostinger staat het echte IP als laatste item in X-Forwarded-For.
 * TRUST_PROXY_HOPS (standaard 1) is het aantal proxies dat we vertrouwen. Zet op 0 als er geen proxy voor staat.
 * Het eerste item negeren we, want dat kan een bezoeker zelf meesturen.
 */
export function clientIp(request: Request, socketIp?: string): string {
  const hops = Number(getSecret('TRUST_PROXY_HOPS') ?? '1');
  const xff = request.headers.get('x-forwarded-for');
  if (hops > 0 && xff) {
    const delen = xff.split(',').map((s) => s.trim()).filter(Boolean);
    const ip = delen[delen.length - hops] ?? delen[0];
    if (ip) return ip.slice(0, 64);
  }
  return (socketIp || 'onbekend').slice(0, 64);
}

type Lees = { ok: true; data: Record<string, unknown> } | { ok: false; status: number; fout: string };

async function leesJson(request: Request): Promise<Lees> {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return { ok: false, status: 415, fout: 'alleen_json' };
  const lengte = Number(request.headers.get('content-length') ?? '0');
  if (lengte > MAX_BYTES) return { ok: false, status: 413, fout: 'te_groot' };
  // Lees met een grens, ook als er geen Content-Length is.
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400, fout: 'leeg' };
  const delen: Uint8Array[] = [];
  let totaal = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    totaal += value.byteLength;
    if (totaal > MAX_BYTES) { await reader.cancel().catch(() => {}); return { ok: false, status: 413, fout: 'te_groot' }; }
    delen.push(value);
  }
  let json: unknown;
  try { json = JSON.parse(Buffer.concat(delen).toString('utf8')); } catch { return { ok: false, status: 400, fout: 'ongeldige_json' }; }
  if (json === null || typeof json !== 'object' || Array.isArray(json)) return { ok: false, status: 400, fout: 'ongeldige_json' };
  return { ok: true, data: json as Record<string, unknown> };
}

type Opties = {
  naam: string;
  limiet: { max: number; venster: number };
  /** Voert de aanvraag uit na controle van herkomst, limiet en JSON. */
  verwerk: (data: Record<string, unknown>, ctx: { ip: string }) => Promise<Response>;
  /** Bij een gevulde honeypot: doen alsof het gelukt is, zonder iets op te slaan. */
  honeypotAntwoord: Record<string, unknown>;
};

export function endpoint(o: Opties): APIRoute {
  return async ({ request, clientAddress }) => {
    try {
      if (!zelfdeHerkomst(request)) return antwoord(403, { ok: false, fout: 'niet_toegestaan' });
      let socketIp: string | undefined;
      try { socketIp = clientAddress; } catch { /* geen adres beschikbaar */ }
      const ip = clientIp(request, socketIp);
      if (!toestaan(`${o.naam}:${ip}`, o.limiet.max, o.limiet.venster)) {
        return antwoord(429, { ok: false, fout: 'te_veel_verzoeken' }, { 'Retry-After': String(Math.ceil(o.limiet.venster / 1000)) });
      }
      const gelezen = await leesJson(request);
      if (!gelezen.ok) return antwoord(gelezen.status, { ok: false, fout: gelezen.fout });
      if (honeypotGevuld(gelezen.data)) return antwoord(200, o.honeypotAntwoord);
      return await o.verwerk(gelezen.data, { ip });
    } catch (e) {
      // Nooit de invoer of databasetekst loggen: die kan persoonsgegevens bevatten.
      const code = (e as { code?: string }).code ?? (e as Error).name;
      console.error(`[api/${o.naam}] fout: ${code}`);
      if (e instanceof DbNietIngesteld || VERBINDINGSFOUTEN.has(code)) return antwoord(503, { ok: false, fout: 'niet_beschikbaar' });
      return antwoord(500, { ok: false, fout: 'serverfout' });
    }
  };
}

