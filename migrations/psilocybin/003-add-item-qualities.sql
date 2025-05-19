--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE psilocybin_item_qualities (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL CHECK (color_hex LIKE '#______'),
    chance REAL NOT NULL,
    is_default BOOLEAN DEFAULT(false)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE IF EXISTS psilocybin_item_qualities;
