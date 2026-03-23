import { insertTelemetry } from '../src/db';

jest.mock('pg', () => {
    const mockQuery = jest.fn().mockResolvedValue({});
    return {
        Pool: jest.fn().mockImplementation(() => ({
            query: mockQuery
        }))
    };
});

describe('Database', () => {
    it('deve inserir dados de telemetria no banco', async () => {
        await insertTelemetry({
            device_id: 'sensor-01',
            timestamp: '2026-03-23T10:00:00Z',
            sensor_type: 'temperature',
            reading_type: 'analog',
            value: 23.5
        });
        const { Pool } = require('pg');
        const pool = new Pool();
        expect(pool.query).toHaveBeenCalled();
    });
});