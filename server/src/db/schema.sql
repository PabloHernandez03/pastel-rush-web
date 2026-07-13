-- Pastel Rush — database schema (MySQL / MariaDB)
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL,
  email         VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('jugador','admin') NOT NULL DEFAULT 'jugador',
  sexo          ENUM('Masculino','Femenino','Otro') DEFAULT NULL,
  edad          TINYINT UNSIGNED DEFAULT NULL,
  pais          VARCHAR(60)  DEFAULT NULL,
  ciudad        VARCHAR(80)  DEFAULT NULL,
  grado         VARCHAR(60)  DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- One row per finished game (partida).
CREATE TABLE IF NOT EXISTS games (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED NOT NULL,
  level_id         SMALLINT UNSIGNED NOT NULL,
  level_name       VARCHAR(80)  DEFAULT NULL,
  world_index      TINYINT UNSIGNED DEFAULT NULL,
  score            INT NOT NULL DEFAULT 0,
  stars            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  delivered_orders SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  burned_count     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_games_user (user_id),
  KEY idx_games_level (level_id),
  KEY idx_games_score (score),
  CONSTRAINT fk_games_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Best result per (user, level) — the online replacement for progress.cfg.
CREATE TABLE IF NOT EXISTS level_progress (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED NOT NULL,
  level_id          SMALLINT UNSIGNED NOT NULL,
  best_stars        TINYINT UNSIGNED NOT NULL DEFAULT 0,
  best_score        INT NOT NULL DEFAULT 0,
  best_time_seconds INT UNSIGNED DEFAULT NULL,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress_user_level (user_id, level_id),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
