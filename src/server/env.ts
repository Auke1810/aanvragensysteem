// Leest een .env-bestand voor hosting waar je geen omgevingsvariabelen kunt instellen.
// Variabelen die al bestaan (bijvoorbeeld uit hPanel) winnen altijd. Geen .env is geen fout.
// Zoekvolgorde: de werkmap en de mappen daarboven, daarna de map van de app en de mappen daarboven.
// Het eerste .env-bestand wint. Zet het bestand nooit in een map die via de webserver te downloaden is.
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

let geladen = false;

function omhoog(start: string, niveaus: number): string[] {
  const uit: string[] = [];
  let map = start;
  for (let i = 0; i <= niveaus; i++) {
    uit.push(map);
    const boven = dirname(map);
    if (boven === map) break;
    map = boven;
  }
  return uit;
}

export function laadEnv(): void {
  if (geladen) return;
  geladen = true;
  const vanaf = process.argv[1] ? dirname(resolve(process.argv[1])) : process.cwd();
  const mappen = new Set([...omhoog(process.cwd(), 6), ...omhoog(vanaf, 6)]);
  for (const m of mappen) {
    const pad = join(m, '.env');
    try {
      if (existsSync(pad) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(pad);
        console.info(`[env] .env geladen: ${pad}`);
        return;
      }
    } catch { /* onleesbaar bestand: negeren */ }
  }
  // Alleen de mappen loggen, nooit de inhoud. Handig als een sleutel ontbreekt.
  console.info(`[env] geen .env gevonden in: ${[...mappen].join(', ')}`);
}
