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
| `src/pages/api/` | De endpoints: `scan`, `regiocheck`, `wachtlijst`, `demo` en `sam`. Draaien op de server |
| `src/server/` | Serverkant: databaseverbinding, invoercontrole, spamlimiet, regiocheck-query, Sam (`sam.ts`). Nooit importeren in code die in de browser draait |
| `src/lib/samVakken.ts` | Voorbeeldbedrijven en vaste begroeting van Sam in de demo. Veilig voor browser en server |
| `public/` | Bestanden die ongewijzigd online gaan: `.htaccess`, `llms.txt`, favicon |
| `src/pages/robots.txt.ts` | Maakt `robots.txt`. Volgt de schakelaar `INDEXEREN` in `src/config.ts` |
| `db/001_init.mysql.sql` | Het databaseschema voor MySQL 8 of MariaDB 10.5 en nieuwer |

## Database (MySQL)

Schema: `db/001_init.mysql.sql`. Importeer het in phpMyAdmin in de database die je in hPanel hebt gemaakt. Het mag vaker, bestaande tabellen en gegevens blijven staan. Tabellen:

- `scan_aanvragen`: elke scanaanvraag uit het formulier op /scan/
- `wachtlijst`: e-mailadressen uit de regiocheck (regio bezet of vak nog niet actief)
- `demo_aanvragen`: telefoonnummers uit de oude WhatsApp-variant van de demo. De demopagina gebruikt deze tabel en `/api/demo/` nu niet meer (zie "Sam in de demo"). Bewaar ze voor de WhatsApp-demo in fase 3
- `vakken`: welke vakken actief zijn (nu alleen Dakdekkers)
- `bezette_regios`: met de hand bijhouden welke regio per vak bezet is (bijv. vak Dakdekkers, regio `8911`). Een bezoeker is bezet als zijn postcode of plaats met deze regio begint
- `instellingen`: `founding_partners_over` (de site leest dit nog niet; de teller staat in `src/config.ts`)

Bezoekers praten nooit rechtstreeks met de database. De endpoints controleren de invoer, gebruiken prepared statements en slaan alleen op. Alle tijden staan in UTC.

**Omgevingsvariabelen** (hPanel op Hostinger, `.env` lokaal, zie `.env.example`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Optioneel: `DB_SSL` en `TRUST_PROXY_HOPS`. Voor de demo: `ANTHROPIC_API_KEY` (verplicht) en `SAM_MODEL` (optioneel). Er staan geen geheimen in de code.

**Spamlimiet** (in `src/server/limiet.ts`, in het geheugen, niets wordt bewaard): per IP maximaal 5 scans per uur, 5 wachtlijstregels per uur, 3 demo's per uur en 60 regiochecks per 10 minuten. Per mobiel nummer maximaal 2 scans en 1 demo per 24 uur. Het veld `bedrijfsnummer` is de honeypot: wie dat invult krijgt "gelukt" terug en er wordt niets opgeslagen. `TRUST_PROXY_HOPS` (standaard 1) is het aantal proxies voor de Node-app, nodig om het echte IP van de bezoeker te lezen.

## Sam in de demo (/demo/)

De demo is een echte chat met een AI-model. De bezoeker kiest een vak, schrijft een aanvraag en praat daarna met Sam in de telefoon op de pagina. Elk bericht gaat naar `/api/sam/`, dat het gesprek aan Claude (Anthropic) voorlegt en één antwoord teruggeeft. De server bewaart het gesprek niet en schrijft niets naar de database.

- **Sleutel:** `ANTHROPIC_API_KEY` in `.env` (lokaal) of als omgevingsvariabele in hPanel. Kun je in hPanel geen variabelen instellen, dan leest de app zelf een `.env` (`src/server/env.ts`): in de werkmap of tot 5 mappen boven `server/entry.mjs`. Zet dat bestand buiten `public_html`, bij voorkeur boven de app-map zodat een nieuwe deploy het niet wist. Zonder sleutel antwoordt de endpoint met 503 en toont de demo "Sam is even niet bereikbaar". Zet de sleutel nooit in de code of in GitHub. Maak bij voorkeur een aparte sleutel voor deze site, met een bestedingslimiet in de Anthropic Console.
- **Model:** standaard `claude-haiku-5-5`. Overschrijven kan met `SAM_MODEL` (bijvoorbeeld `claude-sonnet-5-5`). `ANTHROPIC_BASE_URL` is alleen bedoeld voor tests met een nepmodel.
- **Gedrag van Sam:** de instructies staan in `src/server/sam.ts` (functie `systeemPrompt`, vragen per vak in `PER_VAK`). Het eerste bericht met "Ik ben een AI" is vast (`begroeting` in `src/lib/samVakken.ts`) en wordt niet door het model geschreven. Het model stuurt per beurt een bericht, of het gesprek klaar is en een samenvatting voor de eigenaar. Gedachtestreepjes en opmaak worden uit het antwoord gehaald.
- **Voorbeeldbedrijven:** `src/lib/samVakken.ts`. Een nieuw vak toevoegen = daar een regel en in `PER_VAK` de vragen.
- **Grenzen:** een gesprek is hooguit 8 berichten van de bezoeker. Per IP maximaal 40 berichten per uur en alle bezoekers samen maximaal 1500 berichten per dag (`LIMIETEN.sam` en `LIMIETEN.samDag` in `src/server/limiet.ts`). Is het dagplafond bereikt, dan toont de demo dat het druk is.
- **Privacy:** berichten gaan naar Anthropic, daarom heeft de demo een eigen vinkje (niet vooraf aangevinkt). Dit staat in de privacyverklaring en op /ai-en-gegevens/.

**Volgende stap, Sam koppelen via WhatsApp (fase 3):** een webhook of een n8n-workflow die nieuwe rijen in `scan_aanvragen` en `demo_aanvragen` oppikt en het WhatsApp-bericht verstuurt. Dat is een volgend blok.

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
