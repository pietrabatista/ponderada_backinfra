import amqp from 'amqplib';
import { insertTelemetry } from './db';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
const QUEUE_NAME = 'telemetry';

export async function startConsumer(): Promise<void> {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1); 

    console.log('Consumer aguardando mensagens na fila...');

    channel.consume(QUEUE_NAME, async (msg) => {
    if (msg) {
        try {
            const data = JSON.parse(msg.content.toString());
            console.log('Mensagem recebida da fila:', data);

            await insertTelemetry(data);

            channel.ack(msg);
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);

            channel.nack(msg, false, false); 
            // false = não reencaminha (evita loop infinito)
        }
    }
});
}