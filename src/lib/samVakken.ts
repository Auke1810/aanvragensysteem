// Gegevens van de voorbeeldbedrijven in de demo "Speel zelf de klant".
// Veilig voor browser en server: hier staat niets geheims. De instructies voor het AI-model staan in src/server/sam.ts.
export type DemoVak = { bedrijf: string; eigenaar: string; voorbeeld: string };

export const DEMO_VAKKEN: Record<string, DemoVak> = {
  'Dakdekkers': { bedrijf: 'Dakwerken Voorbeeld', eigenaar: 'Jan', voorbeeld: 'Hoi, ik heb een lekkage bij de schoorsteen. Kunnen jullie komen kijken?' },
  'Hoveniers': { bedrijf: 'Tuinen Voorbeeld', eigenaar: 'Sander', voorbeeld: 'Wij willen onze achtertuin laten aanleggen, het liefst in het voorjaar.' },
  'Renovatie en aannemers': { bedrijf: 'Bouwbedrijf Voorbeeld', eigenaar: 'Erik', voorbeeld: 'We willen onze keuken uitbouwen. Kunnen jullie een offerte maken?' },
  'Installateurs': { bedrijf: 'Installatie Voorbeeld', eigenaar: 'Ruud', voorbeeld: 'Ik wil graag een offerte voor een warmtepomp.' }
};

export type Beurt = { van: 'klant' | 'sam'; tekst: string };

/** Het vaste eerste bericht van Sam. Hierin zegt hij dat hij een AI is (EU AI Act, art. 50). */
export const begroeting = (bedrijf: string) =>
  `Hoi, ik ben Sam, de digitale assistent van ${bedrijf}. Ik ben een AI. Bedankt voor je aanvraag.`;

/** Een gesprek duurt hooguit zoveel berichten van de bezoeker, de aanvraag meegeteld. */
export const MAX_KLANT_BERICHTEN = 8;
export const MAX_TEKENS_KLANT = 400;
