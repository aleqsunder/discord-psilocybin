--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE psilocybin_item_groups (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL CHECK (length(description) <= 1000),
    cost INTEGER DEFAULT 1000,
    image_path TEXT NULL,
    is_default BOOLEAN DEFAULT(false),
    is_available_to_open BOOLEAN DEFAULT(false)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE IF EXISTS psilocybin_item_groups;
