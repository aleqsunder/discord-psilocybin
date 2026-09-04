--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE psilocybin_promocodes (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL CHECK (length(name) <= 100),
    money INTEGER NOT NULL CHECK (money > 0),
    creator_id TEXT NOT NULL,
    activated_by_id TEXT DEFAULT NULL,
    created_at INTEGER NOT NULL,
    activated_at INTEGER DEFAULT NULL
);

CREATE INDEX idx_psilocybin_promocodes_creator ON psilocybin_promocodes(server_id, creator_id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_psilocybin_promocodes_creator;
DROP TABLE IF EXISTS psilocybin_promocodes;
