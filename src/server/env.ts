// Leest een .env-bestand voor hosting waar je geen omgevingsvariabelen kunt instellen.
// Variabelen die al bestaan (bijvoorbeeld uit hPanel) winnen altijd. Geen .env is geen fout.
// Zoekvolgorde: de werkmap, dan de map van de app en een paar mappen daarboven. Het eerste .env-bestand wint.
// Zet het bestand nooit in een map die via de webserver te downloaden is (zoals public_html).
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

let geladen = false;

export function laadEnv(): void {
  if (geladen) return;
  geladen = true;
  const mappen: string[] = [process.cwd()];
  let map = process.argv[1] ? dirname(resolve(process.argv[1])) : process.cwd();
  for (let i = 0; i < 5; i++) { mappen.push(map); map = dirname(map); }
  for (const m of new Set(mappen)) {
    const pad = join(m, '.env');
    try {
      if (existsSync(pad) && typeof process.loadEnvFile === 'function') { process.loadEnvFile(pad); return; }
    } catch { /* onleesbaar bestand: negeren */ }
  }
}
