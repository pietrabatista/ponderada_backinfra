import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
const QUEUE_NAME = 'telemetry';

let channel: amqp.Channel;

export async function connectRabbitMQ() {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('Conectado ao RabbitMQ');
}

export async function publishToQueue(data: object): Promise<void> {
    if (!channel) throw new Error('RabbitMQ não conectado');

    channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );
}