# aanvragensysteem.nl

De website van Het Aanvragensysteem, gebouwd met [Astro](https://astro.build) als statische site. Het ontwerp komt uit Claude Design, de inhoud uit de PRD van 30 september 2026.

## Lokaal draaien

Je hebt Node.js 22 of nieuwer nodig.

```bash
npm install
npm run dev        # ontwikkelserver op http://localhost:4321
npm run build      # maakt de echte site in dist/
npm run preview    # bekijk de gebouwde site lokaal
```

## Structuur

| Map | Wat erin staat |
|---|---|
| `src/pages/` | Eén bestand per pagina. De bestandsnaam is de URL (`prijs.astro` wordt `/prijs/`) |
| `src/components/` | Header, footer, knop, telefoon met Sam, regiocheck, rekensom, live-label |
| `src/layouts/Base.astro` | De HTML-basis van elke pagina: titel, meta, schema, header en footer |
| `src/styles/` | Designtokens (kleuren, typografie) en algemene stijlen |
| `src/config.ts` | Contactgegevens, Founding Partner-teller, vakken en routes. **Hier vul je de placeholders in** |
| `src/lib/db.ts` | De koppeling met Supabase (alleen `fetch`, geen extra bibliotheek) |
| `public/` | Bestanden die ongewijzigd online gaan: `.htaccess`, `robots.txt`, `llms.txt`, favicon |
| `supabase/001_init.sql` | Het databaseschema |

## Database (Supabase)

Project `aanvragensysteem` in Frankfurt (eu-central-1). Tabellen:

- `scan_aanvragen`: elke scanaanvraag uit het formulier op /scan/
- `wachtlijst`: e-mailadressen uit de regiocheck (regio bezet of vak nog niet actief)
- `demo_aanvragen`: telefoonnummers uit de demo "Speel zelf de klant"
- `vakken`: welke vakken actief zijn (nu alleen Dakdekkers)
- `bezette_regios`: met de hand bijhouden welke regio per vak bezet is (bijv. vak Dakdekkers, regio `8911`)
- `instellingen`: o.a. `founding_partners_over`

Bezoekers kunnen alleen toevoegen, nooit lezen (Row Level Security). De regiocheck gebruikt de functie `check_regio`, die alleen vrij, bezet of niet teruggeeft.

De publieke sleutels staan in `.env` (zie `.env.example`).

**Volgende stap, Sam koppelen:** maak in Supabase een Database Webhook op `insert` in `scan_aanvragen` en `demo_aanvragen` naar een n8n-workflow die het WhatsApp-bericht verstuurt.

## Online zetten op Hostinger

De site is statisch, dus elk Hostinger-pakket werkt.

**Aanbevolen: automatisch via GitHub.** Bij elke push naar `main` bouwt GitHub de site en zet `dist/` via FTP in `public_html` (`.github/workflows/deploy.yml`). Eenmalig instellen:

1. Push deze map naar een (privé) GitHub-repository.
2. Zet in GitHub onder Settings › Secrets and variables › Actions deze secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (uit hPanel › Bestanden › FTP-accounts), `PUBLIC_SUPABASE_URL` en `PUBLIC_SUPABASE_KEY` (uit `.env`).
3. Push of start de workflow met de hand onder Actions.

**Met de hand:** `npm run build` en upload de inhoud van `dist/` naar `public_html` via de bestandsbeheerder of FTP.

Domeinen: zet aanvragensysteem.be en aanvraagsysteem.nl in hPanel als doorverwijzing naar https://aanvragensysteem.nl, en oudeoffertes.nl naar https://aanvragensysteem.nl/oude-offertes/.

## Nog in te vullen

- Telefoonnummer en WhatsApp-nummer (nu placeholder +31 85 000 00 00) in `src/config.ts`
- SIRET, adres en werktijden (contactpagina en footer)
- Juridische pagina's: privacy, voorwaarden, AI en gegevens, wettelijke vermeldingen
- Kennisbank (/kennisbank/), staat in de PRD maar nog niet in het ontwerp
- Video en extra foto's op Over Auke
