CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);

CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    capacity INTEGER NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL,
    photos JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_provider_id ON venues(provider_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(12, 2) NOT NULL,
    photos JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    venue_id INTEGER REFERENCES venues(id),
    service_id INTEGER REFERENCES services(id),
    event_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT booking_target CHECK (venue_id IS NOT NULL OR service_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_venue_date_active
    ON bookings(venue_id, event_date)
    WHERE venue_id IS NOT NULL AND status IN ('deposit_paid', 'confirmed');

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    external_id VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
