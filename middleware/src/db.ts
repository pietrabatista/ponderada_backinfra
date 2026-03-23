import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/telemetry'
});

export async function insertTelemetry(data: {
    device_id: string;
    timestamp: string;
    sensor_type: string;
    reading_type: string;
    value: number;
}): Promise<void> {
    await pool.query(
        `INSERT INTO telemetry (device_id, timestamp, sensor_type, reading_type, value)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.device_id, data.timestamp, data.sensor_type, data.reading_type, data.value]
    );
    console.log('Dados inseridos no banco:', data);
}