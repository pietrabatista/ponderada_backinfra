import { insertTelemetry } from '../src/db';
import { startConsumer } from '../src/consumer';

jest.mock('../src/db', () => ({
    initDb: jest.fn().mockResolvedValue(undefined),
    insertTelemetry: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('amqplib', () => ({
    connect: jest.fn().mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({
            assertQueue: jest.fn().mockResolvedValue(undefined),
            prefetch: jest.fn(),
            consume: jest.fn().mockImplementation((queue, callback) => {
                const msg = {
                    content: Buffer.from(JSON.stringify({
                        device_id: 'sensor-01',
                        timestamp: '2026-03-23T10:00:00Z',
                        sensor_type: 'temperature',
                        reading_type: 'analog',
                        value: 23.5
                    })),
                    ack: jest.fn()
                };
                callback(msg);
            }),
            ack: jest.fn()
        })
    })
}));

describe('Consumer', () => {
    it('deve consumir mensagem e inserir no banco', async () => {
        await startConsumer();

        expect(insertTelemetry).toHaveBeenCalledWith({
            device_id: 'sensor-01',
            timestamp: '2026-03-23T10:00:00Z',
            sensor_type: 'temperature',
            reading_type: 'analog',
            value: 23.5
        });
    });
});