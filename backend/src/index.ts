import app from './server';
import { connectRabbitMQ } from './publisher';

const PORT = 3000;

async function main() {
    await connectRabbitMQ();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

main();