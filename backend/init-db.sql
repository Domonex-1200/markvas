-- ============================================================
--  MarkdownCanvas  MySQL 초기화 스크립트
--  실행 방법: mysql -u root -p < init-db.sql
-- ============================================================

-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS markdowncanvas
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE markdowncanvas;

-- 2. 전용 계정 생성 (선택 – root 직접 사용 시 생략 가능)
-- CREATE USER IF NOT EXISTS 'markvas'@'localhost' IDENTIFIED BY '123412';
-- GRANT ALL PRIVILEGES ON markdowncanvas.* TO 'markvas'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================
--  테이블은 Spring Boot 기동 시 ddl-auto=update 로 자동 생성됩니다.
--  아래 DDL 은 참고용 스키마입니다.
-- ============================================================

-- ── 사용자 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    role                VARCHAR(20)  NOT NULL DEFAULT 'USER',
    refresh_token_hash  TEXT,
    nickname            VARCHAR(50),
    phone               VARCHAR(20),
    birthday            DATE,
    gender              VARCHAR(10),
    profile_picture_url VARCHAR(500),
    created_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 개발자 신청 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS developer_applications (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id      VARCHAR(36)  NOT NULL,
    reason       TEXT         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    review_note  TEXT,
    reviewed_by  VARCHAR(36),
    applied_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    reviewed_at  DATETIME(6),
    CONSTRAINT fk_devapp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 에셋 ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    type         VARCHAR(20)  NOT NULL,
    metadata     JSON,
    file_path    VARCHAR(500),
    author_id    VARCHAR(36)  NOT NULL,
    pricing_type VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    price_cents  INT          NOT NULL DEFAULT 0,
    currency     VARCHAR(10)  NOT NULL DEFAULT 'USD',
    status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_asset_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 에셋 버전 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_versions (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    asset_id   VARCHAR(36)  NOT NULL,
    version    VARCHAR(50)  NOT NULL,
    file_path  VARCHAR(500),
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ver_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 설치 내역 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_assets (
    id           VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id      VARCHAR(36) NOT NULL,
    asset_id     VARCHAR(36) NOT NULL,
    installed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ua_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_ua_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_asset (user_id, asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 소유권 (구매/무료 취득) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS entitlements (
    id         VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    asset_id   VARCHAR(36) NOT NULL,
    source     VARCHAR(20) NOT NULL DEFAULT 'FREE',
    granted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ent_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_ent_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE KEY uq_entitlement (user_id, asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 장바구니 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id       VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id  VARCHAR(36) NOT NULL,
    asset_id VARCHAR(36) NOT NULL,
    added_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_cart_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_cart_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE KEY uq_cart (user_id, asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 위시리스트 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
    id       VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id  VARCHAR(36) NOT NULL,
    asset_id VARCHAR(36) NOT NULL,
    added_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_wish_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_wish_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE KEY uq_wishlist (user_id, asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 앱 릴리즈 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_releases (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    version       VARCHAR(50)  NOT NULL,
    platform      VARCHAR(20)  NOT NULL,
    channel       VARCHAR(20)  NOT NULL DEFAULT 'stable',
    download_url  VARCHAR(1000) NOT NULL,
    checksum      VARCHAR(255) NOT NULL,
    signature     VARCHAR(1000),
    release_notes TEXT,
    published_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
SELECT '✅ markdowncanvas 데이터베이스 초기화 완료' AS result;
-- ============================================================