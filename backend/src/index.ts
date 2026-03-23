import app from './server';

const PORT: number = 3000;

async function main() {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

main();