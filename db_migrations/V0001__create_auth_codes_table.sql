CREATE TABLE IF NOT EXISTS auth_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    ip VARCHAR(45) NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_codes_phone ON auth_codes(phone);
CREATE INDEX IF NOT EXISTS idx_auth_codes_created ON auth_codes(created_at DESC);