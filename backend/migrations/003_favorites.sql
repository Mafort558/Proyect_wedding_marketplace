CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    venue_id INTEGER REFERENCES venues(id),
    service_id INTEGER REFERENCES services(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT favorite_target CHECK (venue_id IS NOT NULL OR service_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_venue
    ON favorites(user_id, venue_id)
    WHERE venue_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_service
    ON favorites(user_id, service_id)
    WHERE service_id IS NOT NULL;
