// Centrale instellingen. Pas hier contactgegevens en de Founding Partner-teller aan.

export const SITE = {
  name: 'Het Aanvragensysteem',
  domain: 'aanvragensysteem.nl',
  url: 'https://aanvragensysteem.nl',
  owner: 'Auke Jongbloed',
  // Contactgegevens. WhatsApp en werktijden zijn nog niet bekend: de wa.me-link hieronder is nog het ontwerpnummer.
  phoneDisplay: '+31 6 19 63 92 62',
  phoneHref: 'tel:+31619639262',
  whatsapp: 'https://wa.me/31850000000',
  email: 'auke@aanvragensysteem.nl',
  address: 'Emmastraat 16, 3134 CL Vlaardingen, Nederland',
  handelsnaamVan: 'aukemarketing',
  kvk: '51006197',
  btwId: 'NL002162452B85',
  hosting: 'Hostinger',
  // Startmaand van de eigen metingen
  meetingSinds: 'oktober 2026'
};

// Founding Partners: met de hand bijwerken. De site leest dit getal hier, niet uit de database.
export const FP_LEFT = 5;
export const FP_TOTAL = 5;

export const VAKKEN = ['Dakdekkers', 'Hoveniers', 'Renovatie en aannemers', 'Installateurs', 'Kozijnen en zonwering', 'Ander vak'];
export const ACTIEVE_VAKKEN = ['Dakdekkers'];

// Routes, gelijk aan de URL's in de PRD
export const R = {
  home: '/',
  systeem: '/aanvragensysteem/',
  voorWie: '/voor-wie/',
  dakdekkers: '/voor/dakdekkers/',
  prijs: '/prijs/',
  garantie: '/garantie/',
  overAuke: '/over-auke/',
  scan: '/scan/',
  bedankt: '/scan/bedankt/',
  regiocheck: '/regiocheck/',
  oudeOffertes: '/oude-offertes/',
  demo: '/demo/',
  zoWerkt: '/zo-werkt-deze-site/',
  resultaten: '/resultaten/',
  vragen: '/vragen/',
  contact: '/contact/',
  privacy: '/privacy/',
  voorwaarden: '/voorwaarden/',
  aiGegevens: '/ai-en-gegevens/',
  wettelijk: '/wettelijke-vermeldingen/'
};
