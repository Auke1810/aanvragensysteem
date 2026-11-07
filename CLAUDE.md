# Werkafspraken voor Claude: aanvragensysteem.nl

Ik (Auke Jongbloed) bouw aanvragensysteem.nl, de website van Het Aanvragensysteem voor lokale vakbedrijven. De site is zelf ons eigen aanvragensysteem. Houd dit bestand kort.

## Lees eerst, vraag daarna
Voordat je mij iets vraagt over de stand van zaken (hosting, git, database, wat er live staat): lees `README.md`, `git log` en `git remote -v`. De stand en de besluiten staan in mijn Vault: `~/Documents/second-brain-auke/Context/nu.md`, de map `Projects/aanvragensysteem.nl/` (PRD, OFFER, README) en de laatste dagnotitie. Vraag alleen wat daar niet in staat. Bij tegenstrijdigheid wint de code, dan de README.

## Schrijfregels
- Nederlands, je-vorm, B1, korte zinnen.
- Nooit gedachtestreepjes (em-dashes), ook niet in code-commentaar, documenten of chat.
- Praten over aanvragen, klussen, offertes en terugbellen, niet over SEO of funnels.
- Geen verzonnen cases, cijfers of reviews. Wat er nog niet is, staat er eerlijk als "nog niet".
- Eén oranje hoofdknop per scherm: de gratis Aanvragen Scan.
- Naar buiten: "een heel snelle website". Astro is geen verkoopargument en WordPress noemen we niet.

## Werkafspraken
- Verander alleen wat ik vraag en houd het ontwerp gelijk.
- Vul nooit placeholders in met verzonnen gegevens (telefoon, SIRET, adres, werktijden). Vraag het mij.
- Geen geheimen in de code of in GitHub. Ze staan in de `.env` op Hostinger.
- Tabel- en kolomnamen blijven gelijk. Een databasewijziging is een nieuw bestand `db/00N_*.mysql.sql`. Ik draai dat zelf op de livedatabase.
- Push, deploy en verwijder niets zonder dat ik het vraag. Een push zet de site live: zeg erbij wat dat voor de livedatabase betekent.
- Claude commit en pusht niet zelf. Er zijn geen inloggegevens en geen git-identiteit. Ik doe `git commit` en `git push`.
- Claude bouwt niet op mijn Mac-`node_modules`. Bouw in een tijdelijke kopie buiten deze map. Ik draai lokaal `npm install` en `npm run build`.
- Controleer je werk (bouwen, formulieren testen) en noem aannames en eigen toevoegingen, ook als een wijziging andere teksten raakt (privacyverklaring, PRD, bedankpagina).
