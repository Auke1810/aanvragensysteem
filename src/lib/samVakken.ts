// Gegevens van de voorbeeldbedrijven in de demo "Speel zelf de klant".
// Veilig voor browser en server: hier staat niets geheims. De instructies voor het AI-model staan in src/server/sam.ts.
export type DemoVak = { bedrijf: string; eigenaar: string; voorbeeld: string; eersteReactie: string };

export const DEMO_VAKKEN: Record<string, DemoVak> = {
  'Dakdekkers': {
    bedrijf: 'Dakwerken Voorbeeld', eigenaar: 'Jan',
    voorbeeld: 'Hoi, ik heb een lekkage bij de schoorsteen. Kunnen jullie komen kijken?',
    eersteReactie: 'Wat vervelend, een lekkage bij de schoorsteen. Ik zet je aanvraag bovenaan. Is het dak plat of schuin, en ongeveer hoe groot is het?'
  },
  'Hoveniers': {
    bedrijf: 'Tuinen Voorbeeld', eigenaar: 'Sander',
    voorbeeld: 'Wij willen onze achtertuin laten aanleggen, het liefst in het voorjaar.',
    eersteReactie: 'De achtertuin laten aanleggen in het voorjaar, helder. Hoe groot is de tuin ongeveer?'
  },
  'Renovatie en aannemers': {
    bedrijf: 'Bouwbedrijf Voorbeeld', eigenaar: 'Erik',
    voorbeeld: 'We willen onze keuken uitbouwen. Kunnen jullie een offerte maken?',
    eersteReactie: 'Een keuken uitbouwen, dat kan. Hoe groot wordt de uitbouw ongeveer?'
  },
  'Installateurs': {
    bedrijf: 'Installatie Voorbeeld', eigenaar: 'Ruud',
    voorbeeld: 'Ik wil graag een offerte voor een warmtepomp.',
    eersteReactie: 'Een offerte voor een warmtepomp, helder. Wat voor woning is het, en uit welk bouwjaar?'
  }
};

export type Beurt = { van: 'klant' | 'sam'; tekst: string };

/**
 * Het vaste bericht waarin Sam zich voorstelt en zegt dat hij een AI is (EU AI Act, art. 50).
 * Het komt direct NA zijn eerste inhoudelijke antwoord: eerst reageren op de klant, dan jezelf voorstellen.
 * Het model schrijft dit bericht niet, zodat de AI-vermelding er altijd staat en altijd gelijk luidt.
 */
export const begroeting = (bedrijf: string) =>
  `Overigens, ik ben Sam, de digitale assistent van ${bedrijf}. Ik ben een AI. Bedankt voor je aanvraag.`;

/** Een gesprek duurt hooguit zoveel berichten van de bezoeker, de aanvraag meegeteld. */
export const MAX_KLANT_BERICHTEN = 8;
export const MAX_TEKENS_KLANT = 400;
