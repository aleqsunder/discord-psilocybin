--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- Пожизненная статистика игрока
CREATE TABLE psilocybin_casino_players (
    server_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    total_spent INTEGER NOT NULL DEFAULT 0,
    total_won INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (server_id, user_id)
);

-- Общий банк сервера: проигрыши одних игроков наполняют его, выигрыши других опустошают
CREATE TABLE psilocybin_casino_bank (
    server_id TEXT PRIMARY KEY NOT NULL,
    total_spent INTEGER NOT NULL DEFAULT 0,
    total_won INTEGER NOT NULL DEFAULT 0
);

-- Одна игра — одно сообщение. Игрок может держать несколько игр параллельно,
-- спины и выигрыш каждой живут только внутри своего сообщения
CREATE TABLE psilocybin_casino_sessions (
    message_id TEXT PRIMARY KEY NOT NULL,
    server_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    spins_left INTEGER NOT NULL DEFAULT 0,
    spins_bought INTEGER NOT NULL DEFAULT 0,
    session_won INTEGER NOT NULL DEFAULT 0,
    session_spent INTEGER NOT NULL DEFAULT 0,
    dry_streak INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_psilocybin_casino_sessions_user
    ON psilocybin_casino_sessions(server_id, user_id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_psilocybin_casino_sessions_user;
DROP TABLE IF EXISTS psilocybin_casino_sessions;
DROP TABLE IF EXISTS psilocybin_casino_bank;
DROP TABLE IF EXISTS psilocybin_casino_players;
