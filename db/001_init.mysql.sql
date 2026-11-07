-- Schema voor aanvragensysteem.nl in MySQL 8 of MariaDB 10.5 en nieuwer.
--
-- Gebruik: maak in hPanel een database en een gebruiker aan, open phpMyAdmin,
-- kies die database en importeer dit bestand. Er staat bewust geen CREATE DATABASE
-- of USE in: je kiest de database zelf.
--
-- Ontwerpkeuzes voor MySQL (in vergelijking met Postgres):
--  * uuid: CHAR(36). De app maakt de uuid zelf (crypto.randomUUID), zodat het schema
--    op elke MySQL- of MariaDB-versie werkt.
--  * boolean: TINYINT(1), 0 of 1.
--  * timestamptz: DATETIME(3), altijd in UTC. De app zet elke verbinding op UTC.
--  * jsonb: JSON.
--  * Row Level Security bestaat niet in MySQL. De beveiliging zit in de endpoints
--    (src/pages/api/): bezoekers praten nooit rechtstreeks met de database.
--  * check_regio is geen opgeslagen functie meer maar een query in src/server/regio.ts.
--    Opgeslagen functies vragen op gedeelde hosting vaak extra rechten (SUPER of
--    log_bin_trust_function_creators). De logica is dezelfde.
--  * CHECK-constraints worden afgedwongen vanaf MySQL 8.0.16 en MariaDB 10.2.1.
--    Op oudere versies worden ze genegeerd. De endpoints controleren alles ook zelf.

CREATE TABLE IF NOT EXISTS vakken (
  naam     VARCHAR(80) NOT NULL,
  actief   TINYINT(1)  NOT NULL DEFAULT 0,
  volgorde INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (naam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO vakken (naam, actief, volgorde) VALUES
  ('Dakdekkers', 1, 1), ('Hoveniers', 0, 2), ('Renovatie en aannemers', 0, 3),
  ('Installateurs', 0, 4), ('Kozijnen en zonwering', 0, 5), ('Ander vak', 0, 6)
ON DUPLICATE KEY UPDATE naam = naam;

CREATE TABLE IF NOT EXISTS bezette_regios (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vak        VARCHAR(80)     NOT NULL,
  regio      VARCHAR(80)     NOT NULL,  -- postcode-begin (bijv. 8911) of plaatsnaam
  klant      VARCHAR(200)    NULL,
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_bezette_regios_vak FOREIGN KEY (vak) REFERENCES vakken (naam) ON UPDATE CASCADE,
  -- Eigen toevoeging: een lege regio zou elke plaats als bezet laten tellen.
  CONSTRAINT chk_bezette_regios_regio CHECK (CHAR_LENGTH(TRIM(regio)) BETWEEN 1 AND 80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS instellingen (
  sleutel    VARCHAR(80) NOT NULL,
  waarde     JSON        NOT NULL,
  bijgewerkt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (sleutel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO instellingen (sleutel, waarde) VALUES ('founding_partners_over', '5')
ON DUPLICATE KEY UPDATE sleutel = sleutel;

CREATE TABLE IF NOT EXISTS scan_aanvragen (
  id                        CHAR(36)     NOT NULL,
  created_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  vak                       VARCHAR(80)  NOT NULL,
  plaats                    VARCHAR(80)  NOT NULL,
  regio_status              VARCHAR(10)  NULL,
  bedrijf                   VARCHAR(120) NULL,
  website                   VARCHAR(200) NULL,
  voornaam                  VARCHAR(80)  NOT NULL,
  mobiel                    VARCHAR(30)  NOT NULL,
  email                     VARCHAR(160) NOT NULL,
  offertes_per_jaar         VARCHAR(20)  NULL,
  offerte_opvolging         VARCHAR(20)  NULL,
  oud_klanten               VARCHAR(20)  NULL,
  toestemming_proefaanvraag TINYINT(1)   NOT NULL DEFAULT 0,
  toestemming_whatsapp      TINYINT(1)   NOT NULL DEFAULT 0,
  bron                      VARCHAR(60)  NULL,
  status                    VARCHAR(20)  NOT NULL DEFAULT 'nieuw',
  PRIMARY KEY (id),
  KEY idx_scan_aanvragen_created_at (created_at),
  CONSTRAINT chk_scan_vak CHECK (CHAR_LENGTH(vak) BETWEEN 1 AND 80),
  CONSTRAINT chk_scan_plaats CHECK (CHAR_LENGTH(plaats) BETWEEN 1 AND 80),
  CONSTRAINT chk_scan_regio_status CHECK (regio_status IS NULL OR regio_status IN ('vrij','bezet','niet')),
  CONSTRAINT chk_scan_bedrijf CHECK (bedrijf IS NULL OR CHAR_LENGTH(bedrijf) BETWEEN 1 AND 120),
  CONSTRAINT chk_scan_website CHECK (website IS NULL OR CHAR_LENGTH(website) <= 200),
  CONSTRAINT chk_scan_voornaam CHECK (CHAR_LENGTH(voornaam) BETWEEN 1 AND 80),
  CONSTRAINT chk_scan_mobiel CHECK (CHAR_LENGTH(mobiel) BETWEEN 6 AND 30),
  CONSTRAINT chk_scan_email CHECK (CHAR_LENGTH(email) <= 160 AND email REGEXP '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  CONSTRAINT chk_scan_offertes CHECK (offertes_per_jaar IS NULL OR CHAR_LENGTH(offertes_per_jaar) <= 20),
  CONSTRAINT chk_scan_opvolging CHECK (offerte_opvolging IS NULL OR offerte_opvolging IN ('ik bel na','soms','nooit')),
  CONSTRAINT chk_scan_oud_klanten CHECK (oud_klanten IS NULL OR oud_klanten IN ('niets','soms iets','vast contact')),
  CONSTRAINT chk_scan_bron CHECK (bron IS NULL OR CHAR_LENGTH(bron) <= 60),
  CONSTRAINT chk_scan_status CHECK (status IN ('nieuw','opgepakt','gesprek','klant','nog_niet','afgewezen'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wachtlijst (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  vak        VARCHAR(80)     NOT NULL,
  plaats     VARCHAR(80)     NOT NULL,
  email      VARCHAR(160)    NOT NULL,
  soort      VARCHAR(20)     NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_wachtlijst_vak CHECK (CHAR_LENGTH(vak) BETWEEN 1 AND 80),
  CONSTRAINT chk_wachtlijst_plaats CHECK (CHAR_LENGTH(plaats) BETWEEN 1 AND 80),
  CONSTRAINT chk_wachtlijst_email CHECK (CHAR_LENGTH(email) <= 160 AND email REGEXP '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  CONSTRAINT chk_wachtlijst_soort CHECK (soort IN ('bezet','niet_actief'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS demo_aanvragen (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  vak          VARCHAR(80)     NOT NULL,
  mobiel       VARCHAR(30)     NOT NULL,
  toestemming  TINYINT(1)      NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_demo_vak CHECK (CHAR_LENGTH(vak) BETWEEN 1 AND 80),
  CONSTRAINT chk_demo_mobiel CHECK (CHAR_LENGTH(mobiel) BETWEEN 6 AND 30),
  CONSTRAINT chk_demo_toestemming CHECK (toestemming = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
