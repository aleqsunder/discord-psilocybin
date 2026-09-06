--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- Фрукты казино настраиваются админом. Бонусные символы (билеты и множители)
-- живут в коде и не редактируются
CREATE TABLE psilocybin_casino_symbols (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 10 CHECK (weight >= 0),
    payout_three REAL NOT NULL DEFAULT 0,
    payout_four REAL NOT NULL DEFAULT 0,
    payout_five REAL NOT NULL DEFAULT 0
);

CREATE INDEX idx_psilocybin_casino_symbols_server
    ON psilocybin_casino_symbols(server_id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_psilocybin_casino_symbols_server;
DROP TABLE IF EXISTS psilocybin_casino_symbols;
