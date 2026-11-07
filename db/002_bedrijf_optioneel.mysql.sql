-- Bedrijfsnaam is niet meer verplicht in het scanformulier (7 november 2026).
-- Voer dit eenmalig uit op een bestaande database. Nieuwe databases krijgen het al via 001_init.mysql.sql.
-- Bestaande rijen blijven ongemoeid.
ALTER TABLE scan_aanvragen DROP CONSTRAINT chk_scan_bedrijf;
ALTER TABLE scan_aanvragen MODIFY bedrijf VARCHAR(120) NULL;
ALTER TABLE scan_aanvragen ADD CONSTRAINT chk_scan_bedrijf CHECK (bedrijf IS NULL OR CHAR_LENGTH(bedrijf) BETWEEN 1 AND 120);
