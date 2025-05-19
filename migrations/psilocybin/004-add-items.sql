--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE psilocybin_items (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL CHECK (length(description) <= 1000),
    group_id INTEGER,
    quality_id INTEGER,
    effect TEXT DEFAULT NULL,
    image_path TEXT NULL,
    FOREIGN KEY (group_id) REFERENCES psilocybin_item_groups(id) ON DELETE SET NULL,
    FOREIGN KEY (quality_id) REFERENCES psilocybin_item_qualities(id) ON DELETE SET NULL
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE IF EXISTS psilocybin_items;
