--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE psilocybin_settings (
    server_id TEXT PRIMARY KEY NOT NULL,
    available_to_use INTEGER DEFAULT 0 CHECK(available_to_use IN (0, 1)),
    available_for_creating_invite INTEGER DEFAULT 1 CHECK(available_for_creating_invite IN (0, 1))
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE IF EXISTS psilocybin_settings;
