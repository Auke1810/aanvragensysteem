export type Msg = { sam?: boolean; klant?: boolean; sys?: boolean; text: string; time?: string };
const S = (text: string, time: string): Msg => ({ sam: true, text, time });
const K = (text: string, time: string): Msg => ({ klant: true, text, time });
const Y = (text: string): Msg => ({ sys: true, text });

export type Preset = { title: string; subtitle: string; in: string; out: string; inLabel?: string; outLabel?: string; status: string; caption: string; msgs: Msg[] };

export const PRESETS: Record<string, Preset> = {
  home: {
    title: 'Sam', subtitle: 'digitale assistent van Auke · AI', in: '21.04', out: '21.05', status: '21.09',
    caption: 'Zo reageert Sam op je scanaanvraag. Voorbeeld met verzonnen gegevens.',
    msgs: [Y('21.04 · Aanvraag via aanvragensysteem.nl: Gratis Aanvragen Scan'),
      S('Hoi, ik ben Sam, de digitale assistent van Auke. Ik ben een AI. Bedankt voor je aanvraag voor de scan.', '21.05'),
      S('Mag ik je twee korte vragen stellen? Dan kan Auke zich goed voorbereiden.', '21.05'),
      K('Ja hoor.', '21.07'),
      S('Hoeveel offertes stuur je ongeveer per jaar?', '21.07'),
      K('Een stuk of 150.', '21.08'),
      S('Dank je. Auke belt je donderdag om 16.00 uur. Past dat?', '21.09')]
  },
  dak: {
    title: 'Sam · Dakwerken Voorbeeld', subtitle: 'digitale assistent · AI', in: '07:42', out: '07:43', status: '07:46',
    caption: 'Voorbeeld met verzonnen gegevens.',
    msgs: [Y('07:42 · Aanvraag via de website: daklekkage'),
      S('Hoi, ik ben Sam, de digitale assistent van Dakwerken Voorbeeld. Ik ben een AI. Bedankt voor je aanvraag.', '07:43'),
      S('Gaat het om een lekkage, een renovatie of isolatie van je dak?', '07:43'),
      K('Lekkage. Er komt water binnen bij de schoorsteen.', '07:45'),
      S('Vervelend. Ik zet je bovenaan, Jan belt je zo snel mogelijk terug.', '07:46')]
  },
  bedankt: {
    title: 'Sam', subtitle: 'digitale assistent van Auke · AI', in: 'nu', out: 'binnen 2 min', status: 'nu',
    caption: 'Zo ziet het eerste bericht eruit.',
    msgs: [Y('Aanvraag ontvangen: Gratis Aanvragen Scan'),
      S('Hoi, ik ben Sam, de digitale assistent van Auke. Ik ben een AI. Bedankt voor je aanvraag voor de scan.', 'nu'),
      S('Mag ik je twee korte vragen stellen? Dan kan Auke zich goed voorbereiden.', 'nu')]
  },
  gemist: {
    title: 'Sam · Dakwerken Voorbeeld', subtitle: 'digitale assistent · AI', in: '14:31', out: '14:32', status: '14:32',
    caption: 'Voorbeeld met verzonnen gegevens.',
    msgs: [Y('14:31 · Gemiste oproep'),
      S('Hoi, je belde net met Dakwerken Voorbeeld. Ik ben Sam, de digitale assistent. Ik ben een AI.', '14:32'),
      S('Jan staat op een dak. Waar gaat het om? Ik zet je bovenaan, Jan belt je zo snel mogelijk terug.', '14:32')]
  },
  oud: {
    title: 'Sam · Dakwerken Voorbeeld', subtitle: 'digitale assistent · AI', in: '10:15', out: '10:31', inLabel: 'bericht', outLabel: 'antwoord klant', status: '10:31',
    caption: 'Voorbeeld met verzonnen gegevens.',
    msgs: [S('Hoi Linda, dit is een automatisch bericht namens Dakwerken Voorbeeld. Je vroeg vorig jaar een offerte aan voor je dak. Voor de winter is een goed moment om het te laten nakijken. Zal Jan je even bellen? Liever geen berichten meer? Stuur STOP.', '10:15'),
      K('Ja, graag. Na 17.00 uur is prima.', '10:31')]
  }
};
