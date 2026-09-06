--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- Вместо трёх выплат за 3/4/5 символов у символа одна базовая выплата,
-- а длина линии добавляет бонус множителем
CREATE TABLE psilocybin_casino_symbols_new (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 10 CHECK (weight >= 0),
    payout REAL NOT NULL DEFAULT 0 CHECK (payout >= 0)
);

INSERT INTO psilocybin_casino_symbols_new (id, server_id, name, image_path, weight, payout)
SELECT id, server_id, name, image_path, weight, payout_three
FROM psilocybin_casino_symbols;

DROP INDEX IF EXISTS idx_psilocybin_casino_symbols_server;
DROP TABLE psilocybin_casino_symbols;
ALTER TABLE psilocybin_casino_symbols_new RENAME TO psilocybin_casino_symbols;

CREATE INDEX idx_psilocybin_casino_symbols_server
    ON psilocybin_casino_symbols(server_id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_psilocybin_casino_symbols_server;
DROP TABLE IF EXISTS psilocybin_casino_symbols;
