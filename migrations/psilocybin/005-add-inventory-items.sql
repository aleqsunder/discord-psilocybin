--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE psilocybin_inventory_items (
    id INTEGER PRIMARY KEY,
    inventory_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    FOREIGN KEY (inventory_id) REFERENCES psilocybin_inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES psilocybin_items(id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE IF EXISTS psilocybin_inventory_items;
