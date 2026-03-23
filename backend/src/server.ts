import express, { Request, Response } from 'express';
import { publishToQueue } from './publisher';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('RODANDOOO!');
});

app.post('/telemetry', async (req, res) => {
    try {
        const data = req.body;
        await publishToQueue(data);

        res.status(201).json({ message: 'Dados recebidos com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar dados' });
    }
});

export default app;