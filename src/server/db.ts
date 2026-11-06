// Verbinding met MySQL of MariaDB. Alleen op de server gebruiken, nooit in code die in de browser draait.
// De gegevens komen uit omgevingsvariabelen (hPanel op Hostinger, .env lokaal). Zie .env.example.
import mysql from 'mysql2/promise';
import { getSecret } from 'astro:env/server';

export class DbNietIngesteld extends Error {
  name = 'DbNietIngesteld';
}

let pool: mysql.Pool | undefined;

export function db(): mysql.Pool {
  if (pool) return pool;
  const host = getSecret('DB_HOST');
  const database = getSecret('DB_NAME');
  const user = getSecret('DB_USER');
  const password = getSecret('DB_PASSWORD');
  if (!host || !database || !user || password === undefined) throw new DbNietIngesteld('DB_HOST, DB_NAME, DB_USER of DB_PASSWORD ontbreekt');
  pool = mysql.createPool({
    host,
    port: Number(getSecret('DB_PORT') || 3306),
    database,
    user,
    password,
    charset: 'utf8mb4_unicode_ci',
    // Gedeelde hosting laat vaak maar weinig gelijktijdige verbindingen toe.
    connectionLimit: 4,
    queueLimit: 20,
    waitForConnections: true,
    connectTimeout: 5000,
    ssl: getSecret('DB_SSL') === 'true' ? {} : undefined
  });
  return pool;
}
