CREATE TABLE IF NOT EXISTS telemetry (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    reading_type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);