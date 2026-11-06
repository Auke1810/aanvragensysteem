// Centrale instellingen. Pas hier contactgegevens en de Founding Partner-teller aan.

export const SITE = {
  name: 'Het Aanvragensysteem',
  domain: 'aanvragensysteem.nl',
  url: 'https://aanvragensysteem.nl',
  owner: 'Auke Jongbloed',
  // Placeholders uit het ontwerp: vervangen door de echte gegevens
  phoneDisplay: '+31 85 000 00 00',
  phoneHref: 'tel:+31850000000',
  whatsapp: 'https://wa.me/31850000000',
  email: 'auke@aanvragensysteem.nl',
  siret: '[nog invullen]',
  hosting: 'Hostinger (EU)',
  // Startmaand van de eigen metingen
  meetingSinds: 'oktober 2026'
};

// Founding Partners: met de hand bijwerken (ook te zetten via Supabase-tabel instellingen)
export const FP_LEFT = 5;
export const FP_TOTAL = 5;

export const VAKKEN = ['Dakdekkers', 'Hoveniers', 'Renovatie en aannemers', 'Installateurs', 'Kozijnen en zonwering', 'Ander vak'];
export const ACTIEVE_VAKKEN = ['Dakdekkers'];

// Supabase (publieke sleutel, veilig in de browser door Row Level Security)
export const SUPABASE = {
  url: import.meta.env.PUBLIC_SUPABASE_URL ?? '',
  key: import.meta.env.PUBLIC_SUPABASE_KEY ?? ''
};

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
  contact: '/contact/'
};
