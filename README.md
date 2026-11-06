# aanvragensysteem.nl

De website van Het Aanvragensysteem, gebouwd met [Astro](https://astro.build). De pagina's worden vooraf gebouwd als platte HTML. Alleen de formulier-endpoints in `src/pages/api/` draaien op een Node-server, met MySQL als database. Het ontwerp komt uit Claude Design, de inhoud uit de PRD van 30 september 2026.

## Lokaal draaien

Je hebt Node.js 22 of nieuwer nodig.

```bash
npm install
npm run dev        # ontwikkelserver op http://localhost:4321
npm run build      # maakt de site in dist/ (dist/client = pagina's, dist/server/entry.mjs = Node-app)
node dist/server/entry.mjs   # start de gebouwde site, met de endpoints, op http://localhost:4321
```

De pagina's werken zonder database. Voor de formulieren en de regiocheck heb je een lokale MySQL of MariaDB nodig: maak een lege database, importeer `db/001_init.mysql.sql`, kopieer `.env.example` naar `.env` en vul de `DB_`-gegevens in. Zonder database antwoorden de endpoints met een foutmelding en toont de regiocheck de terugval (alleen dakdekkers vrij).

## Structuur

| Map | Wat erin staat |
|---|---|
| `src/pages/` | Eén bestand per pagina. De bestandsnaam is de URL (`prijs.astro` wordt `/prijs/`) |
| `src/components/` | Header, footer, knop, telefoon met Sam, regiocheck, rekensom, live-label |
| `src/layouts/Base.astro` | De HTML-basis van elke pagina: titel, meta, schema, header en footer |
| `src/styles/` | Designtokens (kleuren, typografie) en algemene stijlen |
| `src/config.ts` | Contactgegevens, Founding Partner-teller, vakken en routes. **Hier vul je de placeholders in** |
| `src/lib/db.ts` | Draait in de browser en roept alleen de eigen endpoints in `/api/` aan (alleen `fetch`) |
| `src/pages/api/` | De endpoints: `scan`, `regiocheck`, `wachtlijst`, `demo`. Draaien op de server |
| `src/server/` | Serverkant: databaseverbinding, invoercontrole, spamlimiet, regiocheck-query. Nooit importeren in code die in de browser draait |
| `public/` | Bestanden die ongewijzigd online gaan: `.htaccess`, `llms.txt`, favicon |
| `src/pages/robots.txt.ts` | Maakt `robots.txt`. Volgt de schakelaar `INDEXEREN` in `src/config.ts` |
| `db/001_init.mysql.sql` | Het databaseschema voor MySQL 8 of MariaDB 10.5 en nieuwer |

## Database (MySQL)

Schema: `db/001_init.mysql.sql`. Importeer het in phpMyAdmin in de database die je in hPanel hebt gemaakt. Het mag vaker, bestaande tabellen en gegevens blijven staan. Tabellen:

- `scan_aanvragen`: elke scanaanvraag uit het formulier op /scan/
- `wachtlijst`: e-mailadressen uit de regiocheck (regio bezet of vak nog niet actief)
- `demo_aanvragen`: telefoonnummers uit de demo "Speel zelf de klant"
- `vakken`: welke vakken actief zijn (nu alleen Dakdekkers)
- `bezette_regios`: met de hand bijhouden welke regio per vak bezet is (bijv. vak Dakdekkers, regio `8911`). Een bezoeker is bezet als zijn postcode of plaats met deze regio begint
- `instellingen`: `founding_partners_over` (de site leest dit nog niet; de teller staat in `src/config.ts`)

Bezoekers praten nooit rechtstreeks met de database. De endpoints controleren de invoer, gebruiken prepared statements en slaan alleen op. Alle tijden staan in UTC.

**Omgevingsvariabelen** (hPanel op Hostinger, `.env` lokaal, zie `.env.example`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Optioneel: `DB_SSL` en `TRUST_PROXY_HOPS`. Er staan geen geheimen in de code.

**Spamlimiet** (in `src/server/limiet.ts`, in het geheugen, niets wordt bewaard): per IP maximaal 5 scans per uur, 5 wachtlijstregels per uur, 3 demo's per uur en 60 regiochecks per 10 minuten. Per mobiel nummer maximaal 2 scans en 1 demo per 24 uur. Het veld `bedrijfsnummer` is de honeypot: wie dat invult krijgt "gelukt" terug en er wordt niets opgeslagen. `TRUST_PROXY_HOPS` (standaard 1) is het aantal proxies voor de Node-app, nodig om het echte IP van de bezoeker te lezen.

**Volgende stap, Sam koppelen:** een webhook of een n8n-workflow die nieuwe rijen in `scan_aanvragen` en `demo_aanvragen` oppikt en het WhatsApp-bericht verstuurt. Dat is een volgend blok.

## Online zetten op Hostinger

De site draait als Node.js-app op het Hostinger-pakket (Astro met de Node-adapter, `mode: standalone`). Instellingen in hPanel volgens de Hostinger-documentatie voor Astro: type `astro`, build-script `build`, output `dist`, entry file `server/entry.mjs`, Node 22.23.4 of nieuwer. Online via de GitHub-koppeling van Hostinger, met een privé-repository. Databasegegevens zet je in hPanel als omgevingsvariabelen. Het stappenplan (zie de PRD) beschrijft de volgorde.

`.github/workflows/deploy.yml` (FTP-upload van een statische map) past hier niet meer bij en wordt in een volgend blok vervangen of verwijderd.

`public/.htaccess` hoort bij een statische Apache-site. Of Hostinger het ook voor een Node.js-app gebruikt (https-redirect, www-redirect, cacheregels), moet nog getest worden op Hostinger.

Domeinen: zet aanvragensysteem.be en aanvraagsysteem.nl in hPanel als doorverwijzing naar https://aanvragensysteem.nl, en oudeoffertes.nl naar https://aanvragensysteem.nl/oude-offertes/.

## Nog in te vullen

- Telefoonnummer en WhatsApp-nummer (nu placeholder +31 85 000 00 00) in `src/config.ts`
- SIRET, adres en werktijden (contactpagina en footer)
- Juridische pagina's: privacy, voorwaarden, AI en gegevens, wettelijke vermeldingen
- Kennisbank (/kennisbank/), staat in de PRD maar nog niet in het ontwerp
- Video en extra foto's op Over Auke

## Zoekmachines (noindex)

In `src/config.ts` staat `INDEXEREN`. Zolang die op `false` staat, krijgt elke pagina `noindex` en blokkeert `robots.txt` alles. Zet hem op `true` op de dag dat de site publiek mag, commit en push. Dan verdwijnt de noindex, komt de sitemap in `robots.txt` en krijgen de pagina's weer een canonical-link.
