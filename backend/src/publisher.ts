import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
const QUEUE_NAME = 'telemetry';

export async function publishToQueue(data: object): Promise<void> {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log('Mensagem enviada para a fila:', data);

    await channel.close();
    await connection.close();
}