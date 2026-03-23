import request from 'supertest';
import app from '../src/server';

jest.mock('../src/publisher', () => ({
    publishToQueue: jest.fn().mockResolvedValue(undefined)
}));

describe('POST /telemetry', () => {
    it('deve retornar 201 ao receber dados de telemetria analógica', async () => {
        const response = await request(app)
            .post('/telemetry')
            .send({
                device_id: 'sensor-01',
                timestamp: '2026-03-23T10:00:00Z',
                sensor_type: 'temperature',
                reading_type: 'analog',
                value: 23.5
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Dados recebidos com sucesso!');
    });

    it('deve retornar 201 ao receber leitura discreta', async () => {
        const response = await request(app)
            .post('/telemetry')
            .send({
                device_id: 'sensor-02',
                timestamp: '2026-03-23T10:00:00Z',
                sensor_type: 'presence',
                reading_type: 'discrete',
                value: 1
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Dados recebidos com sucesso!');
    });

    it('deve chamar o publisher com os dados corretos', async () => {
        const { publishToQueue } = require('../src/publisher');

        await request(app)
            .post('/telemetry')
            .send({
                device_id: 'sensor-03',
                timestamp: '2026-03-23T10:00:00Z',
                sensor_type: 'humidity',
                reading_type: 'analog',
                value: 65.0
            });

        expect(publishToQueue).toHaveBeenCalledWith({
            device_id: 'sensor-03',
            timestamp: '2026-03-23T10:00:00Z',
            sensor_type: 'humidity',
            reading_type: 'analog',
            value: 65.0
        });
    });
});