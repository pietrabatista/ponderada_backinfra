import { publishToQueue } from '../src/publisher';

jest.mock('amqplib', () => ({
    connect: jest.fn().mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({
            assertQueue: jest.fn().mockResolvedValue(undefined),
            sendToQueue: jest.fn().mockReturnValue(true),
            close: jest.fn().mockResolvedValue(undefined)
        }),
        close: jest.fn().mockResolvedValue(undefined)
    })
}));

describe('Publisher', () => {
    it('deve publicar mensagem na fila do RabbitMQ', async () => {
        const data = {
            device_id: 'sensor-01',
            timestamp: '2026-03-23T10:00:00Z',
            sensor_type: 'temperature',
            reading_type: 'analog',
            value: 23.5
        };

        await expect(publishToQueue(data)).resolves.not.toThrow();

        const amqp = require('amqplib');
        expect(amqp.connect).toHaveBeenCalled();
    });
});