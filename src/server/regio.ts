// Regiocheck: dezelfde logica als de Postgres-functie check_regio in supabase/001_init.sql.
//  * vak niet actief of onbekend: 'niet'
//  * plaats of postcode begint met een bezette regio van dat vak: 'bezet'
//  * anders: 'vrij'
import type { RowDataPacket } from 'mysql2';
import { db } from './db';

export type RegioStatus = 'vrij' | 'bezet' | 'niet';

// LEFT(...) = ... in plaats van LIKE, zodat tekens als % of _ in bezette_regios.regio nooit als jokerteken werken.
const SQL = `
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM vakken WHERE naam = ? AND actief = 1) THEN 'niet'
    WHEN EXISTS (
      SELECT 1 FROM bezette_regios b
      WHERE b.vak = ? AND LEFT(LOWER(TRIM(?)), CHAR_LENGTH(TRIM(b.regio))) = LOWER(TRIM(b.regio))
    ) THEN 'bezet'
    ELSE 'vrij'
  END AS status`;

export async function regioStatus(vak: string, plaats: string): Promise<RegioStatus> {
  const [rows] = await db().execute<RowDataPacket[]>(SQL, [vak, vak, plaats]);
  const s = rows[0]?.status;
  if (s === 'vrij' || s === 'bezet' || s === 'niet') return s;
  throw new Error('onverwachte uitkomst regiocheck');
}
