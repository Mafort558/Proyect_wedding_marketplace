CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    venue_id INTEGER REFERENCES venues(id),
    service_id INTEGER REFERENCES services(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT review_target CHECK (venue_id IS NOT NULL OR service_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_reviews_venue_id ON reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_venue
    ON reviews(user_id, venue_id)
    WHERE venue_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_service
    ON reviews(user_id, service_id)
    WHERE service_id IS NOT NULL;
