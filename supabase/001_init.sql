-- Schema van Supabase-project "aanvragensysteem" (regio eu-central-1, Frankfurt).
-- Toegepast op 6 november 2026 in project keonxybrquukpioocsgw. Bewaard ter referentie en voor een nieuwe omgeving.

create table public.vakken (
  naam text primary key,
  actief boolean not null default false,
  volgorde int not null default 0
);
insert into public.vakken (naam, actief, volgorde) values
  ('Dakdekkers', true, 1), ('Hoveniers', false, 2), ('Renovatie en aannemers', false, 3),
  ('Installateurs', false, 4), ('Kozijnen en zonwering', false, 5), ('Ander vak', false, 6);

create table public.bezette_regios (
  id bigint generated always as identity primary key,
  vak text not null references public.vakken(naam) on update cascade,
  regio text not null,           -- postcode-begin (bijv. 8911) of plaatsnaam
  klant text,
  created_at timestamptz not null default now()
);

create table public.instellingen (
  sleutel text primary key,
  waarde jsonb not null,
  bijgewerkt timestamptz not null default now()
);
insert into public.instellingen (sleutel, waarde) values ('founding_partners_over', '5'::jsonb);

create table public.scan_aanvragen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  vak text not null check (char_length(vak) between 1 and 80),
  plaats text not null check (char_length(plaats) between 1 and 80),
  regio_status text check (regio_status in ('vrij','bezet','niet')),
  bedrijf text not null check (char_length(bedrijf) between 1 and 120),
  website text check (website is null or char_length(website) <= 200),
  voornaam text not null check (char_length(voornaam) between 1 and 80),
  mobiel text not null check (char_length(mobiel) between 6 and 30),
  email text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  offertes_per_jaar text check (offertes_per_jaar is null or char_length(offertes_per_jaar) <= 20),
  offerte_opvolging text check (offerte_opvolging is null or offerte_opvolging in ('ik bel na','soms','nooit')),
  oud_klanten text check (oud_klanten is null or oud_klanten in ('niets','soms iets','vast contact')),
  toestemming_proefaanvraag boolean not null default false,
  toestemming_whatsapp boolean not null default false,
  bron text check (bron is null or char_length(bron) <= 60),
  status text not null default 'nieuw' check (status in ('nieuw','opgepakt','gesprek','klant','nog_niet','afgewezen'))
);

create table public.wachtlijst (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  vak text not null check (char_length(vak) between 1 and 80),
  plaats text not null check (char_length(plaats) between 1 and 80),
  email text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  soort text not null check (soort in ('bezet','niet_actief'))
);

create table public.demo_aanvragen (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  vak text not null check (char_length(vak) between 1 and 80),
  mobiel text not null check (char_length(mobiel) between 6 and 30),
  toestemming boolean not null check (toestemming = true)
);

alter table public.vakken enable row level security;
alter table public.bezette_regios enable row level security;
alter table public.instellingen enable row level security;
alter table public.scan_aanvragen enable row level security;
alter table public.wachtlijst enable row level security;
alter table public.demo_aanvragen enable row level security;

create policy "vakken publiek leesbaar" on public.vakken for select to anon, authenticated using (true);
create policy "instellingen publiek leesbaar" on public.instellingen for select to anon, authenticated using (true);
create policy "scan aanvragen toevoegen" on public.scan_aanvragen for insert to anon with check (status = 'nieuw');
create policy "wachtlijst toevoegen" on public.wachtlijst for insert to anon with check (true);
create policy "demo toevoegen" on public.demo_aanvragen for insert to anon with check (toestemming = true);

grant select on public.vakken, public.instellingen to anon;
grant insert on public.scan_aanvragen, public.wachtlijst, public.demo_aanvragen to anon;
revoke select, update, delete on public.scan_aanvragen, public.wachtlijst, public.demo_aanvragen, public.bezette_regios from anon;

-- Regiocheck zonder de klantenlijst prijs te geven
create or replace function public.check_regio(p_vak text, p_plaats text)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when not exists (select 1 from public.vakken v where v.naam = p_vak and v.actief) then 'niet'
    when exists (
      select 1 from public.bezette_regios b
      where b.vak = p_vak and lower(trim(p_plaats)) like lower(trim(b.regio)) || '%'
    ) then 'bezet'
    else 'vrij'
  end;
$$;
revoke all on function public.check_regio(text, text) from public;
grant execute on function public.check_regio(text, text) to anon, authenticated;
